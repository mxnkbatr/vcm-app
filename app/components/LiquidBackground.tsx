"use client";

/**
 * Deep mesh + drifting brand blobs so liquid glass has something to refract.
 * Animations are CSS-driven; reduced-motion freezes blobs via globals.css.
 */
export default function LiquidBackground() {
  return (
    <div className="liquid-bg-root" aria-hidden>
      <div className="liquid-mesh" />
      <div className="liquid-blob liquid-blob-1" />
      <div className="liquid-blob liquid-blob-2" />
      <div className="liquid-blob liquid-blob-3" />
      <div className="liquid-blob liquid-blob-4" />
    </div>
  );
}
