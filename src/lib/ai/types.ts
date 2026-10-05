import type { ToneId } from "../tones.ts";

export type ConversationSource = "screenshot" | "paste" | "message";

export type AnalysisResult = {
  summary: string;
  tone: string;
  intent: string;
  relationship: string;
  latestMessage: string;
  transcribed: string;
  needsClarification: boolean;
  clarification: string | null;
  suggestions: Array<{ style: ToneId; text: string }>;
};

export type ChatContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string | ChatContentPart[];
};
