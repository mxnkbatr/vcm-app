"use client";

import { Link } from "@/navigation";
import PremiumPageShell from "@/app/components/PremiumPageShell";

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
    <PremiumPageShell>
      <div className="premium-empty-state pt-10">
        <p className="premium-empty-state__title">{mn ? titleMn : titleEn}</p>
        <p className="premium-empty-state__sub">{mn ? subMn : subEn}</p>
        <Link href="/" className="btn btn-secondary btn-sm mt-4 press">
          {mn ? "Нүүр рүү" : "Back home"}
        </Link>
      </div>
    </PremiumPageShell>
  );
}
