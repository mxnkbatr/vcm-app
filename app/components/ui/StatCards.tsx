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

export default function StatCards({ stats }: { stats: StatItem[] }) {
  const reduce = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => false);

  return (
    <div className="ios-stats">
      {stats.map((s) => (
        <div key={s.label} className="ios-stats__card">
          <p className="ios-stats__value">
            {reduce ? (
              <>
                {s.value}
                {s.suffix || ""}
              </>
            ) : (
              <CountUp end={s.value} duration={1.2} suffix={s.suffix || ""} separator="," />
            )}
          </p>
          <p className="ios-stats__label">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
