"use client";

import { useEffect } from "react";

export default function SmoothScroll() {
  useEffect(() => {
    // Disable on mobile/tablet (simplest check)
    if (window.innerWidth < 1024) return;

    let lenis: any;

    const initLenis = async () => {
      const Lenis = (await import("lenis")).default;
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });

      function raf(time: number) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }

      requestAnimationFrame(raf);
    };

    initLenis();

    return () => {
      if (lenis) lenis.destroy();
    };
  }, []);

  return null;
}
