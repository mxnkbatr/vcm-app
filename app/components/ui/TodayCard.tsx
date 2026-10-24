"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Link } from "@/navigation";
import { springNative } from "@/lib/motion";

export default function TodayCard({
  href,
  title,
  subtitle,
  eyebrow = "Онцлох",
  image,
  layoutId,
}: {
  href: string;
  title: string;
  subtitle?: string;
  eyebrow?: string;
  image?: string | null;
  layoutId?: string;
}) {
  return (
    <Link href={href} className="press block">
      <motion.div
        className="ios-today"
        layoutId={layoutId}
        whileTap={{ scale: 0.97 }}
        transition={springNative}
      >
        {image ? (
          <Image src={image} alt="" fill className="ios-today__img object-cover" sizes="(max-width: 520px) 100vw, 480px" priority />
        ) : null}
        <div className="ios-today__overlay" />
        <div className="ios-today__content">
          <p className="ios-today__eyebrow">{eyebrow}</p>
          <h2 className="ios-today__title">{title}</h2>
          {subtitle ? <p className="ios-today__sub">{subtitle}</p> : null}
        </div>
      </motion.div>
    </Link>
  );
}
