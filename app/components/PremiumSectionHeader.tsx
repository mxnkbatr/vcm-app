"use client";

import { Link } from "@/navigation";
import { ChevronRight } from "lucide-react";

export default function PremiumSectionHeader({
  title,
  subtitle,
  href,
  linkLabel = "Бүгд",
}: {
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="premium-section-header">
      <div className="min-w-0">
        <h2 className="premium-section-header__title">{title}</h2>
        {subtitle && <p className="premium-section-header__sub">{subtitle}</p>}
      </div>
      {href && (
        <Link href={href} className="premium-section-header__link press">
          {linkLabel}
          <ChevronRight size={14} strokeWidth={2.5} />
        </Link>
      )}
    </div>
  );
}
