"use client";

import CountUp from "react-countup";
import { useSyncExternalStore } from "react";

export type StatItem = {
  value: number;
  suffix?: string;
  label: string;
};

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Single glass card with 3 columns + count-up. */
export default function StatCards({ stats }: { stats: StatItem[] }) {
  const reduce = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => false);

  return (
    <div className="ios-stats-glass glass-surface">
      {stats.map((s, i) => (
        <div key={s.label} className={`ios-stats-glass__col ${i > 0 ? "has-sep" : ""}`}>
          <p className="ios-stats-glass__value">
            {reduce ? (
              <>
                {s.value.toLocaleString()}
                {s.suffix || ""}
              </>
            ) : (
              <CountUp end={s.value} duration={1.35} suffix={s.suffix || ""} separator="," enableScrollSpy scrollSpyOnce />
            )}
          </p>
          <p className="ios-stats-glass__label">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
