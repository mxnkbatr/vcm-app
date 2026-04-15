"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

interface IOSAlertProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: "success" | "error" | "info";
  confirmText?: string;
}

export const IOSAlert = ({
  isOpen,
  onClose,
  title,
  message,
  type = "info",
  confirmText = "OK"
}: IOSAlertProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative w-full max-w-[270px] bg-white/80 backdrop-blur-xl rounded-[14px] shadow-2xl overflow-hidden flex flex-col items-center text-center border border-white/40"
            style={{ 
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              WebkitBackdropFilter: 'blur(20px)'
            }}
          >
            <div className="p-5 space-y-1">
              {type === "success" && <CheckCircle2 size={32} className="mx-auto mb-2 text-emerald-500" />}
              {type === "error" && <XCircle size={32} className="mx-auto mb-2 text-rose-500" />}
              {type === "info" && <Info size={32} className="mx-auto mb-2 text-blue-500" />}
              
              <h3 className="t-headline !text-[17px] font-semibold tracking-tight">{title}</h3>
              <p className="t-footnote !text-[13px] leading-tight" style={{ color: 'var(--label2)' }}>{message}</p>
            </div>

            <button
              onClick={onClose}
              className="w-full h-[44px] border-t border-black/10 flex items-center justify-center t-headline !text-[17px] font-semibold active:bg-black/5 transition-colors"
              style={{ color: 'var(--blue)' }}
            >
              {confirmText}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const IOSSheet = ({
  isOpen,
  onClose,
  children,
  title
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
            className="relative w-full max-w-[520px] bg-white rounded-t-[20px] shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]"
            style={{ background: 'var(--bg)' }}
          >
            {/* Handle */}
            <div className="h-1.5 w-10 bg-slate-300 rounded-full mx-auto my-3" />
            
            {title && (
              <div className="px-5 pb-4 flex justify-between items-center border-b" style={{ borderColor: 'var(--label4)' }}>
                <h3 className="t-headline">{title}</h3>
                <button onClick={onClose} className="p-1 rounded-full" style={{ background: 'var(--fill2)', color: 'var(--label2)' }}>
                  <X size={18} />
                </button>
              </div>
            )}
            
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
            
            {/* Bottom Safe Area Padding */}
            <div className="h-safe" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
