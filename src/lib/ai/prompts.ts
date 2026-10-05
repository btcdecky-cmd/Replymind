import { TONES, type ToneId } from "@/lib/tones";

export const ANALYST_SYSTEM_PROMPT = `You are ReplyMind, a private communication assistant.
You help the user reply to a conversation they already had. You are not in the conversation.

Rules:
- Read the screenshot and/or pasted text carefully.
- Prioritize the latest message when deciding what to reply to.
- Do not invent names, facts, events, or relationship details that are not visible.
- If the image is unreadable, cropped, or not a conversation, set needsClarification to true and ask a short, specific question. Do not guess.
- Never expose chain-of-thought, hidden reasoning, or analysis notes.
- The user-facing summary must be one or two short sentences about how the other person seems to feel and what the moment needs. Example: "She seems frustrated and may feel like things are becoming complicated."
- Replies must sound human. No corporate tone, no "I hope this message finds you well", no repeating the whole thread.
- Each reply must address the latest message directly.
- Match the requested style. Keep length honest: "short" is 1–2 sentences or less.
- Do not claim to know the people personally.
- Preserve the user's intended meaning from any instruction they give.
- If they asked for no emojis, do not use emojis. If they asked for emojis, use them sparingly and naturally.
- Output ONLY valid JSON matching the schema. No markdown.`;

export function analysisUserPrompt(input: {
  instruction?: string;
  conversationText?: string;
  styles: ToneId[];
  emojiPreference: "auto" | "always" | "never";
  hasImage: boolean;
}) {
  const styleGuide = input.styles
    .map((id) => {
      const t = TONES.find((x) => x.id === id);
      return t ? `- ${t.id}: ${t.label} — ${t.hint}` : `- ${id}`;
    })
    .join("\n");

  const emoji =
    input.emojiPreference === "always"
      ? "Use a light, natural emoji where it helps (not every sentence)."
      : input.emojiPreference === "never"
        ? "Do not use any emojis."
        : "Use emojis only when they feel natural for that style (romantic/short may, calm/natural usually should not).";

  const instruction = input.instruction?.trim()
    ? `The user wants the reply to communicate: "${input.instruction.trim()}"`
    : "No extra instruction was given. Infer a considerate, honest reply.";

  const text = input.conversationText?.trim()
    ? `Conversation text supplied by the user:\n"""${input.conversationText.trim()}"""`
    : input.hasImage
      ? "No separate transcript was pasted. Read the screenshot."
      : "No conversation text or screenshot was provided.";

  return `${text}

${instruction}

${emoji}

Generate one reply for each of these styles:
${styleGuide}

Return JSON with this exact shape:
{
  "summary": "short user-facing read of the moment",
  "tone": "one-word or short phrase for the other person's apparent tone",
  "intent": "what a good reply should accomplish",
  "relationship": "apparent relationship if visible, else unknown",
  "latestMessage": "the last message the user should reply to, quoted or closely paraphrased",
  "transcribed": "a compact transcript of the visible thread, or the pasted text cleaned up",
  "needsClarification": false,
  "clarification": null,
  "suggestions": [
    { "style": "natural", "text": "..." }
  ]
}`;
}

export const REWRITE_SYSTEM_PROMPT = `You are ReplyMind. Rewrite a single reply.
Keep the same intended meaning. Sound human. Do not add new facts.
Do not explain. Return JSON: { "text": "the rewritten reply" }`;

export function rewriteUserPrompt(input: {
  original: string;
  action: string;
  style: string;
  instruction?: string;
  summary?: string;
  latestMessage?: string;
}) {
  const actionLine =
    {
      shorten: "Make it shorter. Keep the heart of it.",
      soften: "Make it softer and less sharp, without becoming vague.",
      romanticize: "Make it more romantic and tender, still natural.",
      naturalize: "Make it sound like a real person texting, not a writer.",
      "strip-emoji": "Remove every emoji. Keep the words.",
      "add-emoji": "Add one or two fitting emojis. Do not overdo it.",
      rewrite: "Rewrite with the same meaning and a fresh phrasing.",
    }[input.action] ?? "Rewrite with the same meaning.";

  return `Style: ${input.style}
Latest message being answered: ${input.latestMessage || "unknown"}
Context: ${input.summary || "none"}
User instruction: ${input.instruction || "none"}
Original reply:
"""${input.original}"""

Task: ${actionLine}`;
}
