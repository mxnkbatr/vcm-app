"use client";

/**
 * Warms client cache early — tab switches feel instant when data is ready.
 */
import { useEffect } from "react";
import { useRouter } from "@/navigation";
import { clientCache } from "@/lib/client-cache";

const API_PREFETCH = ["/api/events", "/api/news", "/api/programs", "/api/shopping"];
const ROUTE_PREFETCH = ["/", "/programs", "/shop", "/lessons", "/events", "/profile"];

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
      const finish = () => {
        run();
        window.dispatchEvent(new CustomEvent("vcm:app-ready"));
      };
      if ("requestIdleCallback" in window) {
        (window as Window & { requestIdleCallback: typeof requestIdleCallback }).requestIdleCallback(finish, {
          timeout: 1500,
        });
      } else {
        finish();
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [router]);

  return null;
}
