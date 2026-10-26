"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "@/navigation";
import { AnimatePresence, m, type TargetAndTransition } from "framer-motion";
import { easeNative, prefersReducedMotion, springNative } from "@/lib/motion";
import { getTransitionKind, type TransitionKind } from "@/lib/navigation-motion";

/**
 * Native-stack feel without stretch/squash:
 * - Only the incoming page slides (exit stays put, clipped)
 * - No opacity fades, no exit parallax (avoids “sungaj” look)
 */
const VARIANTS: Record<
  TransitionKind,
  { initial: TargetAndTransition; animate: TargetAndTransition; exit: TargetAndTransition }
> = {
  instant: {
    initial: { x: 0 },
    animate: { x: 0 },
    exit: { x: 0 },
  },
  tab: {
    initial: { x: 0 },
    animate: { x: 0 },
    exit: { x: 0 },
  },
  push: {
    // Detail slides in; list underneath stays put (no card shift)
    initial: { x: "100%" },
    animate: { x: 0 },
    exit: { x: 0 },
  },
  pop: {
    // Detail slides out; returning list must NOT start offset (was causing card hop)
    initial: { x: 0 },
    animate: { x: 0 },
    exit: { x: "100%" },
  },
  modal: {
    initial: { y: "100%" },
    animate: { y: 0 },
    exit: { y: "100%" },
  },
};

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prevPath = useRef(pathname);
  const kind = getTransitionKind(prevPath.current, pathname);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    setReduce(prefersReducedMotion());
  }, []);

  useEffect(() => {
    prevPath.current = pathname;
  }, [pathname]);

  const isInstant = kind === "instant" || kind === "tab" || reduce;

  if (isInstant) {
    return (
      <div className="min-h-dvh w-full native-page-layer rn-screen" style={{ touchAction: "pan-y" }}>
        {children}
      </div>
    );
  }

  const v = VARIANTS[kind];

  return (
    <div className="native-page-clip">
      <AnimatePresence mode="sync" initial={false}>
        <m.div
          key={pathname}
          className="min-h-dvh w-full native-page-layer rn-screen"
          initial={v.initial}
          animate={v.animate}
          exit={v.exit}
          transition={
            kind === "modal"
              ? { duration: 0.3, ease: easeNative }
              : { ...springNative, stiffness: 420, damping: 36 }
          }
          style={{
            touchAction: "pan-y",
            background: "var(--bg)",
          }}
          onAnimationComplete={() => {
            // Drop leftover will-change / transform hints after settle
            const layers = document.querySelectorAll<HTMLElement>(".native-page-layer");
            layers.forEach((el) => {
              if (el.style.transform === "none" || el.style.transform === "translateX(0px)") {
                el.style.transform = "";
              }
            });
          }}
        >
          {children}
        </m.div>
      </AnimatePresence>
    </div>
  );
}
