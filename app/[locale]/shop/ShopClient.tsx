"use client";

import React, { useMemo, useState, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, SlidersHorizontal } from "lucide-react";
import { staggerContainer, staggerItem } from "@/lib/motion";
import PremiumPageShell from "@/app/components/PremiumPageShell";
import ShopProductCard, { formatShopCategory, isVisibleShopItem } from "@/app/components/ShopProductCard";
import NativeFeatureUnavailable from "@/app/components/NativeFeatureUnavailable";
import { isNativeApp } from "@/lib/native-perf";
import IOSSheet from "@/app/components/ui/IOSSheet";
import IOSLargeTitle from "@/app/components/ui/IOSLargeTitle";
import { Link } from "@/navigation";

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
  const ready = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const nativeApp = ready && isNativeApp();

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

  if (nativeApp && !isHorizontal) {
    return (
      <NativeFeatureUnavailable
        locale={locale}
        titleMn="Дэлгүүр апп дээр байхгүй"
        titleEn="Shop is not available in the app"
        subMn="Мерч худалдан авалт одоогоор зөвхөн веб дээр."
        subEn="Merchandise purchases are not offered in this iOS build."
      />
    );
  }

  if (isHorizontal) {
    if (nativeApp) return null;
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
    if (nativeApp || catalog.length === 0) return null;
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
            <div className="shop-coming glass-surface">
              <div className="shop-coming__art" aria-hidden>
                <ShoppingBag size={40} strokeWidth={1.5} />
              </div>
              <h3 className="shop-coming__title">
                {locale === "mn" ? "Тун удахгүй" : "Coming soon"}
              </h3>
              <p className="shop-coming__sub">
                {locale === "mn"
                  ? "Дэлгүүрийн бараа бэлтгэгдэж байна. Шинэчлэлтийг мэдэгдлээр хүлээн аваарай."
                  : "Merchandise is on the way. Get notified when it drops."}
              </p>
              <Link href="/notifications" prefetch className="btn btn-primary glass-press inline-flex items-center justify-center">
                {locale === "mn" ? "Мэдэгдэл авах" : "Notify me"}
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </PremiumPageShell>
  );
}
