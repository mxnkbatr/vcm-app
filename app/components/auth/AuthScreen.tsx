"use client";

import React from "react";
import BrandLogo from "@/app/components/BrandLogo";
import { Link } from "@/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, ScanFace } from "lucide-react";
import { springNative } from "@/lib/motion";

type AuthScreenProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  showBack?: boolean;
};

export default function AuthScreen({
  title,
  subtitle,
  children,
  footer,
  showBack = true,
}: AuthScreenProps) {
  return (
    <div
      className="min-h-dvh flex flex-col relative overflow-hidden"
      style={{ background: "var(--bg)", paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      {showBack && (
        <div
          className="absolute top-0 left-0 right-0 z-20 px-4"
          style={{ paddingTop: "calc(env(safe-area-inset-top, 12px) + 8px)" }}
        >
          <Link
            href="/"
            className="press inline-flex items-center gap-1 min-h-[44px] px-2 text-[17px] font-semibold"
            style={{ color: "var(--blue)" }}
          >
            <ChevronLeft size={22} strokeWidth={1.75} />
            Буцах
          </Link>
        </div>
      )}

      <div className="relative z-10 flex-1 flex flex-col justify-center max-w-sm mx-auto w-full px-6 py-10 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springNative}
          className="text-center mb-8"
        >
          <BrandLogo size={72} priority className="mb-5 mx-auto" />
          <div
            className="mx-auto mb-4 w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: "var(--fill2)", color: "var(--blue)" }}
            aria-hidden
          >
            <ScanFace size={28} strokeWidth={1.75} />
          </div>
          <h1 className="ios-large-title" style={{ fontSize: 28 }}>{title}</h1>
          <p className="ios-footnote mt-2">{subtitle}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springNative, delay: 0.05 }}
          className="bg-[var(--card)] p-5 rounded-[20px] border-[0.5px] border-[var(--sep)]"
        >
          {children}
        </motion.div>

        {footer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.12 }}
            className="mt-6 text-center"
          >
            {footer}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export function AuthError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div
      className="mb-3 px-3 py-2.5 rounded-[12px] text-[13px] font-medium"
      style={{ background: "var(--red-dim)", color: "var(--red)" }}
      role="alert"
    >
      {message}
    </div>
  );
}
