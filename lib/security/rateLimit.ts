type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
};

type Bucket = { resetAt: number; count: number };

const globalBuckets: Map<string, Bucket> =
  (globalThis as any).__vcmRateLimitBuckets ||
  ((globalThis as any).__vcmRateLimitBuckets = new Map());

export function rateLimit({ key, limit, windowMs }: RateLimitOptions): {
  ok: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const b = globalBuckets.get(key);
  if (!b || now >= b.resetAt) {
    const resetAt = now + windowMs;
    globalBuckets.set(key, { resetAt, count: 1 });
    return { ok: true, remaining: limit - 1, resetAt };
  }

  if (b.count >= limit) {
    return { ok: false, remaining: 0, resetAt: b.resetAt };
  }

  b.count += 1;
  globalBuckets.set(key, b);
  return { ok: true, remaining: limit - b.count, resetAt: b.resetAt };
}

