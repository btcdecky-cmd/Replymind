import { completeJson, isAiConfigured } from "./ai-client";
import { parseRewrite } from "./parse";
import { REWRITE_SYSTEM_PROMPT, rewriteUserPrompt } from "./prompts";

export async function rewriteReply(input: {
  original: string;
  action: string;
  style: string;
  instruction?: string;
  summary?: string;
  latestMessage?: string;
}): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  if (!isAiConfigured()) {
    return { ok: false, error: "AI is not available in this environment." };
  }
  const result = await completeJson(
    [
      { role: "system", content: REWRITE_SYSTEM_PROMPT },
      { role: "user", content: rewriteUserPrompt(input) },
    ],
    400,
  );
  if (!result.ok) return result;
  return { ok: true, text: parseRewrite(result.text, input.original) };
}
