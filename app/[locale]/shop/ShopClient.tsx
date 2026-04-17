"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@/navigation";
import { ArrowUpRight, ShoppingBag } from "lucide-react";

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

const ProductCard = ({ item, locale = "en" }: any) => {
  const name = item.name?.[locale] || item.name?.en || "Unknown Item";
  const desc = item.description?.[locale] || item.description?.en || "";
  
  return (
    <motion.div layout initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <Link
        href={`/shop/${item._id}`}
        className="press block overflow-hidden"
        style={{ borderRadius: "var(--r-xl)", background: "var(--bg2)", boxShadow: "var(--s-card)" }}
      >
        <div className="relative overflow-hidden" style={{ aspectRatio: "1 / 1", background: "var(--fill2)" }}>
          <Image
            src={item.image || "/placeholder.jpg"}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 520px) 50vw, 260px"
          />
          <div className="absolute top-2 left-2">
            <span className="badge" style={{ background: "rgba(255,255,255,0.82)", color: "var(--label)" }}>
              {formatCategory(item.category || "general", locale)}
            </span>
          </div>
          <div className="absolute top-2 right-2">
            <span className="badge" style={{ background: "rgba(10,132,255,0.14)", color: "var(--blue)" }}>
              ₮{item.price}
            </span>
          </div>
        </div>

        <div className="p-3">
          <p className="font-semibold text-[13px] leading-snug line-clamp-2" style={{ color: "var(--label)" }}>
            {name}
          </p>
          <p className="text-[11px] mt-1 line-clamp-1" style={{ color: "var(--label2)" }}>
            {desc}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[11px] font-semibold" style={{ color: item.stock > 0 ? "var(--green)" : "var(--label3)" }}>
              {item.stock > 0
                ? T.inStock[locale as keyof typeof T.inStock] || T.inStock.en
                : T.outOfStock[locale as keyof typeof T.outOfStock] || T.outOfStock.en}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold" style={{ color: "var(--label3)" }}>
              {T.view[locale as keyof typeof T.view] || T.view.en} <ArrowUpRight size={12} />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default function ShopClient({ items = [], locale = 'en', isHorizontal = false }: { 
   items?: any[]; 
   locale?: string; 
   isHorizontal?: boolean; 
 }) {
  const [filter, setFilter] = useState("all");
  const categories = useMemo(
    () => ["all", ...Array.from(new Set(items.map((item: any) => item.category).filter(Boolean)))],
    [items]
  );
  const filteredItems = useMemo(
    () => items.filter((item: any) => filter === "all" || item.category === filter),
    [items, filter]
  );

  if (isHorizontal) {
    return (
      <>
        {items.map((item: any) => {
          const name = item.name?.[locale] || item.name?.en || "";
          const inStock = item.stock > 0;
          return (
            <Link
              key={item._id}
              href={`/shop/${item._id}`}
              className="flex-shrink-0 press block overflow-hidden"
              style={{
                width: 164,
                borderRadius: "var(--r-2xl)",
                background: "var(--card)",
                boxShadow: "var(--s-card)",
                border: "0.5px solid var(--sep)",
              }}
            >
              {/* Image */}
              <div
                className="relative overflow-hidden"
                style={{ height: 164, background: "var(--fill2)" }}
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag size={32} style={{ color: "var(--label3)" }} />
                  </div>
                )}
                {/* Price badge */}
                <div
                  className="absolute bottom-2 right-2 px-2 py-1 rounded-xl"
                  style={{
                    background: "rgba(0,0,0,0.55)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                  }}
                >
                  <span className="text-[12px] font-black text-white">
                    ₮{Number(item.price).toLocaleString()}
                  </span>
                </div>
                {/* Out of stock overlay */}
                {!inStock && (
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ background: "rgba(0,0,0,0.42)" }}
                  >
                    <span
                      className="text-[11px] font-black text-white uppercase tracking-widest px-3 py-1.5 rounded-xl"
                      style={{ background: "rgba(255,59,48,0.85)" }}
                    >
                      Дууссан
                    </span>
                  </div>
                )}
              </div>
              {/* Info */}
              <div className="px-3 py-2.5">
                <p
                  className="font-semibold text-[13px] leading-snug line-clamp-2"
                  style={{ color: "var(--label)" }}
                >
                  {name}
                </p>
                <div className="flex items-center justify-between mt-1.5">
                  <span
                    className="text-[11px] font-semibold"
                    style={{ color: inStock ? "var(--green)" : "var(--label3)" }}
                  >
                    {inStock ? "● Байгаа" : "○ Дууссан"}
                  </span>
                  <ArrowUpRight size={13} style={{ color: "var(--label3)" }} />
                </div>
              </div>
            </Link>
          );
        })}
      </>
    );
  }

  return (
    <div className="page">
      <div className="page-inner space-y-4"> 
        {/* Large title */} 
        <div className="pt-2 pb-1"> 
          <h1 className="t-large-title">{T.shopTitle[locale as keyof typeof T.shopTitle] || T.shopTitle.en}</h1> 
          <p className="t-subhead mt-1" style={{ color: 'var(--label2)' }}>VCM merchandise</p> 
        </div>

        {/* Categories Filter */}
        <div className="flex justify-center mb-2">
          <div className="seg">
            {categories.slice(0, 5).map((cat: any) => {
              const on = filter === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`seg-item ${on ? "on" : ""}`}
                >
                  {formatCategory(cat, locale)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Grid */}
        <div className="min-h-[400px]">
          {filteredItems.length > 0 ? (
            <motion.div layout className="grid grid-cols-2 gap-3">
              <AnimatePresence mode="popLayout">
                {filteredItems.map((item: any) => (
                  <ProductCard key={item._id} item={item} locale={locale} />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="card p-6 text-center" style={{ background: "var(--bg2)" }}>
              <div className="icon-box mx-auto" style={{ background: "var(--blue-dim)", color: "var(--blue)" }}>
                <ShoppingBag size={20} />
              </div>
              <p className="t-headline mt-3">{T.notFound[locale as keyof typeof T.notFound] || T.notFound.en}</p>
              <p className="t-footnote mt-1">{T.notFoundSub[locale as keyof typeof T.notFoundSub] || T.notFoundSub.en}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}