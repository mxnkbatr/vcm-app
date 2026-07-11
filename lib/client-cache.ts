/**
 * Browser-side module-level data cache.
 * Lives in JS memory for the lifetime of the browser tab.
 * Makes returning to a page feel instant — shows stale data immediately
 * while a fresh fetch runs in the background.
 */

import { useState, useEffect, useRef } from "react";
import { cachePersist } from "./client-cache-persist";

interface Entry<T> {
  data: T;
  fetchedAt: number;
}

const store = new Map<string, Entry<unknown>>();

export const clientCache = {
  get<T>(key: string): T | null {
    const e = store.get(key) as Entry<T> | undefined;
    return e ? e.data : null;
  },

  set<T>(key: string, data: T): void {
    store.set(key, { data, fetchedAt: Date.now() });
    void cachePersist.save(key, data);
  },

  restore<T>(key: string, data: T, fetchedAt: number): void {
    const existing = store.get(key) as Entry<T> | undefined;
    if (existing && existing.fetchedAt >= fetchedAt) return;
    store.set(key, { data, fetchedAt });
  },

  /** Returns stale age in ms, or Infinity if not cached */
  age(key: string): number {
    const e = store.get(key);
    return e ? Date.now() - e.fetchedAt : Infinity;
  },

  has(key: string): boolean {
    return store.has(key);
  },

  remove(key: string): void {
    store.delete(key);
  },
};

/**
 * useCachedFetch — stale-while-revalidate hook
 *
 * Shows cached data IMMEDIATELY, then re-fetches in background if stale.
 * React hook — import and use inside components.
 */

export function useCachedFetch<T>(
  url: string,
  options?: { staleMsMs?: number; skip?: boolean; initialData?: T }
): { data: T | null; loading: boolean; refresh: () => void } {
  const { staleMsMs = 60_000, skip = false, initialData } = options ?? {};
  const key = url;

  const [data, setData] = useState<T | null>(() => {
    if (initialData !== undefined) {
      clientCache.set(key, initialData);
      return initialData;
    }
    return clientCache.get<T>(key);
  });
  const [loading, setLoading] = useState(
    initialData === undefined && !clientCache.has(key)
  );
  const fetchRef = useRef(0);

  const doFetch = () => {
    const id = ++fetchRef.current;
    fetch(url)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((json: T) => {
        if (id !== fetchRef.current) return; // stale request
        clientCache.set(key, json);
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    if (skip) return;

    let cancelled = false;

    void cachePersist.hydrate<T>(key).then((persisted) => {
      if (cancelled || !persisted) return;
      clientCache.restore(key, persisted.data, persisted.fetchedAt);
      setData(persisted.data);
      setLoading(false);
    });

    const stale = clientCache.age(key) > staleMsMs;
    if (!clientCache.has(key)) {
      setLoading(true);
      doFetch();
    } else if (stale) {
      doFetch();
    }

    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, skip]);

  return { data, loading, refresh: doFetch };
}
