"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "@/navigation";
import { stripLocale } from "@/lib/navigation-motion";
import { hapticImpact } from "@/lib/haptics";
import { ImpactStyle } from "@capacitor/haptics";

const EDGE = 24;
const THRESHOLD = 88;
const MAX_DRAG = 120;

/** iOS-style edge swipe with live page drag (mobile + native WebView). */
export default function SwipeBackGesture() {
  const pathname = usePathname();
  const router = useRouter();
  const startX = useRef(0);
  const startY = useRef(0);
  const tracking = useRef(false);
  const indicator = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const path = stripLocale(pathname);
    const tabRoots = new Set(["/", "/programs", "/shop", "/events", "/lessons", "/profile"]);
    setEnabled(!tabRoots.has(path) && !path.startsWith("/admin"));
  }, [pathname]);

  useEffect(() => {
    if (typeof window === "undefined" || !enabled) return;

    const getLayer = () =>
      document.querySelector<HTMLElement>(".native-page-layer:last-of-type");

    const resetLayer = () => {
      const layer = getLayer();
      if (!layer) return;
      layer.style.transition = "transform 0.28s cubic-bezier(0.22, 1, 0.36, 1)";
      layer.style.transform = "";
      window.setTimeout(() => {
        if (layer) layer.style.transition = "";
      }, 300);
    };

    const onStart = (e: TouchEvent) => {
      if (window.innerWidth >= 1024) return;
      const t = e.touches[0];
      if (!t || t.clientX > EDGE) return;
      startX.current = t.clientX;
      startY.current = t.clientY;
      tracking.current = true;
    };

    const onMove = (e: TouchEvent) => {
      if (!tracking.current) return;
      const t = e.touches[0];
      if (!t) return;

      const dx = t.clientX - startX.current;
      const dy = Math.abs(t.clientY - startY.current);

      if (dy > dx && dx < 10) {
        tracking.current = false;
        resetLayer();
        return;
      }

      if (dx > 6 && dx > dy) {
        e.preventDefault();
        const clamped = Math.min(dx, MAX_DRAG);
        const progress = clamped / THRESHOLD;
        const layer = getLayer();
        if (layer) {
          layer.style.transition = "none";
          layer.style.transform = `translateX(${clamped * 0.42}px)`;
        }
        if (indicator.current) {
          indicator.current.style.opacity = String(0.35 + progress * 0.5);
          indicator.current.style.transform = `translateX(${-10 + progress * 16}px) scale(${0.9 + progress * 0.15})`;
        }
      }
    };

    const onEnd = (e: TouchEvent) => {
      if (!tracking.current) return;
      tracking.current = false;

      const t = e.changedTouches[0];
      const dx = (t?.clientX ?? 0) - startX.current;
      const layer = getLayer();

      if (indicator.current) {
        indicator.current.style.opacity = "0";
        indicator.current.style.transform = "translateX(-10px) scale(0.9)";
      }

      if (dx >= THRESHOLD) {
        void hapticImpact(ImpactStyle.Light);
        if (layer) {
          layer.style.transition = "transform 0.22s cubic-bezier(0.22, 1, 0.36, 1)";
          layer.style.transform = "translateX(100%)";
        }
        window.setTimeout(() => {
          resetLayer();
          if (window.history.length > 1) window.history.back();
          else router.back();
        }, 180);
        return;
      }

      resetLayer();
    };

    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd, { passive: true });
    window.addEventListener("touchcancel", onEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
      window.removeEventListener("touchcancel", onEnd);
      resetLayer();
    };
  }, [enabled, pathname, router]);

  if (!enabled) return null;

  return (
    <div ref={indicator} aria-hidden className="swipe-back-indicator">
      <svg width="10" height="16" viewBox="0 0 10 16" fill="none">
        <path
          d="M8 2L2 8L8 14"
          stroke="var(--blue)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
