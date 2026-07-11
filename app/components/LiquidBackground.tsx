"use client";

import { useEffect, useState } from "react";

/** Static wallpaper on mobile — animated blobs are GPU-heavy in WebView. */
export default function LiquidBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div
      className="liquid-bg fixed inset-0 -z-10 overflow-hidden pointer-events-none lg:hidden"
      aria-hidden
    >
      <div className="liquid-mesh liquid-mesh--static" />
    </div>
  );
}
