import { Capacitor } from "@capacitor/core";

/** True only inside Capacitor iOS/Android shell (not mobile Safari). */
export function isNativeApp(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

/** True on phone/tablet viewport or Capacitor shell — use CSS-only motion, lighter glass. */
export function isNativePerfContext(): boolean {
  if (typeof window === "undefined") return false;
  return (
    isNativeApp() ||
    window.matchMedia("(max-width: 1023px)").matches
  );
}
