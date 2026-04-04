"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { ArrowUpRight, ShoppingBag, Loader2, Store, Sparkles, Package } from "lucide-react";

const BRAND = {
  PRIMARY: "#0EA5E9",
  ACCENT: "#38BDF8",
};

const T = {
  inStock: { en: "In Stock", mn: "Агуулахад байгаа", de: "Auf Lager" },
  outOfStock: { en: "Out of Stock", mn: "Дууссан", de: "Ausverkauft" },
  view: { en: "View", mn: "Үзэх", de: "Ansehen" },
  shopTitle: { en: "Our Shop", mn: "Дэлгүүр", de: "Unser Shop" },
  shopDesc: { 
    en: "Discover our curated selection of premium products and merchandise.", 
    mn: "Бидний санал болгож буй дээд зэрэглэлийн бүтээгдэхүүнүүд.", 
    de: "Entdecken Sie unsere kuratierte Auswahl an Premium-Produkten und Fanartikeln." 
  },
  notFound: { en: "No items found", mn: "Бүтээгдэхүүн олдсонгүй", de: "Keine Artikel gefunden" },
  notFoundSub: { en: "Check back soon for new arrivals!", mn: "Удахгүй шинэ бүтээгдэхүүн нэмэгдэнэ!", de: "Schauen Sie bald wieder vorbei!" },
  catAll: { en: "All", mn: "Бүгд", de: "Alle" },
  catGeneral: { en: "General", mn: "Ерөнхий", de: "Allgemein" },
} as const;

const formatCategory = (cat: string, locale: string) => {
  if (!cat || cat.toLowerCase() === 'general') {
    return T.catGeneral[locale as keyof typeof T.catGeneral] || T.catGeneral.en;
  }
  if (cat.toLowerCase() === 'all') {
    return T.catAll[locale as keyof typeof T.catAll] || T.catAll.en;
  }
  return cat.charAt(0).toUpperCase() + cat.slice(1);
};

const ProductCard = ({ item, locale = 'en', isDark }: any) => {
  const name = item.name?.[locale] || item.name?.en || "Unknown Item";
  const desc = item.description?.[locale] || item.description?.en || "";
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      className={`relative group rounded-2xl overflow-hidden cursor-pointer h-full border transition-all duration-400 flex flex-col
        ${isDark
          ? "bg-slate-900 border-white/5 hover:border-sky-500/30 hover:bg-slate-800"
          : "bg-white border-slate-100 shadow-sm hover:shadow-lg hover:shadow-sky-50 hover:border-sky-200"
        }`}
    >
      {/* Image */}
      <div className="relative w-full h-56 overflow-hidden bg-slate-50">
        <Image
          src={item.image || "/placeholder.jpg"}
          alt={name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
        {/* Category pill */}
        <div className="absolute top-3 left-3 z-10">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-sky-600 border border-sky-100/50 backdrop-blur-sm bg-white/90 shadow-sm">
            {formatCategory(item.category || "general", locale)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-3 gap-3">
          <h3 className={`text-base font-bold tracking-tight line-clamp-2 transition-colors leading-snug ${isDark ? 'text-white' : 'text-slate-900 group-hover:text-sky-600'}`}>
            {name}
          </h3>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap bg-sky-50 text-sky-600 border border-sky-100">
            ${item.price}
          </span>
        </div>
        
        <p className={`text-sm leading-relaxed mb-4 line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {desc}
        </p>

        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
          <div className={`text-[10px] font-bold uppercase tracking-wider ${item.stock > 0 ? 'text-sky-500' : 'text-slate-400'}`}>
            {item.stock > 0 ? T.inStock[locale as keyof typeof T.inStock] || T.inStock.en : T.outOfStock[locale as keyof typeof T.outOfStock] || T.outOfStock.en}
          </div>
          
          <Link href={`/${locale}/shop/${item._id}`} className={`flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] transition-all hover:gap-2.5 ${isDark ? 'text-white' : 'text-slate-700 group-hover:text-sky-600'}`}>
            {T.view[locale as keyof typeof T.view] || T.view.en}
            <span className="p-1.5 rounded-full text-white shadow-sm bg-sky-500 transition-transform group-hover:scale-110">
              <ArrowUpRight size={10} />
            </span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default function ShopClient({ items, locale }: { items: any[], locale: string }) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState("all");

  useEffect(() => setMounted(true), []);
  const isDark = mounted && (theme === "dark");

  const categories = ["all", ...Array.from(new Set(items.map((item: any) => item.category).filter(Boolean)))];
  const filteredItems = items.filter((item: any) => filter === "all" || item.category === filter);

  if (!mounted) return null;

  return (
    <div className="relative px-6 overflow-hidden transition-colors duration-500">

      {/* Subtle background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-sky-50 rounded-full blur-[120px] opacity-40" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-blue-50 rounded-full blur-[120px] opacity-30" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 border border-sky-100 text-sky-600 shadow-sm mb-5"
          >
            <Store size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              {locale === 'mn' ? 'Дэлгүүр' : 'Shop'}
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className={`text-3xl sm:text-4xl md:text-[3rem] font-extrabold tracking-tight leading-tight mb-3 ${isDark ? "text-white" : "text-slate-900"}`}
          >
            {T.shopTitle[locale as keyof typeof T.shopTitle] || T.shopTitle.en}
            <span className="text-sky-500">.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`text-base font-medium max-w-lg mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
          >
            {T.shopDesc[locale as keyof typeof T.shopDesc] || T.shopDesc.en}
          </motion.p>

          {/* Quick stats */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-wrap justify-center gap-5 mt-6"
          >
            {[
              { icon: <Package size={14} />, label: `${items.length} ${locale === 'mn' ? 'Бүтээгдэхүүн' : 'Products'}` },
              { icon: <Sparkles size={14} />, label: locale === 'mn' ? 'Чанартай' : 'Premium Quality' },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
                <span className="text-sky-500">{stat.icon}</span>
                {stat.label}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Categories Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat: any) => {
            const isActive = filter === cat;
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`
                  whitespace-nowrap px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all border
                  ${isActive 
                    ? "bg-sky-500 border-sky-500 text-white shadow-md shadow-sky-200" 
                    : (isDark ? "text-slate-400 border-white/10 hover:border-white/30 hover:text-white" : "text-slate-500 border-slate-200 hover:border-sky-300 hover:text-sky-600 bg-white")}
                `}
              >
                {formatCategory(cat, locale)}
              </button>
            )
          })}
        </div>

        {/* Product Grid */}
        <div className="min-h-[400px]">
          {filteredItems.length > 0 ? (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              <AnimatePresence mode="popLayout">
                {filteredItems.map((item: any) => (
                  <ProductCard key={item._id} item={item} locale={locale} isDark={isDark} />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="text-center py-20 bg-sky-50/50 rounded-2xl border border-dashed border-sky-200">
              <div className="w-14 h-14 bg-sky-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ShoppingBag size={24} className="text-sky-400" />
              </div>
              <p className="text-slate-600 font-bold text-sm mb-1">
                {T.notFound[locale as keyof typeof T.notFound] || T.notFound.en}
              </p>
              <p className="text-slate-400 text-xs">
                {T.notFoundSub[locale as keyof typeof T.notFoundSub] || T.notFoundSub.en}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}