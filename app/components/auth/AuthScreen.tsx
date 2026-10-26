"use client";

import React from "react";
import BrandLogo from "@/app/components/BrandLogo";
import { Link } from "@/navigation";
import { ChevronLeft } from "lucide-react";

type AuthMode = "sign-in" | "sign-up";

type AuthScreenProps = {
  mode: AuthMode;
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  children: React.ReactNode;
  /** Primary CTA — rendered inside the card (dcapital style) */
  action?: React.ReactNode;
  showBack?: boolean;
};

export default function AuthScreen({
  mode,
  title,
  subtitle,
  eyebrow,
  children,
  action,
  showBack = true,
}: AuthScreenProps) {
  const isLogin = mode === "sign-in";
  const resolvedTitle = title ?? (isLogin ? "Нэвтрэх" : "Бүртгүүлэх");
  const resolvedEyebrow = eyebrow ?? (isLogin ? "Тавтай морил" : "Шинэ акаунт");
  const resolvedSub =
    subtitle ??
    (isLogin
      ? "Имэйл, нууц үгээрээ нэвтэрнэ үү."
      : "Бүртгүүлээд сайн дурын аяллаа эхлүүлээрэй.");

  return (
    <div className="auth-page app-detail--auth">
      <div className="auth-page__bg" aria-hidden />

      <div className="auth-page__top">
        {showBack ? (
          <Link href="/" className="app-detail__nav-btn press" aria-label="Буцах">
            <ChevronLeft size={22} strokeWidth={2.1} />
          </Link>
        ) : (
          <span className="auth-page__spacer" aria-hidden />
        )}
        <Link href="/" className="auth-page__brand press">
          <BrandLogo size={28} priority />
          <span>VCM</span>
        </Link>
        <span className="auth-page__spacer" aria-hidden />
      </div>

      <div className="auth-page__center">
        {/* No framer transform here — iOS password focus + transform = white screen */}
        <div className="auth-card app-detail__card">
          <p className="auth-card__eyebrow">{resolvedEyebrow}</p>
          <h1 className="auth-card__title">{resolvedTitle}</h1>
          <p className="auth-card__lead">{resolvedSub}</p>

          <div className="auth-tabs" role="tablist" aria-label="Нэвтрэх эсвэл бүртгүүлэх">
            <Link
              href="/sign-in"
              className={`auth-tabs__item press ${isLogin ? "is-active" : ""}`}
              role="tab"
              aria-selected={isLogin}
            >
              Нэвтрэх
            </Link>
            <Link
              href="/sign-up"
              className={`auth-tabs__item press ${!isLogin ? "is-active" : ""}`}
              role="tab"
              aria-selected={!isLogin}
            >
              Бүртгүүлэх
            </Link>
          </div>

          <div className="auth-card__body">{children}</div>

          {action ? <div className="auth-card__action">{action}</div> : null}

          <p className="auth-card__foot">
            {isLogin ? (
              <>
                Бүртгэлгүй юу?{" "}
                <Link href="/sign-up" className="press">
                  Бүртгүүлэх
                </Link>
              </>
            ) : (
              <>
                Бүртгэлтэй юу?{" "}
                <Link href="/sign-in" className="press">
                  Нэвтрэх
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
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
