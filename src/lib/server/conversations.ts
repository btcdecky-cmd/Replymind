import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { deleteConversationImages, getOwnedImage, toDataUrl } from "@/lib/storage/images";
import { z } from "zod";

export type ConversationListItem = {
  id: string;
  title: string;
  source: string;
  archived: boolean;
  updatedAt: string;
  preview: string | null;
};

export type ConversationDetail = {
  id: string;
  title: string;
  source: string;
  archived: boolean;
  instruction: string | null;
  createdAt: string;
  updatedAt: string;
  summary: string | null;
  tone: string | null;
  latestMessage: string | null;
  transcribed: string | null;
  needsClarification: boolean;
  clarification: string | null;
  imageDataUrl: string | null;
  suggestions: Array<{ id: string; style: string; body: string; createdAt: string }>;
};

export const listConversations = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ archived: z.boolean().optional() }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const archived = data.archived ?? false;
    const rows = await sql<{
      id: string;
      title: string;
      source: string;
      archived: boolean;
      updated_at: string;
      preview: string | null;
    }>`
      select c.id, c.title, c.source, c.archived, c.updated_at,
        (
          select a.summary from ai_analyses a
          where a.conversation_id = c.id and a.user_id = ${context.userId}
          order by a.created_at desc limit 1
        ) as preview
      from conversations c
      where c.user_id = ${context.userId} and c.archived = ${archived}
      order by c.updated_at desc
      limit 80
    `;
    return rows.map(
      (r): ConversationListItem => ({
        id: r.id,
        title: r.title,
        source: r.source,
        archived: r.archived,
        updatedAt: r.updated_at,
        preview: r.preview,
      }),
    );
  });

export const getConversation = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string().min(1) }))
  .handler(async ({ context, data }): Promise<ConversationDetail | null> => {
    const sql = await getSql();
    const convos = await sql<{
      id: string;
      title: string;
      source: string;
      archived: boolean;
      instruction: string | null;
      created_at: string;
      updated_at: string;
    }>`
      select id, title, source, archived, instruction, created_at, updated_at
      from conversations
      where id = ${data.id} and user_id = ${context.userId}
      limit 1
    `;
    const convo = convos[0];
    if (!convo) return null;

    const analyses = await sql<{
      summary: string;
      tone: string | null;
      latest_message: string | null;
      transcribed: string | null;
      needs_clarification: boolean;
      clarification: string | null;
    }>`
      select summary, tone, latest_message, transcribed, needs_clarification, clarification
      from ai_analyses
      where conversation_id = ${data.id} and user_id = ${context.userId}
      order by created_at desc
      limit 1
    `;
    const analysis = analyses[0];

    const suggestions = await sql<{
      id: string;
      style: string;
      body: string;
      created_at: string;
    }>`
      select id, style, body, created_at
      from reply_suggestions
      where conversation_id = ${data.id} and user_id = ${context.userId}
      order by created_at desc
      limit 40
    `;

    const images = await sql<{ id: string }>`
      select id from uploaded_images
      where conversation_id = ${data.id} and user_id = ${context.userId}
      order by created_at desc
      limit 1
    `;
    let imageDataUrl: string | null = null;
    if (images[0]) {
      const img = await getOwnedImage(context.userId, images[0].id);
      if (img) imageDataUrl = toDataUrl(img);
    }

    return {
      id: convo.id,
      title: convo.title,
      source: convo.source,
      archived: convo.archived,
      instruction: convo.instruction,
      createdAt: convo.created_at,
      updatedAt: convo.updated_at,
      summary: analysis?.summary ?? null,
      tone: analysis?.tone ?? null,
      latestMessage: analysis?.latest_message ?? null,
      transcribed: analysis?.transcribed ?? null,
      needsClarification: Boolean(analysis?.needs_clarification),
      clarification: analysis?.clarification ?? null,
      imageDataUrl,
      suggestions: suggestions.map((s) => ({
        id: s.id,
        style: s.style,
        body: s.body,
        createdAt: s.created_at,
      })),
    };
  });

export const renameConversation = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string().min(1), title: z.string().min(1).max(80) }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`
      update conversations
      set title = ${data.title.trim()}, updated_at = now()
      where id = ${data.id} and user_id = ${context.userId}
    `;
    return { ok: true as const };
  });

export const archiveConversation = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string().min(1), archived: z.boolean() }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`
      update conversations
      set archived = ${data.archived}, updated_at = now()
      where id = ${data.id} and user_id = ${context.userId}
    `;
    return { ok: true as const };
  });

export const deleteConversation = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string().min(1) }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await deleteConversationImages(context.userId, data.id);
    await sql`delete from reply_suggestions where conversation_id = ${data.id} and user_id = ${context.userId}`;
    await sql`delete from ai_analyses where conversation_id = ${data.id} and user_id = ${context.userId}`;
    await sql`delete from conversation_messages where conversation_id = ${data.id} and user_id = ${context.userId}`;
    await sql`delete from conversations where id = ${data.id} and user_id = ${context.userId}`;
    return { ok: true as const };
  });

export const deleteConversationScreenshot = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string().min(1) }))
  .handler(async ({ context, data }) => {
    await deleteConversationImages(context.userId, data.id);
    return { ok: true as const };
  });
