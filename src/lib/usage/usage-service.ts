import { getSql } from "@/lib/db";
import { monthKey, newId } from "@/lib/utils";
import { PLANS, isPlanId, type PlanId, type UsageKind } from "./plans";

export type UsageSnapshot = {
  plan: PlanId;
  monthKey: string;
  used: Record<UsageKind, number>;
  limits: Record<UsageKind, number>;
};

const KINDS: UsageKind[] = ["analysis", "generation", "rewrite", "storage_bytes"];

export class UsageService {
  static limitsFor(plan: PlanId) {
    return PLANS[plan].limits;
  }

  static async getPlan(userId: string): Promise<PlanId> {
    const sql = await getSql();
    const rows = await sql<{ plan: string }>`
      select plan from user_preferences where user_id = ${userId} limit 1
    `;
    const plan = rows[0]?.plan;
    return plan && isPlanId(plan) ? plan : "free";
  }

  static async snapshot(userId: string): Promise<UsageSnapshot> {
    const sql = await getSql();
    const plan = await this.getPlan(userId);
    const key = monthKey();
    const rows = await sql<{ kind: string; total: number }>`
      select kind, coalesce(sum(units), 0)::int as total
      from usage_records
      where user_id = ${userId} and month_key = ${key}
      group by kind
    `;
    const used: Record<UsageKind, number> = {
      analysis: 0,
      generation: 0,
      rewrite: 0,
      storage_bytes: 0,
    };
    for (const row of rows) {
      if (KINDS.includes(row.kind as UsageKind)) {
        used[row.kind as UsageKind] = Number(row.total) || 0;
      }
    }
    return { plan, monthKey: key, used, limits: this.limitsFor(plan) };
  }

  static async assertWithinLimit(userId: string, kind: UsageKind, extra = 1) {
    const snap = await this.snapshot(userId);
    const limit = snap.limits[kind];
    if (snap.used[kind] + extra > limit) {
      const label =
        kind === "analysis"
          ? "screenshot reads"
          : kind === "generation"
            ? "reply drafts"
            : kind === "rewrite"
              ? "rewrites"
              : "storage";
      throw new Error(
        snap.plan === "premium"
          ? `You've reached this month's ${label} limit.`
          : `You've used this month's free ${label}. Upgrade in Settings for more.`,
      );
    }
    return snap;
  }

  static async record(userId: string, kind: UsageKind, units = 1) {
    const sql = await getSql();
    await sql`
      insert into usage_records (id, user_id, kind, units, month_key)
      values (${newId()}, ${userId}, ${kind}, ${units}, ${monthKey()})
    `;
  }
}
