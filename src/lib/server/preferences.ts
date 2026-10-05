import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { isToneId, type ToneId } from "@/lib/tones";
import { z } from "zod";

export type Appearance = "system" | "light" | "dark";
export type EmojiPref = "auto" | "always" | "never";

export type UserPrefs = {
  defaultTone: ToneId;
  emojiPreference: EmojiPref;
  appearance: Appearance;
  keepScreenshots: boolean;
  plan: "free" | "premium";
};

const DEFAULTS: UserPrefs = {
  defaultTone: "natural",
  emojiPreference: "auto",
  appearance: "system",
  keepScreenshots: false,
  plan: "free",
};

async function readPrefs(userId: string): Promise<UserPrefs> {
  const sql = await getSql();
  const rows = await sql<{
    default_tone: string;
    emoji_preference: string;
    appearance: string;
    keep_screenshots: boolean;
    plan: string;
  }>`
    select default_tone, emoji_preference, appearance, keep_screenshots, plan
    from user_preferences where user_id = ${userId} limit 1
  `;
  const row = rows[0];
  if (!row) return DEFAULTS;
  return {
    defaultTone: isToneId(row.default_tone) ? row.default_tone : "natural",
    emojiPreference: (["auto", "always", "never"] as const).includes(row.emoji_preference as EmojiPref)
      ? (row.emoji_preference as EmojiPref)
      : "auto",
    appearance: (["system", "light", "dark"] as const).includes(row.appearance as Appearance)
      ? (row.appearance as Appearance)
      : "system",
    keepScreenshots: Boolean(row.keep_screenshots),
    plan: row.plan === "premium" ? "premium" : "free",
  };
}

export async function ensurePrefs(userId: string) {
  const sql = await getSql();
  await sql`
    insert into user_preferences (user_id)
    values (${userId})
    on conflict (user_id) do nothing
  `;
  return readPrefs(userId);
}

export const getPreferences = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => ensurePrefs(context.userId));

export const updatePreferences = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      defaultTone: z.string().optional(),
      emojiPreference: z.enum(["auto", "always", "never"]).optional(),
      appearance: z.enum(["system", "light", "dark"]).optional(),
      keepScreenshots: z.boolean().optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    await ensurePrefs(context.userId);
    const current = await readPrefs(context.userId);
    const next: UserPrefs = {
      ...current,
      defaultTone: data.defaultTone && isToneId(data.defaultTone) ? data.defaultTone : current.defaultTone,
      emojiPreference: data.emojiPreference ?? current.emojiPreference,
      appearance: data.appearance ?? current.appearance,
      keepScreenshots: data.keepScreenshots ?? current.keepScreenshots,
    };
    const sql = await getSql();
    await sql`
      update user_preferences
      set default_tone = ${next.defaultTone},
          emoji_preference = ${next.emojiPreference},
          appearance = ${next.appearance},
          keep_screenshots = ${next.keepScreenshots},
          updated_at = now()
      where user_id = ${context.userId}
    `;
    return next;
  });
