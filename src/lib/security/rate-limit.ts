type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true as const, remaining: limit - 1 };
  }
  if (current.count >= limit) {
    const retrySec = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
    return { ok: false as const, retrySec };
  }
  current.count += 1;
  return { ok: true as const, remaining: limit - current.count };
}

export function rateLimitOrThrow(key: string, limit: number, windowMs: number) {
  const result = rateLimit(key, limit, windowMs);
  if (!result.ok) {
    throw new Error(`You're going a little fast. Try again in ${result.retrySec}s.`);
  }
  return result;
}
