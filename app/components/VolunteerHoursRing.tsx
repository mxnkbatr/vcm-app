"use client";

import { useMemo, useRef } from "react";
import { motion } from "framer-motion";
import FitnessRing from "@/app/components/ui/FitnessRing";
import { hapticNotification } from "@/lib/haptics";
import { NotificationType } from "@capacitor/haptics";

const BADGES = [
  { hours: 10, label: "10 цаг", emoji: "🌱" },
  { hours: 50, label: "50 цаг", emoji: "⭐" },
  { hours: 100, label: "100 цаг", emoji: "🏆" },
] as const;

/** Apple Fitness–style volunteer hours + badge unlock celebration. */
export default function VolunteerHoursRing({
  hours,
  locale = "mn",
}: {
  hours: number;
  locale?: string;
}) {
  const safeHours = Math.max(0, Math.round(hours));
  const celebrated = useRef<Set<number>>(new Set());

  const rings = useMemo(
    () => [
      { value: Math.min(safeHours, 10), max: 10, color: "#30D158", label: locale === "mn" ? "Эхлэл" : "Starter" },
      { value: Math.min(safeHours, 50), max: 50, color: "#0A84FF", label: locale === "mn" ? "Идэвх" : "Active" },
      { value: Math.min(safeHours, 100), max: 100, color: "#FF9F0A", label: locale === "mn" ? "Манлайлагч" : "Leader" },
    ],
    [safeHours, locale]
  );

  const topBadge = [...BADGES].reverse().find((b) => safeHours >= b.hours) ?? null;

  return (
    <div
      className="relative overflow-hidden px-4 py-4"
      style={{
        borderRadius: "var(--r-2xl)",
        background: "var(--card)",
        boxShadow: "var(--s-card)",
      }}
    >
      <p className="ios-caption uppercase tracking-wide mb-3" style={{ color: "var(--label2)" }}>
        {locale === "mn" ? "Сайн дурын цаг" : "Volunteer hours"}
      </p>
      <FitnessRing rings={rings} size={128} />
      <div className="mt-4 flex gap-2 flex-wrap">
        {BADGES.map((b) => {
          const on = safeHours >= b.hours;
          return (
            <motion.div
              key={b.hours}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold"
              initial={false}
              animate={on ? { scale: [1, 1.12, 1], opacity: 1 } : { scale: 1, opacity: 0.55 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              onAnimationComplete={() => {
                if (!on || celebrated.current.has(b.hours)) return;
                celebrated.current.add(b.hours);
                if (topBadge?.hours === b.hours) {
                  void hapticNotification(NotificationType.Success);
                }
              }}
              style={{
                background: on ? "var(--module-programs-soft)" : "var(--fill2)",
                color: on ? "var(--blue)" : "var(--label3)",
                border: "0.5px solid var(--sep)",
              }}
            >
              <span aria-hidden>{b.emoji}</span>
              {b.label}
            </motion.div>
          );
        })}
      </div>

      {topBadge && (
        <motion.div
          key={topBadge.hours}
          initial={{ opacity: 0, y: 8, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 18 }}
          className="mt-3 flex items-center gap-2 text-[13px] font-semibold"
          style={{ color: "var(--label2)" }}
        >
          <span className="text-lg" aria-hidden>{topBadge.emoji}</span>
          {locale === "mn" ? `${topBadge.label} шагнал нээгдсэн` : `${topBadge.label} unlocked`}
        </motion.div>
      )}
    </div>
  );
}
