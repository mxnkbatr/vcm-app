"use client";

import { Link } from "@/navigation";
import { motion } from "framer-motion";
import { springNative } from "@/lib/motion";

/** Shared iOS 26 liquid media card shell. */
export default function IOS26Card({
  href,
  children,
  className = "",
  onClick,
}: {
  href?: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const inner = (
    <motion.div
      className={`ios26-card ${className}`}
      whileTap={{ scale: 0.975 }}
      transition={springNative}
    >
      {children}
    </motion.div>
  );

  if (href) {
    return (
      <Link href={href} className="press block">
        {inner}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" className="press block w-full text-left" onClick={onClick}>
        {inner}
      </button>
    );
  }

  return inner;
}
