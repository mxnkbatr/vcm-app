"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { prefersReducedMotion, springSnappy } from "@/lib/motion";

const COLORS = ["#1E5BD8", "#34C759", "#FF9F0A", "#FF3B30", "#AF52DE", "#64D2FF"];

type Particle = {
  id: number;
  x: number;
  y: number;
  rot: number;
  color: string;
  size: number;
  delay: number;
  round: boolean;
};

function makeParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = (Math.PI * 2 * i) / count + (i % 3) * 0.15;
    const dist = 72 + (i % 5) * 28;
    return {
      id: i,
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist - 20,
      rot: (i * 47) % 360,
      color: COLORS[i % COLORS.length]!,
      size: 5 + (i % 4),
      delay: (i % 6) * 0.02,
      round: i % 3 !== 0,
    };
  });
}

type SuccessBurstProps = {
  active: boolean;
  /** Auto-hide after ms (default 1400) */
  durationMs?: number;
  onDone?: () => void;
  /** Compact = smaller check, fewer particles */
  compact?: boolean;
  /** false when host UI already shows a check (e.g. iOSAlert) */
  showCheck?: boolean;
};

/** Check burst + short particle spray — payment / signup / join success. */
export default function SuccessBurst({
  active,
  durationMs = 1400,
  onDone,
  compact = false,
  showCheck = true,
}: SuccessBurstProps) {
  const [reduce, setReduce] = useState(false);
  const particles = useMemo(() => makeParticles(compact ? 14 : 22), [compact]);

  useEffect(() => {
    setReduce(prefersReducedMotion());
  }, []);

  useEffect(() => {
    if (!active) return;
    const t = window.setTimeout(() => onDone?.(), durationMs);
    return () => window.clearTimeout(t);
  }, [active, durationMs, onDone]);

  const checkSize = compact ? 44 : 72;
  const iconSize = compact ? 22 : 36;

  return (
    <AnimatePresence>
      {active ? (
        <div
          className={`success-burst ${compact ? "success-burst--compact" : ""}`}
          aria-hidden
        >
          {!reduce
            ? particles.map((p) => (
                <motion.span
                  key={p.id}
                  className="success-burst__particle"
                  style={{
                    width: p.size,
                    height: p.size * (p.round ? 1 : 1.6),
                    borderRadius: p.round ? 999 : 2,
                    background: p.color,
                  }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 0.4, rotate: 0 }}
                  animate={{
                    x: p.x,
                    y: p.y,
                    opacity: 0,
                    scale: 1,
                    rotate: p.rot,
                  }}
                  transition={{
                    duration: 0.95,
                    delay: p.delay,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                />
              ))
            : null}

          {showCheck ? (
            <motion.div
              className="success-burst__check"
              style={{ width: checkSize, height: checkSize }}
              initial={{ scale: 0.35, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={springSnappy}
            >
              <Check size={iconSize} strokeWidth={2.75} color="#fff" />
            </motion.div>
          ) : null}
        </div>
      ) : null}
    </AnimatePresence>
  );
}
