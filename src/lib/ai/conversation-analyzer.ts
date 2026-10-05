import type { ToneId } from "@/lib/tones";
import { completeJson, isAiConfigured } from "./ai-client";
import { parseAnalysis } from "./parse";
import { ANALYST_SYSTEM_PROMPT, analysisUserPrompt } from "./prompts";
import type { AnalysisResult, ChatMessage } from "./types";

export async function analyzeConversation(input: {
  imageDataUrl?: string;
  conversationText?: string;
  instruction?: string;
  styles: ToneId[];
  emojiPreference: "auto" | "always" | "never";
}): Promise<{ ok: true; data: AnalysisResult } | { ok: false; error: string }> {
  if (!isAiConfigured()) {
    return { ok: false, error: "AI is not available in this environment." };
  }
  if (!input.imageDataUrl && !input.conversationText?.trim()) {
    return { ok: false, error: "Add a screenshot, paste a conversation, or type the latest message." };
  }

  const prompt = analysisUserPrompt({
    instruction: input.instruction,
    conversationText: input.conversationText,
    styles: input.styles,
    emojiPreference: input.emojiPreference,
    hasImage: Boolean(input.imageDataUrl),
  });

  const userContent: ChatMessage["content"] = input.imageDataUrl
    ? [
        { type: "image_url", image_url: { url: input.imageDataUrl } },
        { type: "text", text: prompt },
      ]
    : prompt;

  const result = await completeJson(
    [
      { role: "system", content: ANALYST_SYSTEM_PROMPT },
      { role: "user", content: userContent },
    ],
    2200,
  );

  if (!result.ok) return result;

  try {
    return { ok: true, data: parseAnalysis(result.text, input.styles) };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not understand the assistant response.",
    };
  }
}
