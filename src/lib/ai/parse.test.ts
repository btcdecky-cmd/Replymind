import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { extractJsonObject, parseAnalysis, parseRewrite } from "./parse.ts";

describe("extractJsonObject", () => {
  it("parses a raw object", () => {
    const value = extractJsonObject('{"a":1}') as { a: number };
    assert.equal(value.a, 1);
  });

  it("recovers JSON wrapped in prose", () => {
    const value = extractJsonObject('Sure.\n{"text":"hi"}') as { text: string };
    assert.equal(value.text, "hi");
  });

  it("rejects empty input", () => {
    assert.throws(() => extractJsonObject("   "), /Empty/);
  });
});

describe("parseAnalysis", () => {
  it("maps suggestions onto requested tones", () => {
    const result = parseAnalysis(
      JSON.stringify({
        summary: "She seems frustrated.",
        tone: "frustrated",
        intent: "reassure",
        relationship: "dating",
        latestMessage: "This feels complicated.",
        transcribed: "A: hey\nB: This feels complicated.",
        needsClarification: false,
        suggestions: [
          { style: "natural", text: "I get it." },
          { style: "romantic", text: "My love, we can go slow." },
        ],
      }),
      ["natural", "romantic"],
    );
    assert.equal(result.summary, "She seems frustrated.");
    assert.equal(result.suggestions.length, 2);
    assert.equal(result.suggestions[0].style, "natural");
  });

  it("throws when there are no replies and no clarification", () => {
    assert.throws(
      () =>
        parseAnalysis(
          JSON.stringify({ summary: "x", suggestions: [] }),
          ["natural"],
        ),
      /could not draft/i,
    );
  });

  it("allows empty suggestions when clarification is needed", () => {
    const result = parseAnalysis(
      JSON.stringify({
        summary: "Unclear.",
        needsClarification: true,
        clarification: "Can you paste the last two messages?",
        suggestions: [],
      }),
      ["natural"],
    );
    assert.equal(result.needsClarification, true);
  });
});

describe("parseRewrite", () => {
  it("reads text from JSON", () => {
    assert.equal(parseRewrite('{"text":"Okay."}', "fallback"), "Okay.");
  });

  it("uses plain text when JSON is missing", () => {
    assert.equal(parseRewrite("Let's go slow.", "keep"), "Let's go slow.");
  });

  it("falls back when the payload is empty", () => {
    assert.equal(parseRewrite("   ", "keep"), "keep");
  });
});
