"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import BrandLogo from "./BrandLogo";
import Onboarding from "./Onboarding";
import { hasCompletedOnboarding } from "@/lib/onboarding";
import { BRAND } from "@/lib/branding";

type Phase = "boot" | "morph" | "onboarding" | "done";

/**
 * First launch → splash → onboarding (once).
 * Later → short splash → home.
 * No layoutId here — Safari left a stuck logo projection.
 */
export default function AppSplash() {
  const [phase, setPhase] = useState<Phase>("boot");

  useEffect(() => {
    let cancelled = false;
    const timers: number[] = [];

    const go = (next: Phase) => {
      if (cancelled) return;
      setPhase((prev) => (prev === "done" ? prev : next));
      if (next === "done") {
        try {
          window.dispatchEvent(new CustomEvent("vcm:app-ready"));
        } catch {
          /* noop */
        }
      }
    };

    const run = async () => {
      let done = false;
      try {
        done = await Promise.race([
          hasCompletedOnboarding(),
          new Promise<boolean>((resolve) => {
            timers.push(window.setTimeout(() => resolve(false), 600));
          }),
        ]);
      } catch {
        done = false;
      }
      if (cancelled) return;

      if (!done) {
        timers.push(window.setTimeout(() => go("onboarding"), 520));
        return;
      }

      timers.push(window.setTimeout(() => go("morph"), 240));
      timers.push(window.setTimeout(() => go("done"), 780));
    };

    void run();

    // Hard failsafe — Safari / remount must never leave splash forever
    timers.push(
      window.setTimeout(() => {
        setPhase((prev) => {
          if (prev === "onboarding" || prev === "done") return prev;
          try {
            window.dispatchEvent(new CustomEvent("vcm:app-ready"));
          } catch {
            /* noop */
          }
          return "done";
        });
      }, 2200)
    );

    return () => {
      cancelled = true;
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  const finishOnboarding = () => {
    setPhase("done");
    try {
      window.dispatchEvent(new CustomEvent("vcm:app-ready"));
    } catch {
      /* noop */
    }
  };

  if (phase === "done") return null;

  return (
    <div className="app-splash app-splash--morph" role="presentation">
      {phase === "onboarding" ? (
        <Onboarding onDone={finishOnboarding} />
      ) : (
        <>
          <motion.div
            className="app-splash__morph-stage"
            initial={false}
            animate={
              phase === "morph"
                ? { scale: 0.88, opacity: 0 }
                : { scale: 1, opacity: 1 }
            }
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* No layoutId — Safari kept a floating logo after exit */}
            <BrandLogo size={112} priority />
            <p className="app-splash__brand-short">{BRAND.shortName}</p>
          </motion.div>

          <p className="app-splash__credit">
            Developed by {BRAND.developedBy}
          </p>
        </>
      )}
    </div>
  );
}
