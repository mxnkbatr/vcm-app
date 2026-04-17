"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

/**
 * Native-style screen change: no "wait for exit" blank frame (unlike WebView).
 * Enter-only micro fade — tab apps rarely animate the outgoing screen.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0.988 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{ minHeight: "100dvh", background: "var(--bg)" }}
      className="w-full will-change-[opacity]"
    >
      {children}
    </motion.div>
  );
}
