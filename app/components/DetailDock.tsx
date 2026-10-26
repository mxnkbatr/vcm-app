"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { usePathname } from "@/navigation";
import { springNative } from "@/lib/motion";
import { isImmersiveDetail } from "@/lib/navigation-motion";

type DetailDockProps = {
  visible?: boolean;
  /** Left cluster — e.g. price */
  leading?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

/**
 * Floating bottom bar for detail screens.
 * Portaled to body for true viewport fixed positioning.
 * No exit animation — avoids glitchy leftover dock during page pop.
 */
export default function DetailDock({
  visible = true,
  leading,
  children,
  className = "",
}: DetailDockProps) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const onDetail = isImmersiveDetail(pathname);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !visible || !onDetail) return null;

  return createPortal(
    <motion.div
      className={`detail-dock ${className}`.trim()}
      initial={{ y: 24 }}
      animate={{ y: 0 }}
      transition={springNative}
    >
      <div className="detail-dock__bar">
        {leading ? <div className="detail-dock__leading">{leading}</div> : null}
        <div className={`detail-dock__actions ${leading ? "" : "is-solo"}`}>{children}</div>
      </div>
    </motion.div>,
    document.body
  );
}
