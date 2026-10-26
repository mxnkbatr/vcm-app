"use client";

import { useSyncExternalStore } from "react";
import { isNativeApp } from "@/lib/native-perf";

/**
 * Soft atmospheric mesh behind pages — enables real liquid-glass depth.
 * Blobs stay static on native for battery/jank; desktop can drift lightly.
 */
export default function LiquidBackground() {
  const native = useSyncExternalStore(
    () => () => {},
    () => isNativeApp(),
    () => false
  );

  return (
    <div className="liquid-bg-root" aria-hidden>
      <div className={`liquid-mesh ${native ? "liquid-mesh--static" : ""}`} />
      {!native ? (
        <>
          <div className="liquid-blob liquid-blob-1" />
          <div className="liquid-blob liquid-blob-2" />
          <div className="liquid-blob liquid-blob-3" />
        </>
      ) : null}
    </div>
  );
}
