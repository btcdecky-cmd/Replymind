import { createServerFn } from "@tanstack/react-start";
import { analyzeConversation } from "@/lib/ai/conversation-analyzer";
import { rewriteReply } from "@/lib/ai/reply-generator";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { rateLimitOrThrow } from "@/lib/security/rate-limit";
import { validateImageDataUrl } from "@/lib/security/upload";
import { saveImageBlob, purgeExpiredImages } from "@/lib/storage/images";
import { DEFAULT_GENERATE_TONES, isToneId, type ToneId } from "@/lib/tones";
import { UsageService } from "@/lib/usage/usage-service";
import { newId } from "@/lib/utils";
import { ensurePrefs } from "./preferences";
import { z } from "zod";

function titleFrom(summary: string, transcribed: string, source: string) {
  const seed = transcribed.split("\n").filter(Boolean).at(-1) || summary;
  const cut = seed.replace(/\s+/g, " ").trim().slice(0, 42);
  if (cut) return cut + (seed.length > 42 ? "…" : "");
  if (source === "screenshot") return "Screenshot conversation";
  if (source === "paste") return "Pasted conversation";
  return "New message";
}

export const analyzeInput = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      imageDataUrl: z.string().max(6_000_000).optional(),
      conversationText: z.string().max(12_000).optional(),
      instruction: z.string().max(500).optional(),
      styles: z.array(z.string()).max(8).optional(),
      conversationId: z.string().optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    rateLimitOrThrow(`analyze:${context.userId}`, 12, 10 * 60 * 1000);
    await purgeExpiredImages().catch(() => undefined);
    await UsageService.assertWithinLimit(context.userId, "analysis");
    const suggestionCount = Math.max(1, data.styles?.length ?? DEFAULT_GENERATE_TONES.length);
    await UsageService.assertWithinLimit(context.userId, "generation", suggestionCount);

    const prefs = await ensurePrefs(context.userId);
    const styles = (data.styles?.filter(isToneId) as ToneId[] | undefined)?.length
      ? (data.styles!.filter(isToneId) as ToneId[])
      : DEFAULT_GENERATE_TONES.includes(prefs.defaultTone)
        ? DEFAULT_GENERATE_TONES
        : ([prefs.defaultTone, ...DEFAULT_GENERATE_TONES.filter((t) => t !== prefs.defaultTone)].slice(
            0,
            5,
          ) as ToneId[]);

    let imageDataUrl: string | undefined;
    let imageMeta: { mime: string; base64: string; byteSize: number } | null = null;
    if (data.imageDataUrl) {
      const checked = validateImageDataUrl(data.imageDataUrl);
      if (!checked.ok) throw new Error(checked.error);
      imageDataUrl = `data:${checked.mime};base64,${checked.base64}`;
      imageMeta = { mime: checked.mime, base64: checked.base64, byteSize: checked.bytes.byteLength };
    }

    const source = imageMeta ? "screenshot" : data.conversationText && data.conversationText.includes("\n") ? "paste" : "message";

    const result = await analyzeConversation({
      imageDataUrl,
      conversationText: data.conversationText,
      instruction: data.instruction,
      styles,
      emojiPreference: prefs.emojiPreference,
    });
    if (!result.ok) throw new Error(result.error);

    const sql = await getSql();
    const conversationId = data.conversationId ?? newId();
    const title = titleFrom(result.data.summary, result.data.transcribed, source);

    if (data.conversationId) {
      const owned = await sql<{ id: string }>`
        select id from conversations where id = ${conversationId} and user_id = ${context.userId} limit 1
      `;
      if (!owned[0]) throw new Error("Conversation not found.");
      await sql`
        update conversations
        set instruction = ${data.instruction?.trim() || null},
            updated_at = now()
        where id = ${conversationId} and user_id = ${context.userId}
      `;
    } else {
      await sql`
        insert into conversations (id, user_id, title, source, instruction)
        values (${conversationId}, ${context.userId}, ${title}, ${source}, ${data.instruction?.trim() || null})
      `;
    }

    if (result.data.transcribed) {
      await sql`
        insert into conversation_messages (id, conversation_id, user_id, role, body)
        values (${newId()}, ${conversationId}, ${context.userId}, ${"transcript"}, ${result.data.transcribed})
      `;
    }

    const analysisId = newId();
    await sql`
      insert into ai_analyses (
        id, conversation_id, user_id, summary, tone, intent, relationship,
        latest_message, transcribed, needs_clarification, clarification
      ) values (
        ${analysisId}, ${conversationId}, ${context.userId}, ${result.data.summary},
        ${result.data.tone}, ${result.data.intent}, ${result.data.relationship},
        ${result.data.latestMessage}, ${result.data.transcribed},
        ${result.data.needsClarification}, ${result.data.clarification}
      )
    `;

    const savedSuggestions: Array<{ id: string; style: string; body: string }> = [];
    for (const suggestion of result.data.suggestions) {
      const id = newId();
      await sql`
        insert into reply_suggestions (id, conversation_id, analysis_id, user_id, style, body)
        values (${id}, ${conversationId}, ${analysisId}, ${context.userId}, ${suggestion.style}, ${suggestion.text})
      `;
      savedSuggestions.push({ id, style: suggestion.style, body: suggestion.text });
    }

    if (imageMeta && prefs.keepScreenshots) {
      await saveImageBlob({
        userId: context.userId,
        conversationId,
        mimeType: imageMeta.mime,
        base64: imageMeta.base64,
        byteSize: imageMeta.byteSize,
        retained: true,
      });
      await UsageService.record(context.userId, "storage_bytes", imageMeta.byteSize);
    } else if (imageMeta) {
      await saveImageBlob({
        userId: context.userId,
        conversationId,
        mimeType: imageMeta.mime,
        base64: imageMeta.base64,
        byteSize: imageMeta.byteSize,
        retained: false,
      });
    }

    await UsageService.record(context.userId, "analysis", 1);
    await UsageService.record(context.userId, "generation", savedSuggestions.length);

    return {
      conversationId,
      summary: result.data.summary,
      tone: result.data.tone,
      intent: result.data.intent,
      relationship: result.data.relationship,
      latestMessage: result.data.latestMessage,
      needsClarification: result.data.needsClarification,
      clarification: result.data.clarification,
      suggestions: savedSuggestions,
    };
  });

