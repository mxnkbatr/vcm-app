/**
 * Simple in-process TTL cache for API route handlers.
 * Lives in Node.js memory — survives across requests, cleared on server restart.
 * Eliminates repeated MongoDB round-trips for public/shared data.
 */

interface CacheEntry<T> {
  data: T;
  expires: number;
}

// Module-level singleton — one cache per server process
const store = new Map<string, CacheEntry<unknown>>();

export function getCached<T>(key: string): T | null {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    store.delete(key);
    return null;
  }
  return entry.data;
}

export function setCached<T>(key: string, data: T, ttlMs = 60_000): T {
  store.set(key, { data, expires: Date.now() + ttlMs });
  return data;
}

export function invalidate(key: string): void {
  store.delete(key);
}

export function invalidatePrefix(prefix: string): void {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}

/**
 * Cache-aside helper: returns cached value or runs `fn`, caches result.
 * Usage: await withCache("events", 30_000, () => Event.find(...).lean())
 */
export async function withCache<T>(
  key: string,
  ttlMs: number,
  fn: () => Promise<T>
): Promise<T> {
  const cached = getCached<T>(key);
  if (cached !== null) return cached;
  const data = await fn();
  return setCached(key, data, ttlMs);
}
