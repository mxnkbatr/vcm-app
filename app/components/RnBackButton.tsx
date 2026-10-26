"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "@/navigation";

type RnBackButtonProps = {
  label?: string;
  onPress?: () => void;
  /** Light glyphs on dark hero media */
  light?: boolean;
  className?: string;
};

/** React Navigation–style stack back: ‹ + title. */
export default function RnBackButton({
  label = "Буцах",
  onPress,
  light = false,
  className = "",
}: RnBackButtonProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      className={`rn-back press ${light ? "rn-back--light" : ""} ${className}`.trim()}
      onClick={() => (onPress ? onPress() : router.back())}
      aria-label={label}
    >
      <ChevronLeft size={28} strokeWidth={2.35} className="rn-back__chevron" />
      <span className="rn-back__label">{label}</span>
    </button>
  );
}
