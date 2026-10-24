"use client";

import { AnimatePresence, motion, useDragControls, PanInfo } from "framer-motion";
import { X } from "lucide-react";
import { springNative } from "@/lib/motion";
import { hapticImpact } from "@/lib/haptics";
import { ImpactStyle } from "@capacitor/haptics";

export default function IOSSheet({
  open,
  title,
  onClose,
  detent = "full",
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  detent?: "half" | "full";
  children: React.ReactNode;
}) {
  const controls = useDragControls();

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 120 || info.velocity.y > 800) {
      void hapticImpact(ImpactStyle.Light);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Хаах"
            className="ios-sheet-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={`ios-sheet liquid-glass-sheet ${detent === "half" ? "ios-sheet--half" : ""}`}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={springNative}
            drag="y"
            dragControls={controls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.05, bottom: 0.5 }}
            onDragEnd={onDragEnd}
          >
            <div
              className="ios-sheet__handle"
              onPointerDown={(e) => controls.start(e)}
              style={{ cursor: "grab", touchAction: "none", padding: "8px 0", marginTop: 0 }}
            />
            <div className="ios-sheet__head">
              <h3>{title}</h3>
              <button type="button" className="ios-icon-btn" aria-label="Хаах" onClick={onClose}>
                <X size={20} strokeWidth={1.75} />
              </button>
            </div>
            <div className="ios-sheet__body">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
