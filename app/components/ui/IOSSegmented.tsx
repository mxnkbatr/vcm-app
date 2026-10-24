"use client";

import { motion } from "framer-motion";
import { springNative } from "@/lib/motion";
import { hapticSelection } from "@/lib/haptics";

export type SegOption = { id: string; label: string };

export default function IOSSegmented({
  options,
  value,
  onChange,
}: {
  options: SegOption[];
  value: string;
  onChange: (id: string) => void;
}) {
  const idx = Math.max(0, options.findIndex((o) => o.id === value));
  const width = `${100 / Math.max(options.length, 1)}%`;

  return (
    <div className="ios-seg glass-surface" role="tablist">
      <motion.div
        className="ios-seg__thumb"
        layoutId="ios-seg-thumb"
        transition={springNative}
        style={{ left: `calc(${idx} * ${width} + 2px)`, width: `calc(${width} - 4px)` }}
      />
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="tab"
          aria-selected={value === o.id}
          className="ios-seg__item press"
          onClick={() => {
            void hapticSelection();
            onChange(o.id);
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
