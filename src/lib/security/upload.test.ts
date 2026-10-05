import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isAllowedMime, validateImageDataUrl } from "./upload.ts";

function jpegDataUrl() {
  const bytes = Uint8Array.from([0xff, 0xd8, 0xff, 0xdb, 0x00, 0x43, ...Array.from({ length: 40 }, () => 0x00)]);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return `data:image/jpeg;base64,${btoa(bin)}`;
}

describe("upload validation", () => {
  it("accepts jpeg magic bytes", () => {
    const result = validateImageDataUrl(jpegDataUrl());
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.mime, "image/jpeg");
  });

  it("rejects missing data", () => {
    const result = validateImageDataUrl("");
    assert.equal(result.ok, false);
  });

  it("rejects non-image payloads", () => {
    const result = validateImageDataUrl("data:text/plain;base64,aGVsbG8=");
    assert.equal(result.ok, false);
  });

  it("rejects spoofed mime with wrong magic", () => {
    const result = validateImageDataUrl("data:image/png;base64,aGVsbG8taGVsbG8taGVsbG8taGVsbG8=");
    assert.equal(result.ok, false);
  });

  it("allows known screenshot mime types", () => {
    assert.equal(isAllowedMime("image/png"), true);
    assert.equal(isAllowedMime("application/pdf"), false);
  });
});
