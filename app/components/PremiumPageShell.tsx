"use client";

import React from "react";

type PremiumPageShellProps = {
  children: React.ReactNode;
  className?: string;
  /** Tab bar доор зай — default true */
  bottomPad?: boolean;
  /** Header spacer алгасах (immersive detail pages) */
  immersive?: boolean;
  /** px-5 inner wrapper — default true */
  padded?: boolean;
};

/** Home-той ижил premium cream shell — бүх tab/page дээр */
export default function PremiumPageShell({
  children,
  className = "",
  bottomPad = true,
  immersive = false,
  padded = true,
}: PremiumPageShellProps) {
  return (
    <div
      className={`min-h-dvh relative premium-page premium-page-enter ${className}`}
      style={
        bottomPad
          ? { paddingBottom: "calc(env(safe-area-inset-bottom, 34px) + 100px)" }
          : undefined
      }
    >
      <div className="premium-ambient" aria-hidden>
        <div className="premium-ambient__mesh" />
        <div className="premium-ambient__grain" />
      </div>
      {!immersive && <div className="native-header-spacer" aria-hidden />}
      {padded ? (
        <div className="premium-page-body relative z-[1] px-5 pb-4 max-w-[520px] mx-auto w-full">
          {children}
        </div>
      ) : (
        <div className="relative z-[1]">{children}</div>
      )}
    </div>
  );
}
