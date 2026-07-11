import { Capacitor } from "@capacitor/core";

/** True on phone/tablet viewport or Capacitor shell — use CSS-only motion, lighter glass. */
export function isNativePerfContext(): boolean {
  if (typeof window === "undefined") return false;
  return (
    Capacitor.isNativePlatform() ||
    window.matchMedia("(max-width: 1023px)").matches
  );
}
