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
    <div className="auth-screen auth-screen--liquid">
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
          className="auth-screen__card glass-surface"
        >
          <div className="auth-screen__hero">
            <div className="auth-screen__logo-glow">
              <BrandLogo size={64} priority />
            </div>
            <h1 className="auth-screen__title">{title}</h1>
            {subtitle ? <p className="auth-screen__sub">{subtitle}</p> : null}
          </div>

          <div className="auth-screen__form">{children}</div>

          <button type="button" className="auth-apple-btn press" disabled aria-disabled>
            <span className="auth-apple-btn__icon" aria-hidden>
              {/* Apple mark placeholder — wire Sign in with Apple later */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.365 1.43c0 1.14-.422 2.2-1.187 3.023-.81.875-2.14 1.55-3.28 1.46-.147-1.09.42-2.24 1.17-3.02.8-.83 2.18-1.43 3.297-1.463zM20.75 17.2c-.58 1.3-.86 1.88-1.61 3.03-1.05 1.59-2.53 3.57-4.37 3.59-1.63.02-2.05-1.06-4.27-1.05-2.21.01-2.68 1.07-4.31 1.05-1.84-.02-3.25-1.8-4.3-3.39C.3 17.2-.9 12.66.98 9.55c.94-1.56 2.62-2.55 4.2-2.55 1.66 0 2.7 1.08 4.07 1.08 1.32 0 2.13-1.09 4.05-1.09 1.44 0 2.96.78 4.04 2.13-3.55 1.95-2.98 7.03.41 7.98z" />
              </svg>
            </span>
            Apple-ээр нэвтрэх
          </button>

          {footer && <div className="auth-screen__footer">{footer}</div>}
        </motion.div>
      </div>

      {stickyAction ? <div className="auth-screen__sticky glass-surface">{stickyAction}</div> : null}
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
