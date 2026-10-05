export type PlanId = "free" | "premium";

export type UsageKind = "analysis" | "generation" | "rewrite" | "storage_bytes";

export type PlanLimits = Record<UsageKind, number>;

export const PLANS: Record<PlanId, { label: string; limits: PlanLimits }> = {
  free: {
    label: "Free",
    limits: {
      analysis: 20,
      generation: 60,
      rewrite: 80,
      storage_bytes: 25 * 1024 * 1024,
    },
  },
  premium: {
    label: "Premium",
    limits: {
      analysis: 500,
      generation: 2000,
      rewrite: 2000,
      storage_bytes: 500 * 1024 * 1024,
    },
  },
};

export function isPlanId(value: string): value is PlanId {
  return value === "free" || value === "premium";
}
