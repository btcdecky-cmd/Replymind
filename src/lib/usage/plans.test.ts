import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PLANS, isPlanId } from "./plans.ts";

describe("plans", () => {
  it("keeps free limits below premium", () => {
    assert.ok(PLANS.free.limits.analysis < PLANS.premium.limits.analysis);
    assert.ok(PLANS.free.limits.generation < PLANS.premium.limits.generation);
  });

  it("does not encode limits as zero", () => {
    for (const kind of ["analysis", "generation", "rewrite", "storage_bytes"] as const) {
      assert.ok(PLANS.free.limits[kind] > 0);
    }
  });

  it("narrows plan ids", () => {
    assert.equal(isPlanId("free"), true);
    assert.equal(isPlanId("enterprise"), false);
  });
});
