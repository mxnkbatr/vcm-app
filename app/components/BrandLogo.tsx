"use client";

import Image from "next/image";
import { BRAND } from "@/lib/branding";

type BrandLogoProps = {
  size?: number;
  className?: string;
  priority?: boolean;
};

export default function BrandLogo({ size = 40, className = "object-contain", priority }: BrandLogoProps) {
  return (
    <Image
      src={BRAND.logo}
      alt={BRAND.name}
      width={size}
      height={size}
      className={className}
      priority={priority}
    />
  );
}
