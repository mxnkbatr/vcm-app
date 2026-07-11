"use client";

import { useEffect, useState } from "react";

/** Ambient mesh gradient — iOS liquid wallpaper feel */
export default function LiquidBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div
      className="liquid-bg fixed inset-0 -z-10 overflow-hidden pointer-events-none lg:hidden"
      aria-hidden
    >
      <div className="liquid-blob liquid-blob-1" />
      <div className="liquid-blob liquid-blob-2" />
      <div className="liquid-blob liquid-blob-3" />
      <div className="liquid-mesh" />
    </div>
  );
}
