"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "@/navigation";
import { getTransitionKind, isTabRoute, stripLocale } from "@/lib/navigation-motion";

const KEY = "vcm-scroll:";

function mainEl() {
  return document.querySelector<HTMLElement>(".native-app-main");
}

function readSaved(path: string) {
  try {
    const raw = sessionStorage.getItem(KEY + stripLocale(path));
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

function save(path: string, y: number) {
  try {
    sessionStorage.setItem(KEY + stripLocale(path), String(Math.max(0, Math.round(y))));
  } catch {
    /* noop */
  }
}

/**
 * Keep list/tab scroll when popping back; start at top on push/detail.
 * Shared `.native-app-main` otherwise always “ehneesee ehelne”.
 */
export default function ScrollMemory() {
  const pathname = usePathname();
  const prevPath = useRef(pathname);

  useEffect(() => {
    const main = mainEl();
    if (!main) return;

    const from = prevPath.current;
    const kind = getTransitionKind(from, pathname);

    // Persist where we left
    save(from, main.scrollTop);

    const restore = () => {
      const el = mainEl();
      if (!el) return;

      if (kind === "pop" || (kind === "instant" && isTabRoute(pathname))) {
        const y = readSaved(pathname);
        el.scrollTop = y ?? 0;
      } else {
        // push / modal / first paint of a stack screen → top
        el.scrollTop = 0;
      }
    };

    // After page content paints
    restore();
    const t = window.setTimeout(restore, 32);
    const t2 = window.setTimeout(restore, 120);

    prevPath.current = pathname;
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(t2);
    };
  }, [pathname]);

  return null;
}
