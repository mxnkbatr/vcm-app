"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "@/navigation";
import { AnimatePresence, m, type TargetAndTransition } from "framer-motion";
import { easeNative, springNative } from "@/lib/motion";
import { getTransitionKind, type TransitionKind } from "@/lib/navigation-motion";

const VARIANTS: Record<
  TransitionKind,
  { initial: TargetAndTransition; animate: TargetAndTransition; exit: TargetAndTransition }
> = {
  instant: {
    initial: { opacity: 1, x: 0 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 1, x: 0 },
  },
  tab: {
    initial: { opacity: 1, x: 0 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 1, x: 0 },
  },
  push: {
    initial: { x: "100%" },
    animate: { x: 0 },
    exit: { x: "18%" },
  },
  pop: {
    initial: { x: "-18%" },
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

  useEffect(() => {
    prevPath.current = pathname;
  }, [pathname]);

  const v = VARIANTS[kind];
  const isInstant = kind === "instant" || kind === "tab";

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <m.div
        key={pathname}
        className="min-h-dvh w-full native-page-layer"
        initial={v.initial}
        animate={v.animate}
        exit={v.exit}
        transition={
          isInstant
            ? { duration: 0 }
            : kind === "modal"
              ? { type: "spring", stiffness: 520, damping: 38, mass: 0.85 }
              : kind === "push" || kind === "pop"
                ? { duration: 0.2, ease: easeNative }
                : { ...springNative, opacity: { duration: 0.15, ease: easeNative } }
        }
        style={{
          willChange: isInstant ? undefined : "transform",
          touchAction: "pan-y",
        }}
      >
        {children}
      </m.div>
    </AnimatePresence>
  );
}
