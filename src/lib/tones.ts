export const TONE_IDS = [
  "natural",
  "warm",
  "romantic",
  "short",
  "reassuring",
  "sweet",
  "calm",
  "flirty",
  "playful",
  "apologetic",
  "confident",
] as const;

export type ToneId = (typeof TONE_IDS)[number];

export type ToneMeta = {
  id: ToneId;
  label: string;
  hint: string;
  icon: "message" | "heart" | "spark" | "minimize" | "shield" | "smile" | "leaf" | "flame" | "laugh" | "hand" | "bolt";
};

export const TONES: ToneMeta[] = [
  { id: "natural", label: "Natural", hint: "Sounds like you", icon: "message" },
  { id: "warm", label: "Warm", hint: "Kind and open", icon: "spark" },
  { id: "romantic", label: "Romantic", hint: "Tender and close", icon: "heart" },
  { id: "short", label: "Very short", hint: "A few words", icon: "minimize" },
  { id: "reassuring", label: "Reassuring", hint: "Steady and safe", icon: "shield" },
  { id: "sweet", label: "Sweet", hint: "Soft and caring", icon: "smile" },
  { id: "calm", label: "Calm", hint: "Unhurried", icon: "leaf" },
  { id: "flirty", label: "Flirty", hint: "Playful heat", icon: "flame" },
  { id: "playful", label: "Playful", hint: "Light and fun", icon: "laugh" },
  { id: "apologetic", label: "Apologetic", hint: "Owns the moment", icon: "hand" },
  { id: "confident", label: "Confident", hint: "Clear and sure", icon: "bolt" },
];

export const DEFAULT_GENERATE_TONES: ToneId[] = [
  "natural",
  "warm",
  "romantic",
  "short",
  "reassuring",
];

export const TONE_MAP = Object.fromEntries(TONES.map((t) => [t.id, t])) as Record<ToneId, ToneMeta>;

export function isToneId(value: string): value is ToneId {
  return (TONES as ToneMeta[]).some((t) => t.id === value);
}

export const REWRITE_ACTIONS = [
  { id: "shorten", label: "Make it shorter" },
  { id: "soften", label: "Make it softer" },
  { id: "romanticize", label: "Make it more romantic" },
  { id: "naturalize", label: "Make it sound natural" },
  { id: "strip-emoji", label: "Remove emojis" },
  { id: "add-emoji", label: "Add emojis" },
  { id: "rewrite", label: "Rewrite" },
] as const;

export type RewriteAction = (typeof REWRITE_ACTIONS)[number]["id"];
