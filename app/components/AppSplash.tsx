"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import BrandLogo from "./BrandLogo";
import Onboarding from "./Onboarding";
import { hasCompletedOnboarding } from "@/lib/onboarding";
import { springNative } from "@/lib/motion";

type Phase = "boot" | "morph" | "onboarding" | "done";

/**
 * #F2F2F7 splash → logo morphs into header (layoutId) → optional onboarding → home.
 * Never paints black.
 */
export default function AppSplash() {
  const [phase, setPhase] = useState<Phase>("boot");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const t1 = window.setTimeout(() => setPhase("morph"), 280);
    const t2 = window.setTimeout(() => {
      void hasCompletedOnboarding().then((done) => {
        if (done) {
          setPhase("done");
          window.dispatchEvent(new CustomEvent("vcm:app-ready"));
        } else {
          setPhase("onboarding");
        }
      });
    }, 700);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
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
              <BrandLogo size={phase === "boot" ? 112 : 72} priority />
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
