"use client";

import { MotionConfig, LazyMotion, LayoutGroup, domMax } from "framer-motion";

/** domMax required for layoutId shared-element transitions */
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domMax}>
      <MotionConfig reducedMotion="user">
        <LayoutGroup id="vcm-shared">{children}</LayoutGroup>
      </MotionConfig>
    </LazyMotion>
  );
}
