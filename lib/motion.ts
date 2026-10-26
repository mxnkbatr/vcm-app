/** Shared iOS-style motion presets — spring 400/30 */

export const springNative = {
  type: "spring" as const,
  stiffness: 400,
  damping: 30,
  mass: 0.9,
};

export const springSnappy = {
  type: "spring" as const,
  stiffness: 500,
  damping: 32,
};

export const easeNative = [0.22, 1, 0.36, 1] as const;

export const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
};

export const fadeScale = {
  initial: { opacity: 0, scale: 0.97 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
};

export const slideFromRight = {
  initial: { x: "100%" },
  animate: { x: 0 },
  exit: { x: "-28%" },
};

export const slideFromBottom = {
  initial: { y: "100%" },
  animate: { y: 0 },
  exit: { y: "100%" },
};

export const staggerContainer = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.05, delayChildren: 0.02 },
  },
};

export const staggerItem = {
  // No offset — remount after detail pop was making cards “jump”
  initial: { opacity: 1, y: 0 },
  animate: {
    opacity: 1,
    y: 0,
  },
};

export const dockEnter = {
  // No opacity — avoids white flash / “weird” fade on detail enter
  initial: { y: 28 },
  animate: { y: 0 },
  exit: { y: 20 },
};

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
