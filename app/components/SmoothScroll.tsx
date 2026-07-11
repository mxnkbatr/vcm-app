"use client";

import { useEffect, useRef, useState } from "react";

export default function SmoothScroll() {
  const lenisRef = useRef<any>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const desktop = window.innerWidth >= 1024;
    setEnabled(desktop);
    if (!desktop) return;

    const initLenis = async () => {
      const Lenis = (await import("lenis")).default;
      lenisRef.current = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
    };

    initLenis();

    return () => {
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    const tick = (time: number) => {
      lenisRef.current?.raf(time);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [enabled]);

  return null;
}
