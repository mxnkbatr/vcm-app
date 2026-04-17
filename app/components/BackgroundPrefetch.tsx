"use client";

/**
 * BackgroundPrefetch: silently warms the client cache for the most-visited pages.
 * Runs after homepage is idle (requestIdleCallback) so it never blocks the UI.
 * 
 * When user taps Events/News/Shop, data is already in clientCache → instant render.
 */

import { useEffect } from "react";
import { clientCache } from "@/lib/client-cache";

const PREFETCH_URLS = [
  "/api/events",
  "/api/news",
  "/api/shopping",
  "/api/banners",
];

function prefetchOne(url: string) {
  // Skip if already fresh (less than 60s old)
  if (clientCache.age(url) < 60_000) return;
  fetch(url)
    .then(r => r.ok ? r.json() : null)
    .then(data => { if (data) clientCache.set(url, data); })
    .catch(() => {});
}

export default function BackgroundPrefetch() {
  useEffect(() => {
    const run = () => PREFETCH_URLS.forEach(prefetchOne);

    if ("requestIdleCallback" in window) {
      (window as any).requestIdleCallback(run, { timeout: 2000 });
    } else {
      setTimeout(run, 1200);
    }
  }, []);

  return null;
}
