"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "@/navigation";
import { AnimatePresence, m, type TargetAndTransition } from "framer-motion";
import { easeNative, prefersReducedMotion, springNative } from "@/lib/motion";
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
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  push: {
    initial: { x: "100%", opacity: 1 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "-30%", opacity: 0.55 },
  },
  pop: {
    initial: { x: "-30%", opacity: 0.55 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "100%", opacity: 1 },
  },
  modal: {
    initial: { y: "100%", opacity: 1 },
    animate: { y: 0, opacity: 1 },
    exit: { y: "100%", opacity: 1 },
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

  const v = reduce
    ? VARIANTS.instant
    : VARIANTS[kind];
  const isInstant = kind === "instant" || reduce;

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
            : kind === "tab"
              ? { duration: 0.2, ease: easeNative }
              : springNative
        }
        style={{
          willChange: isInstant ? undefined : "transform, opacity",
          touchAction: "pan-y",
        }}
      >
        {children}
      </m.div>
    </AnimatePresence>
  );
}
