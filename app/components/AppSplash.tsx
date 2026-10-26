"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import BrandLogo from "./BrandLogo";
import Onboarding from "./Onboarding";
import { hasCompletedOnboarding } from "@/lib/onboarding";
import { BRAND } from "@/lib/branding";
import { springNative } from "@/lib/motion";

type Phase = "boot" | "morph" | "onboarding" | "done";

/**
 * First launch → splash → onboarding (once, persisted).
 * Later launches → splash (logo + Developed by) → home.
 */
export default function AppSplash() {
  const [phase, setPhase] = useState<Phase>("boot");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    let cancelled = false;
    const timers: number[] = [];

    const go = (next: Phase) => {
      if (cancelled) return;
      setPhase(next);
      if (next === "done") {
        window.dispatchEvent(new CustomEvent("vcm:app-ready"));
      }
    };

    const run = async () => {
      let done = false;
      try {
        done = await Promise.race([
          hasCompletedOnboarding(),
          // If Preferences is slow, treat as first launch (show onboarding)
          new Promise<boolean>((resolve) => window.setTimeout(() => resolve(false), 900)),
        ]);
      } catch {
        done = false;
      }
      if (cancelled) return;

      if (!done) {
        // Brief splash, then onboarding — never hard-kill this path
        timers.push(window.setTimeout(() => go("onboarding"), 700));
        return;
      }

      // Returning user: morph logo, then exit
      timers.push(window.setTimeout(() => go("morph"), 320));
      timers.push(window.setTimeout(() => go("done"), 980));
    };
    void run();

    return () => {
      cancelled = true;
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  const finishOnboarding = () => {
    setPhase("done");
    window.dispatchEvent(new CustomEvent("vcm:app-ready"));
  };

  if (phase === "done") return null;

  return (
    <AnimatePresence>
      <motion.div
        key="splash-root"
        className="app-splash app-splash--morph"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.28 }}
      >
        {phase === "onboarding" ? (
          <Onboarding onDone={finishOnboarding} />
        ) : (
          <>
            <motion.div
              className="app-splash__morph-stage"
              initial={false}
              animate={
                phase === "morph"
                  ? { scale: 0.42, y: -120, opacity: 0.95 }
                  : { scale: 1, y: 0, opacity: 1 }
              }
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div layoutId="vcm-brand-logo" transition={springNative}>
                <BrandLogo size={phase === "boot" ? 112 : 88} priority />
              </motion.div>
              <motion.p
                className="app-splash__brand-short"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: phase === "morph" ? 0 : 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                {BRAND.shortName}
              </motion.p>
            </motion.div>

            <p className="app-splash__credit">
              Developed by {BRAND.developedBy}
            </p>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
