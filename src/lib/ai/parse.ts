import { isToneId, type ToneId } from "../tones.ts";
import type { AnalysisResult } from "./types.ts";

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function asBool(value: unknown) {
  return value === true;
}

export function extractJsonObject(raw: string): unknown {
  const trimmed = raw.trim();
  if (!trimmed) throw new Error("Empty AI response");

  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new Error("AI returned an unreadable response");
  }
}

export function parseAnalysis(raw: string, requested: ToneId[]): AnalysisResult {
  const parsed = extractJsonObject(raw) as Record<string, unknown>;
  const suggestionsRaw = Array.isArray(parsed.suggestions) ? parsed.suggestions : [];
  const suggestions: AnalysisResult["suggestions"] = [];

  for (const item of suggestionsRaw) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const style = asString(rec.style).toLowerCase();
    const text = asString(rec.text);
    if (!text) continue;
    const tone: ToneId = isToneId(style) ? style : requested[suggestions.length] ?? "natural";
    suggestions.push({ style: tone, text });
  }

  if (suggestions.length === 0 && !asBool(parsed.needsClarification)) {
    throw new Error("The assistant could not draft replies from that conversation.");
  }

  const summary =
    asString(parsed.summary) ||
    "This looks like a moment that needs a careful, honest reply.";

  return {
    summary,
    tone: asString(parsed.tone, "unclear"),
    intent: asString(parsed.intent),
    relationship: asString(parsed.relationship, "unknown"),
    latestMessage: asString(parsed.latestMessage),
    transcribed: asString(parsed.transcribed),
    needsClarification: asBool(parsed.needsClarification),
    clarification: asString(parsed.clarification) || null,
    suggestions,
  };
}

export function parseRewrite(raw: string, fallback: string) {
  try {
    const parsed = extractJsonObject(raw) as Record<string, unknown>;
    const text = asString(parsed.text);
    if (text) return text;
  } catch {
    const trimmed = raw.trim();
    if (trimmed && trimmed.length < 2000) return trimmed.replace(/^"|"$/g, "");
  }
  return fallback;
}
