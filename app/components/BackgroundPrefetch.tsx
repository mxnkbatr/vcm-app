"use client";

/**
 * Warms client cache after the app is idle — never competes with SSR home data.
 */
import { useEffect } from "react";
import { clientCache } from "@/lib/client-cache";

const PREFETCH_URLS = ["/api/events", "/api/news"];

function prefetchOne(url: string) {
  if (clientCache.age(url) < 90_000) return;
  fetch(url)
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => { if (data) clientCache.set(url, data); })
    .catch(() => {});
}

export default function BackgroundPrefetch() {
  useEffect(() => {
    const run = () => PREFETCH_URLS.forEach(prefetchOne);

    const timer = setTimeout(() => {
      if ("requestIdleCallback" in window) {
        (window as any).requestIdleCallback(run, { timeout: 3000 });
      } else {
        run();
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return null;
}
