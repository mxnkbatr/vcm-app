"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, SlidersHorizontal } from "lucide-react";
import { staggerContainer, staggerItem } from "@/lib/motion";
import PremiumPageShell from "@/app/components/PremiumPageShell";
import ShopProductCard, { formatShopCategory, isVisibleShopItem } from "@/app/components/ShopProductCard";
import IOSSheet from "@/app/components/ui/IOSSheet";
import IOSLargeTitle from "@/app/components/ui/IOSLargeTitle";
import EmptyState from "@/app/components/ui/EmptyState";

const T = {
  shopTitle: { en: "Our Shop", mn: "Дэлгүүр", de: "Unser Shop" },
  notFound: { en: "No items available", mn: "Бүтээгдэхүүн байхгүй", de: "Keine Artikel gefunden" },
  notFoundSub: {
    en: "The shop catalog is currently empty.",
    mn: "Дэлгүүрийн каталог одоогоор хоосон байна.",
    de: "Der Shop-Katalog ist derzeit leer.",
  },
  catAll: { en: "All", mn: "Бүгд", de: "Alle" },
} as const;

export default function ShopClient({
  items = [],
  locale = "en",
  isHorizontal = false,
  embedded = false,
}: {
  // Shop catalog rows come from mixed API shapes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items?: any[];
  locale?: string;
  isHorizontal?: boolean;
  embedded?: boolean;
}) {
  const [filter, setFilter] = useState("all");
  const [sheet, setSheet] = useState(false);

  const catalog = useMemo(
    () => items.filter((item) => isVisibleShopItem(item, locale)),
    [items, locale]
  );
  const categories = useMemo(
    () => ["all", ...Array.from(new Set(catalog.map((item) => String(item.category || "")).filter(Boolean)))],
    [catalog]
  );
  const filteredItems = useMemo(
    () => catalog.filter((item) => filter === "all" || item.category === filter),
    [catalog, filter]
  );

  if (isHorizontal) {
    const row = catalog.slice(0, 4);
    if (!row.length) return null;
    return (
      <>
        {row.map((item, i) => (
          <ShopProductCard
            key={String(item._id)}
            item={item}
            locale={locale}
            index={i}
            variant="horizontal"
            animated={false}
          />
        ))}
      </>
    );
  }

  if (embedded) {
    if (catalog.length === 0) return null;
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {catalog.slice(0, 4).map((item, i) => (
          <ShopProductCard key={String(item._id)} item={item} locale={locale} index={i} animated={false} />
        ))}
      </div>
    );
  }

  return (
    <PremiumPageShell className="ios26-page">
      <motion.div
        className="home-sections pt-1"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={staggerItem}>
          <IOSLargeTitle title={T.shopTitle[locale as keyof typeof T.shopTitle] || T.shopTitle.en} />
        </motion.div>

        <motion.div variants={staggerItem} className="flex items-center justify-between">
          <span className="ios-footnote">
            {filteredItems.length} {locale === "mn" ? "бараа" : "items"}
          </span>
          {categories.length > 2 && (
            <button type="button" className="btn btn-ghost press inline-flex items-center gap-2" onClick={() => setSheet(true)}>
              <SlidersHorizontal size={16} strokeWidth={1.75} />
              {filter === "all"
                ? T.catAll[locale as keyof typeof T.catAll] || T.catAll.en
                : formatShopCategory(filter, locale)}
            </button>
          )}
        </motion.div>

        <IOSSheet open={sheet} title={locale === "mn" ? "Ангилал" : "Category"} onClose={() => setSheet(false)} detent="half">
          <div className="ios-list">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className="ios-list-row press"
                style={{ color: filter === cat ? "var(--blue)" : undefined, fontWeight: filter === cat ? 600 : 400 }}
                onClick={() => {
                  setFilter(cat);
                  setSheet(false);
                }}
              >
                {cat === "all"
                  ? T.catAll[locale as keyof typeof T.catAll] || T.catAll.en
                  : formatShopCategory(cat, locale)}
              </button>
            ))}
          </div>
        </IOSSheet>

        <div className="min-h-[400px]">
          {filteredItems.length > 0 ? (
            <motion.div layout className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <AnimatePresence mode="popLayout">
                {filteredItems.map((item, i) => (
                  <ShopProductCard key={String(item._id)} item={item} locale={locale} index={i} />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <EmptyState
              icon={ShoppingBag}
              title={T.notFound[locale as keyof typeof T.notFound] || T.notFound.en}
              description={T.notFoundSub[locale as keyof typeof T.notFoundSub] || T.notFoundSub.en}
              actionLabel={locale === "mn" ? "Нүүр лүү" : "Home"}
              href="/"
            />
          )}
        </div>
      </motion.div>
    </PremiumPageShell>
  );
}
