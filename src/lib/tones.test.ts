import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DEFAULT_GENERATE_TONES, isToneId } from "./tones.ts";

describe("tones", () => {
  it("includes the five default generate styles", () => {
    assert.deepEqual(DEFAULT_GENERATE_TONES, ["natural", "warm", "romantic", "short", "reassuring"]);
  });

  it("rejects unknown styles", () => {
    assert.equal(isToneId("natural"), true);
    assert.equal(isToneId("sarcastic"), false);
  });
});
