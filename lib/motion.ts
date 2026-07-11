/** Shared native-style motion presets */

export const springNative = {
  type: "spring" as const,
  stiffness: 420,
  damping: 36,
  mass: 0.85,
};

export const springSnappy = {
  type: "spring" as const,
  stiffness: 520,
  damping: 38,
};

export const easeNative = [0.22, 1, 0.36, 1] as const;

export const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
};

export const fadeScale = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
};

export const slideFromRight = {
  initial: { x: "100%", opacity: 0.92 },
  animate: { x: 0, opacity: 1 },
  exit: { x: "28%", opacity: 0.88 },
};

export const slideFromBottom = {
  initial: { y: "100%" },
  animate: { y: 0 },
  exit: { y: "100%" },
};

export const staggerContainer = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.07, delayChildren: 0.04 },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, ease: easeNative },
  },
};

export const dockEnter = {
  initial: { opacity: 0, y: 24, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 16, scale: 0.98 },
};
