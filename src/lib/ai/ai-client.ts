import type { ChatMessage } from "./types";

const PRIMARY_MODEL = "grok-4.7";
const FALLBACK_MODEL = "grok-4.5";

export type AiCallResult =
  | { ok: true; text: string; model: string }
  | { ok: false; error: string; status?: number };

function getApiKey() {
  return typeof process !== "undefined" ? process.env.XAI_API_KEY : undefined;
}

export function isAiConfigured() {
  return Boolean(getApiKey());
}

async function completeOnce(model: string, messages: ChatMessage[], maxTokens: number): Promise<AiCallResult> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return { ok: false, error: "AI is not available in this environment." };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45_000);

  try {
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: maxTokens,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      if (res.status === 429) {
        return { ok: false, error: "Too many requests. Please wait a moment and try again.", status: 429 };
      }
      if (res.status === 401 || res.status === 403) {
        return { ok: false, error: "AI is not available in this environment.", status: res.status };
      }
      return {
        ok: false,
        error: `xAI API error ${res.status}${body ? `: ${body.slice(0, 180)}` : ""}`,
        status: res.status,
      };
    }

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = json.choices?.[0]?.message?.content ?? "";
    if (!text) return { ok: false, error: "The assistant returned an empty reply." };
    return { ok: true, text, model };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return { ok: false, error: "The assistant took too long. Try a clearer screenshot or shorter text." };
    }
    return { ok: false, error: "Could not reach the assistant. Check your connection and try again." };
  } finally {
    clearTimeout(timer);
  }
}

export async function completeJson(messages: ChatMessage[], maxTokens = 1800): Promise<AiCallResult> {
  const first = await completeOnce(PRIMARY_MODEL, messages, maxTokens);
  if (first.ok) return first;
  const modelMissing =
    first.status === 404 ||
    (first.error ?? "").toLowerCase().includes("model") && (first.error ?? "").toLowerCase().includes("not");
  if (modelMissing) {
    return completeOnce(FALLBACK_MODEL, messages, maxTokens);
  }
  return first;
}
