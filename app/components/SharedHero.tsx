"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { springNative } from "@/lib/motion";
import { BLUR_DATA_URL } from "@/lib/image-blur";

export function sharedHeroId(kind: "shop" | "event" | "lesson", id: string) {
  return `vcm-${kind}-${id}`;
}

type SharedHeroProps = {
  kind: "shop" | "event" | "lesson";
  id: string;
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  sizes?: string;
  priority?: boolean;
  /** Card corner radius while flying */
  radius?: number;
};

/** Shared layoutId wrapper — list thumb ↔ detail hero. */
export default function SharedHero({
  kind,
  id,
  src,
  alt,
  className = "",
  imgClassName = "object-cover",
  sizes = "100vw",
  priority,
  radius = 0,
}: SharedHeroProps) {
  const ref = useRef<HTMLDivElement>(null);

  if (!src) return null;

  return (
    <motion.div
      ref={ref}
      layoutId={sharedHeroId(kind, String(id))}
      className={`shared-hero ${className}`}
      initial={false}
      style={{
        borderRadius: radius,
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
      }}
      transition={springNative}
      onLayoutAnimationComplete={() => {
        const el = ref.current;
        if (!el) return;
        el.style.transform = "";
        el.style.opacity = "1";
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className={imgClassName}
        sizes={sizes}
        priority={priority}
        placeholder="blur"
        blurDataURL={BLUR_DATA_URL}
        style={{ objectFit: "cover" }}
      />
    </motion.div>
  );
}
