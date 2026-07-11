"use client";

/**
 * Warms client cache early — tab switches feel instant when data is ready.
 */
import { useEffect } from "react";
import { useRouter } from "@/navigation";
import { clientCache } from "@/lib/client-cache";

const API_PREFETCH = ["/api/events", "/api/news", "/api/programs", "/api/shopping"];
const ROUTE_PREFETCH = ["/programs", "/shop", "/lessons", "/events", "/profile"];

function prefetchOne(url: string) {
  if (clientCache.age(url) < 60_000) return;
  fetch(url)
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      if (data) clientCache.set(url, data);
    })
    .catch(() => {});
}

export default function BackgroundPrefetch() {
  const router = useRouter();

  useEffect(() => {
    const run = () => {
      API_PREFETCH.forEach(prefetchOne);
      ROUTE_PREFETCH.forEach((href) => {
        try {
          router.prefetch(href);
        } catch {
          /* noop */
        }
      });
    };

    const timer = setTimeout(() => {
      if ("requestIdleCallback" in window) {
        (window as Window & { requestIdleCallback: typeof requestIdleCallback }).requestIdleCallback(run, {
          timeout: 1500,
        });
      } else {
        run();
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [router]);

  return null;
}
