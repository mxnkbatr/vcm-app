"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "@/navigation";
import { stripLocale } from "@/lib/navigation-motion";
import { hapticImpact } from "@/lib/haptics";
import { ImpactStyle } from "@capacitor/haptics";

const PULL_THRESHOLD = 72;
const MAX_PULL = 110;

/** Native-style pull-to-refresh on tab roots (home, etc.). */
export default function NativePullRefresh() {
  const pathname = usePathname();
  const router = useRouter();
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const tracking = useRef(false);
  const pullRef = useRef(0);
  const refreshingRef = useRef(false);
  const startY = useRef(0);

  const path = stripLocale(pathname);
  const enabled = path === "/" || path === "/events" || path === "/shop";

  useEffect(() => {
    pullRef.current = pull;
  }, [pull]);

  useEffect(() => {
    refreshingRef.current = refreshing;
  }, [refreshing]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const main = document.querySelector<HTMLElement>(".native-app-main");
    if (!main) return;

    const onStart = (e: TouchEvent) => {
      if (refreshingRef.current || main.scrollTop > 4) return;
      const t = e.touches[0];
      if (!t) return;
      tracking.current = true;
      startY.current = t.clientY;
    };

    const onMove = (e: TouchEvent) => {
      if (!tracking.current || refreshingRef.current) return;
      const t = e.touches[0];
      if (!t || main.scrollTop > 4) {
        tracking.current = false;
        pullRef.current = 0;
        setPull(0);
        return;
      }
      const dy = t.clientY - startY.current;
      if (dy <= 0) {
        pullRef.current = 0;
        setPull(0);
        return;
      }
      e.preventDefault();
      const eased = Math.min(dy * 0.55, MAX_PULL);
      pullRef.current = eased;
      setPull(eased);
    };

    const onEnd = async () => {
      if (!tracking.current) return;
      tracking.current = false;
      const currentPull = pullRef.current;

      if (currentPull >= PULL_THRESHOLD && !refreshingRef.current) {
        setRefreshing(true);
        refreshingRef.current = true;
        void hapticImpact(ImpactStyle.Medium);
        try {
          router.refresh();
        } finally {
          window.setTimeout(() => {
            setRefreshing(false);
            refreshingRef.current = false;
            pullRef.current = 0;
            setPull(0);
          }, 700);
        }
        return;
      }
      pullRef.current = 0;
      setPull(0);
    };

    main.addEventListener("touchstart", onStart, { passive: true });
    main.addEventListener("touchmove", onMove, { passive: false });
    main.addEventListener("touchend", onEnd, { passive: true });
    main.addEventListener("touchcancel", onEnd, { passive: true });

    return () => {
      main.removeEventListener("touchstart", onStart);
      main.removeEventListener("touchmove", onMove);
      main.removeEventListener("touchend", onEnd);
      main.removeEventListener("touchcancel", onEnd);
    };
  }, [enabled, router]);

  if (!enabled) return null;

  const progress = Math.min(pull / PULL_THRESHOLD, 1);

  return (
    <div
      className="native-ptr lg:hidden"
      style={{
        opacity: pull > 8 || refreshing ? 1 : 0,
        transform: `translateY(calc(env(safe-area-inset-top, 0px) + ${Math.max(pull - 8, 0)}px))`,
      }}
      aria-hidden
    >
      <div
        className={`native-ptr__spinner ${refreshing ? "spinning" : ""}`}
        style={{
          transform: refreshing ? undefined : `rotate(${progress * 320}deg) scale(${0.7 + progress * 0.3})`,
        }}
      />
      <span className="native-ptr__label">
        {refreshing ? "Шинэчилж байна…" : progress >= 1 ? "Тат…" : "Шинэчлэх"}
      </span>
    </div>
  );
}
