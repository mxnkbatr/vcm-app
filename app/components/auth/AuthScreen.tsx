"use client";

import React from "react";
import BrandLogo from "@/app/components/BrandLogo";
import { Link } from "@/navigation";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { springNative } from "@/lib/motion";

type AuthScreenProps = {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  showBack?: boolean;
  stickyAction?: React.ReactNode;
};

export default function AuthScreen({
  title = "Тавтай морил",
  subtitle,
  children,
  footer,
  showBack = true,
  stickyAction,
}: AuthScreenProps) {
  return (
    <div className="auth-screen">
      {showBack && (
        <div className="auth-screen__nav">
          <Link href="/" className="app-header__round press" aria-label="Буцах">
            <ChevronLeft size={22} strokeWidth={1.75} />
          </Link>
        </div>
      )}

      <div className={`auth-screen__body ${stickyAction ? "has-sticky" : ""}`}>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springNative}
          className="auth-screen__hero"
        >
          <BrandLogo size={64} priority className="mb-5" />
          <h1 className="auth-screen__title">{title}</h1>
          {subtitle ? <p className="auth-screen__sub">{subtitle}</p> : null}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springNative, delay: 0.04 }}
          className="auth-screen__form"
        >
          {children}
        </motion.div>

        {footer && <div className="auth-screen__footer">{footer}</div>}
      </div>

      {stickyAction ? <div className="auth-screen__sticky">{stickyAction}</div> : null}
    </div>
  );
}

export function AuthError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="auth-inline-error" role="alert">
      {message}
    </div>
  );
}
