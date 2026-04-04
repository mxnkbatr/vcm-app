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
const MarketCard = ({ item, index, isDark }: any) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      transition={{ delay: index * 0.1 }}
      className={`relative group rounded-[2rem] overflow-hidden cursor-pointer h-full border transition-all duration-500 min-h-[450px] flex flex-col
        ${isDark
          ? "bg-slate-900 border-white/5 hover:border-sky-500/20"
          : "bg-white border-slate-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-15px_rgba(14,165,233,0.15)] hover:border-sky-200"
        }`}
    >
      {/* Image Container Area (Using beautiful gradients + icons since these are programs, not physical goods) */}
      <div className="relative w-full h-64 overflow-hidden bg-gradient-to-br from-sky-50 to-white flex items-center justify-center">
        <item.icon size={80} strokeWidth={1} className="group-hover:scale-[1.15] transition-transform duration-700 text-sky-200 drop-shadow-sm" />
        
        {/* Category pill */}
        <div className="absolute top-4 left-4 z-10">
           <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-sky-600 border border-white/50 backdrop-blur-md bg-white/90 shadow-sm">
            Program
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow relative z-20">
        <div className="flex justify-between items-start mb-4 gap-4">
          <h3 className={`text-xl font-black tracking-tight line-clamp-2 transition-colors ${isDark ? 'text-white' : 'text-slate-900 group-hover:text-sky-600'}`}>
            {item.title}
          </h3>
          <span className={`text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap bg-sky-50 text-sky-600 flex items-center gap-1`}>
            <Sparkles size={10} />
            {item.price}
          </span>
        </div>
        
        <p className={`text-sm leading-relaxed mb-6 line-clamp-3 flex-grow ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          {item.desc}
        </p>

        {/* Footer Area */}
        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
          <div className={`text-xs font-bold uppercase tracking-wider text-sky-500 flex items-center gap-1.5`}>
            <CheckCircle2 size={12} />
            Available
          </div>
          
          <div className={`flex items-center gap-2 font-black uppercase tracking-widest text-[10px] transition-all ${isDark ? 'text-white' : 'text-slate-900 group-hover:text-sky-600'}`}>
            Explore
            <span className="p-1.5 rounded-full text-white shadow-md bg-sky-500 group-hover:scale-110 transition-transform">
              <ArrowUpRight size={12} />
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- MAIN SECTION ---
export default function Marketplace() {
  const t = useTranslations("Marketplace");
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  const isDark = mounted && (theme === 'dark');

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
    <section className={`relative py-24 md:py-32 overflow-hidden transition-colors duration-700
       ${isDark ? "bg-slate-950" : "bg-slate-50/50"}`}>

      {/* BACKGROUND EFFECTS */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />

        {/* Sky Blob 1 */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.1, 0.05], x: [0, 40, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          style={{ backgroundColor: BRAND.PRIMARY }}
          className="absolute -top-[10%] -left-[10%] w-[800px] h-[800px] rounded-full blur-[120px] mix-blend-multiply"
        />

        {/* Sky Blob 2 */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.08, 0.03], x: [0, -30, 0] }}
          transition={{ duration: 18, repeat: Infinity, delay: 2, ease: "easeInOut" }}
          style={{ backgroundColor: BRAND.ACCENT }}
          className="absolute bottom-0 right-[5%] w-[600px] h-[600px] rounded-full blur-[100px] mix-blend-multiply"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">

        {/* HEADER SECTION */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-20 text-center lg:text-left">
          <div className="max-w-2xl mx-auto lg:mx-0">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center justify-center lg:justify-start gap-3 mb-6"
            >
              <div className="w-8 h-1 rounded-full" style={{ backgroundColor: BRAND.PRIMARY }} />
              <span className="text-xs font-black uppercase tracking-[0.25em]" style={{ color: BRAND.PRIMARY }}>
                {t("badge")}
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`text-5xl md:text-6xl font-black tracking-tighter leading-[1] mb-6
                       ${isDark ? "text-white" : "text-slate-900"}`}
            >
              {t("title")}<span style={{ color: BRAND.PRIMARY }}>.</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`text-lg font-medium leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}
            >
              {t("subtitle")}
            </motion.p>
          </div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Link href="/programs" className={`group relative inline-flex items-center gap-4 px-10 py-5 rounded-full transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 overflow-hidden`}
              style={{ backgroundColor: BRAND.PRIMARY, boxShadow: `0 15px 30px -10px rgba(14, 165, 233, 0.3)` }}>

              {/* Shine Effect */}
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />

              <span className="relative z-10 text-xs font-bold uppercase tracking-[0.15em] text-white">
                {t("start")}
              </span>
              <div className="relative z-10 w-8 h-8 rounded-full bg-sky-500 ring-2 ring-white/20 text-white flex items-center justify-center group-hover:bg-white group-hover:text-sky-500 group-hover:ring-transparent transition-all duration-300">
                <ShoppingBag size={14} strokeWidth={2} />
              </div>
            </Link>
          </motion.div>
        </div>

        {/* MARKETPLACE GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, index) => (
            <MarketCard key={item.id} item={item} index={index} isDark={isDark} />
          ))}
        </div>

      </div>
    </section>
  );
}