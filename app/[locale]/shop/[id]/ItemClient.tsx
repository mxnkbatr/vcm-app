"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { ArrowLeft, ShoppingCart, Check, AlertCircle, Package } from "lucide-react";

const T = {
  back: { en: "Back to Shop", mn: "Буцах", de: "Zurück zum Shop" },
  details: { en: "Product Details", mn: "Бүтээгдэхүүний тухай", de: "Produktdetails" },
  inStockPrefix: { en: "in stock — Ready to ship", mn: "Агуулахад", de: "auf Lager — Versandfertig" },
  inStockSuffix: { en: "", mn: "ширхэг байна", de: "" },
  outOfStock: { en: "Out of stock", mn: "Дууссан", de: "Ausverkauft" },
  order: { en: "Order / Purchase", mn: "Захиалах", de: "Bestellen / Kaufen" },
  catGeneral: { en: "General", mn: "Ерөнхий", de: "Allgemein" },
} as const;

const formatCategory = (cat: string, locale: string) => {
  if (!cat || cat.toLowerCase() === 'general') {
    return T.catGeneral[locale as keyof typeof T.catGeneral] || T.catGeneral.en;
  }
  return cat.charAt(0).toUpperCase() + cat.slice(1);
};

export default function ItemClient({ item, locale = 'en' }: { item: any; locale: string }) {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => setMounted(true), []);
  const isDark = mounted && theme === "dark";

  const name = item.name?.[locale] || item.name?.en || "Unknown Item";
  const desc = item.description?.[locale] || item.description?.en || "";

  if (!mounted) return null;

  return (
    <div className="max-w-5xl mx-auto px-6">
      {/* Back button */}
      <Link 
        href={`/${locale}/shop`}
        className={`inline-flex items-center gap-2 mb-8 text-xs font-bold uppercase tracking-wider transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-sky-600'}`}
      >
        <ArrowLeft size={14} />
        {T.back[locale as keyof typeof T.back] || T.back.en}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        
        {/* Left: Image */}
        <motion.div 
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          className={`relative w-full aspect-square overflow-hidden rounded-2xl border bg-slate-50 ${isDark ? 'border-white/5 bg-slate-900' : 'border-slate-100'}`}
        >
          <Image
            src={item.image || "/placeholder.jpg"}
            alt={name}
            fill
            className="object-cover"
            priority
          />
        </motion.div>

        {/* Right: Product Info */}
        <motion.div 
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col justify-center"
        >
          {/* Category */}
          <div className="mb-4">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-sky-600 border border-sky-100 bg-sky-50">
              {formatCategory(item.category || "general", locale)}
            </span>
          </div>

          <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
            {name}
          </h1>

          <div className="flex items-center gap-3 mb-6">
            <span className={`text-2xl font-extrabold ${isDark ? "text-white" : "text-slate-900"}`}>
              ${item.price}
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${item.stock > 0 ? 'bg-sky-50 text-sky-500 border border-sky-100' : 'bg-slate-50 text-slate-400 border border-slate-200'}`}>
              {item.stock > 0 
                ? (locale === "mn" 
                    ? `${T.inStockPrefix.mn} ${item.stock} ${T.inStockSuffix.mn}` 
                    : `${item.stock} ${T.inStockPrefix[locale as keyof typeof T.inStockPrefix] || T.inStockPrefix.en}`)
                : (T.outOfStock[locale as keyof typeof T.outOfStock] || T.outOfStock.en)
              }
            </span>
          </div>

          <div className={`w-full h-px mb-6 ${isDark ? 'bg-white/10' : 'bg-slate-100'}`} />

          {/* Description */}
          <div className="mb-8">
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {T.details[locale as keyof typeof T.details] || T.details.en}
            </h3>
            <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {desc}
            </p>
          </div>

          {/* Order Button */}
          <button
            disabled={item.stock <= 0}
            className={`w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl text-sm font-bold uppercase tracking-wider text-white transition-all ${
              item.stock <= 0 
                ? "bg-slate-300 cursor-not-allowed" 
                : "bg-sky-500 hover:bg-sky-600 shadow-md shadow-sky-200 hover:shadow-lg hover:shadow-sky-200 active:scale-[0.98]"
            }`}
          >
            <ShoppingCart size={16} />
            {T.order[locale as keyof typeof T.order] || T.order.en}
          </button>
        </motion.div>

      </div>
    </div>
  );
}
