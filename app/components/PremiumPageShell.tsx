"use client";

type PremiumPageShellProps = {
  children: React.ReactNode;
  className?: string;
  bottomPad?: boolean;
  immersive?: boolean;
  padded?: boolean;
};

export default function PremiumPageShell({
  children,
  className = "",
  bottomPad = true,
  immersive = false,
  padded = true,
}: PremiumPageShellProps) {
  return (
    <div className={`ios-page ${bottomPad ? "" : "!pb-0"} ${className}`}>
      {!immersive && <div className="native-header-spacer lg:hidden" aria-hidden />}
      {padded ? <div className="ios-page__pad">{children}</div> : children}
    </div>
  );
}
