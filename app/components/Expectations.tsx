"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Star,
  Home,
  Gift,
  ArrowUpRight,
  Sparkles,
  ShoppingBag,
  CheckCircle2
} from "lucide-react";
import {
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { Motion as motion } from "./MotionProxy";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";

// --- BRAND CONFIG ---
const BRAND = {
  PRIMARY: "#0EA5E9",       // Sky Blue
  PRIMARY_SOFT: "rgba(14, 165, 233, 0.1)",
  ACCENT: "#38BDF8",        // Lighter Sky
  DARK: "#0F172A",          // Slate 900
};

// --- SHOP UI MARKETPLACE CARD ---
const MarketCard = ({ item, index }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="card overflow-hidden press flex flex-col h-full"
      whileTap={{ scale: 0.97 }}
    >
      <div className="relative w-full h-48 bg-slate-50 flex items-center justify-center">
        <item.icon size={64} strokeWidth={1.5} style={{ color: 'var(--blue)' }} className="opacity-20" />
        <div className="absolute top-3 left-3">
           <span className="badge" style={{ background: 'var(--blue-dim)', color: 'var(--blue)' }}>
            Program
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow space-y-3">
        <div className="flex justify-between items-start gap-2">
          <h3 className="t-headline line-clamp-2">{item.title}</h3>
          <span className="badge" style={{ background: 'var(--fill2)', color: 'var(--label2)' }}>
            {item.price}
          </span>
        </div>
        
        <p className="t-footnote line-clamp-3 flex-grow" style={{ color: 'var(--label2)' }}>
          {item.desc}
        </p>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="t-caption font-semibold flex items-center gap-1" style={{ color: 'var(--blue)' }}>
            <CheckCircle2 size={12} />
            Available
          </div>
          <span className="t-caption font-bold" style={{ color: 'var(--blue)' }}>Explore ›</span>
        </div>
      </div>
    </motion.div>
  );
};

export default function Marketplace() {
  const t = useTranslations("Marketplace");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const items = [
    {
      id: 1,
      icon: GraduationCap,
      title: t("item1_title"),
      desc: t("item1_desc"),
      price: t("item1_price"),
    },
    {
      id: 2,
      icon: Star,
      title: t("item2_title"),
      desc: t("item2_desc"),
      price: t("item2_price"),
    },
    {
      id: 3,
      icon: Home,
      title: t("item3_title"),
      desc: t("item3_desc"),
      price: t("item3_price"),
    },
    {
      id: 4,
      icon: Gift,
      title: t("item4_title"),
      desc: t("item4_desc"),
      price: t("item4_price"),
    }
  ];

  if (!mounted) return null;

  return (
    <section className="py-16 px-4 sm:px-6" style={{ background: 'var(--bg3)' }}>
      <div className="max-w-5xl mx-auto space-y-10">
        
        <div className="space-y-2">
          <div className="badge" style={{ background: 'var(--blue-dim)', color: 'var(--blue)' }}>
            {t("badge")}
          </div>
          <h2 className="t-large-title">{t("title")}</h2>
          <p className="t-subhead" style={{ color: 'var(--label2)' }}>{t("subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger">
          {items.map((item, index) => (
            <MarketCard key={item.id} item={item} index={index} />
          ))}
        </div>

        <div className="pt-4">
          <Link href="/programs" className="btn btn-primary btn-full py-5">
            {t("start")} <ArrowUpRight size={18} className="ml-2" />
          </Link>
        </div>

      </div>
    </section>
  );
}