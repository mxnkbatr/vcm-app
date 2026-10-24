"use client";

import { Link } from "@/navigation";
import { Globe } from "lucide-react";
import PremiumPageShell from "@/app/components/PremiumPageShell";
import EmptyState from "@/app/components/ui/EmptyState";

export default function NativeFeatureUnavailable({
  locale = "mn",
  titleMn = "Энэ хэсэг апп дээр байхгүй",
  titleEn = "Not available in the app",
  subMn = "Веб хувилбараас үзнэ үү.",
  subEn = "Please use the website for this feature.",
}: {
  locale?: string;
  titleMn?: string;
  titleEn?: string;
  subMn?: string;
  subEn?: string;
}) {
  const mn = locale === "mn";
  return (
    <PremiumPageShell className="ios26-page">
      <EmptyState
        icon={Globe}
        title={mn ? titleMn : titleEn}
        description={mn ? subMn : subEn}
        actionLabel={mn ? "Нүүр рүү" : "Back home"}
        href="/"
      />
      <div className="text-center mt-2">
        <Link href="/" className="ios-subhead press" style={{ color: "var(--blue)" }}>
          {mn ? "Нүүр рүү буцах" : "Return home"}
        </Link>
      </div>
    </PremiumPageShell>
  );
}