export const rewriteSuggestion = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      conversationId: z.string().min(1),
      suggestionId: z.string().min(1),
      action: z.string().min(1),
    }),
  )
  .handler(async ({ context, data }) => {
    rateLimitOrThrow(`rewrite:${context.userId}`, 30, 10 * 60 * 1000);
    await UsageService.assertWithinLimit(context.userId, "rewrite");
    const sql = await getSql();
    const rows = await sql<{
      id: string;
      style: string;
      body: string;
      conversation_id: string;
    }>`
      select id, style, body, conversation_id
      from reply_suggestions
      where id = ${data.suggestionId} and user_id = ${context.userId} and conversation_id = ${data.conversationId}
      limit 1
    `;
    const row = rows[0];
    if (!row) throw new Error("Reply not found.");

    const analyses = await sql<{
      summary: string | null;
      latest_message: string | null;
    }>`
      select summary, latest_message from ai_analyses
      where conversation_id = ${data.conversationId} and user_id = ${context.userId}
      order by created_at desc limit 1
    `;
    const convos = await sql<{ instruction: string | null }>`
      select instruction from conversations
      where id = ${data.conversationId} and user_id = ${context.userId} limit 1
    `;

    const rewritten = await rewriteReply({
      original: row.body,
      action: data.action,
      style: row.style,
      instruction: convos[0]?.instruction ?? undefined,
      summary: analyses[0]?.summary ?? undefined,
      latestMessage: analyses[0]?.latest_message ?? undefined,
    });
    if (!rewritten.ok) throw new Error(rewritten.error);

    const id = newId();
    await sql`
      insert into reply_suggestions (id, conversation_id, analysis_id, user_id, style, body)
      values (${id}, ${data.conversationId}, ${null}, ${context.userId}, ${row.style}, ${rewritten.text})
    `;
    await sql`update conversations set updated_at = now() where id = ${data.conversationId} and user_id = ${context.userId}`;
    await UsageService.record(context.userId, "rewrite", 1);
    return { id, style: row.style, body: rewritten.text };
  });

export const regenerateStyle = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      conversationId: z.string().min(1),
      style: z.string().min(1),
      instruction: z.string().max(500).optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    rateLimitOrThrow(`regen:${context.userId}`, 20, 10 * 60 * 1000);
    await UsageService.assertWithinLimit(context.userId, "generation", 1);
    if (!isToneId(data.style)) throw new Error("Unknown reply style.");
    const sql = await getSql();
    const convos = await sql<{
      id: string;
      instruction: string | null;
    }>`
      select id, instruction from conversations
      where id = ${data.conversationId} and user_id = ${context.userId} limit 1
    `;
    if (!convos[0]) throw new Error("Conversation not found.");
    const analyses = await sql<{
      transcribed: string | null;
      latest_message: string | null;
      summary: string | null;
    }>`
      select transcribed, latest_message, summary from ai_analyses
      where conversation_id = ${data.conversationId} and user_id = ${context.userId}
      order by created_at desc limit 1
    `;
    const prefs = await ensurePrefs(context.userId);
    const transcript = analyses[0]?.transcribed || analyses[0]?.latest_message || "";
    if (!transcript) throw new Error("There's nothing to regenerate from yet.");

    const result = await analyzeConversation({
      conversationText: transcript,
      instruction: data.instruction ?? convos[0].instruction ?? undefined,
      styles: [data.style],
      emojiPreference: prefs.emojiPreference,
    });
    if (!result.ok) throw new Error(result.error);
    const suggestion = result.data.suggestions[0];
    if (!suggestion) throw new Error("Could not write a new reply.");
    const id = newId();
    await sql`
      insert into reply_suggestions (id, conversation_id, analysis_id, user_id, style, body)
      values (${id}, ${data.conversationId}, ${null}, ${context.userId}, ${suggestion.style}, ${suggestion.text})
    `;
    await sql`update conversations set updated_at = now() where id = ${data.conversationId} and user_id = ${context.userId}`;
    await UsageService.record(context.userId, "generation", 1);
    return { id, style: suggestion.style, body: suggestion.text, summary: result.data.summary };
  });
