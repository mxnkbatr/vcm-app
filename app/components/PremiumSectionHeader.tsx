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
    <div className="ios26-section-head">
      <div className="min-w-0">
        <h2 className="ios26-section-head__title">{title}</h2>
        {subtitle ? <p className="ios26-section-head__sub">{subtitle}</p> : null}
      </div>
      {href ? (
        <Link href={href} className="ios26-section-head__link press">
          <span>{linkLabel.replace(/\s*→\s*$/, "")}</span>
          <ChevronRight size={15} strokeWidth={2.4} aria-hidden />
        </Link>
      ) : null}
    </div>
  );
}
