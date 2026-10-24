"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export default function BottomSheet({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Хаах"
            className="vcm-sheet-backdrop"
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
            className="vcm-sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="vcm-sheet__handle" />
            <div className="vcm-sheet__head">
              <h3>{title}</h3>
              <button type="button" onClick={onClose} className="vcm-icon-btn" aria-label="Хаах">
                <X size={18} />
              </button>
            </div>
            <div className="vcm-sheet__body">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
