"use client";

import { MotionConfig, LazyMotion, domAnimation } from "framer-motion";

export default function MotionProvider({ children }: { children: React.ReactNode }) {
    return (
        <LazyMotion features={domAnimation}>
            <MotionConfig reducedMotion="never">
                {children}
            </MotionConfig>
        </LazyMotion>
    );
}
