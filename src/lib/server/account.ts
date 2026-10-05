import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";

export const deleteAccountData = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const userId = context.userId;
    await sql`delete from uploaded_images where user_id = ${userId}`;
    await sql`delete from reply_suggestions where user_id = ${userId}`;
    await sql`delete from ai_analyses where user_id = ${userId}`;
    await sql`delete from conversation_messages where user_id = ${userId}`;
    await sql`delete from conversations where user_id = ${userId}`;
    await sql`delete from usage_records where user_id = ${userId}`;
    await sql`delete from user_preferences where user_id = ${userId}`;
    return { ok: true as const };
  });
