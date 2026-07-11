"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { dockEnter, springNative } from "@/lib/motion";

type NativeDockProps = {
  visible?: boolean;
  price?: string | number;
  priceLabel?: string;
  children: React.ReactNode;
};

export default function NativeDock({
  visible = true,
  price,
  priceLabel,
  children,
}: NativeDockProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="native-dock"
          variants={dockEnter}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={springNative}
        >
          {price != null && (
            <div className="native-dock__price">
              <span className="native-dock__amount">₮{Number(price).toLocaleString()}</span>
              {priceLabel && <span className="native-dock__label">{priceLabel}</span>}
            </div>
          )}
          <div className="native-dock__actions">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
