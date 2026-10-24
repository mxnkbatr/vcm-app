"use client";

import { Link } from "@/navigation";
import { ChevronRight } from "lucide-react";

export function IOSList({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`ios-list ${className}`}>{children}</div>;
}

export function IOSListRow({
  href,
  onClick,
  icon,
  title,
  subtitle,
  trailing,
  destructive,
}: {
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
  destructive?: boolean;
}) {
  const content = (
    <>
      {icon ? <span className="ios-list-row__icon">{icon}</span> : null}
      <span className="ios-list-row__text">
        <span className="ios-list-row__title" style={destructive ? { color: "var(--red)" } : undefined}>
          {title}
        </span>
        {subtitle ? <span className="ios-list-row__sub">{subtitle}</span> : null}
      </span>
      {trailing ?? (href ? <ChevronRight size={18} strokeWidth={1.75} className="ios-list-row__chev" /> : null)}
    </>
  );

  if (href) {
    return (
      <Link href={href} className="ios-list-row press">
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className="ios-list-row press" onClick={onClick}>
      {content}
    </button>
  );
}
