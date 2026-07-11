"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Link } from "@/navigation";
import { ShoppingBag } from "lucide-react";
import { staggerItem } from "@/lib/motion";

const T = {
  inStock: { en: "In stock", mn: "Байгаа", de: "Auf Lager" },
  outOfStock: { en: "Sold out", mn: "Дууссан", de: "Ausverkauft" },
  catGeneral: { en: "General", mn: "Ерөнхий", de: "Allgemein" },
} as const;

export function formatShopCategory(cat: string, locale: string) {
  if (!cat || cat.toLowerCase() === "general") {
    return T.catGeneral[locale as keyof typeof T.catGeneral] || T.catGeneral.en;
  }
  return cat.charAt(0).toUpperCase() + cat.slice(1);
}

export function formatShopPrice(price: number | string) {
  return `₮${Number(price).toLocaleString()}`;
}

type ShopProductCardProps = {
  item: any;
  locale?: string;
  index?: number;
  variant?: "grid" | "horizontal";
  animated?: boolean;
};

export default function ShopProductCard({
  item,
  locale = "en",
  index = 0,
  variant = "grid",
  animated = true,
}: ShopProductCardProps) {
  const name = item.name?.[locale] || item.name?.en || "Unknown Item";
  const desc = item.description?.[locale] || item.description?.en || "";
  const inStock = item.stock > 0;
  const stockLabel = inStock
    ? T.inStock[locale as keyof typeof T.inStock] || T.inStock.en
    : T.outOfStock[locale as keyof typeof T.outOfStock] || T.outOfStock.en;

  const card = (
    <Link
      href={`/shop/${item._id}`}
      className={`press block shop-product-card shop-product-card--${variant} ${!inStock ? "shop-product-card--sold-out" : ""}`}
    >
      <div className="shop-product-card__media">
        {item.image ? (
          <Image
            src={item.image}
            alt={name}
            fill
            className="object-cover shop-product-card__img"
            sizes={variant === "horizontal" ? "164px" : "(max-width: 520px) 50vw, 260px"}
          />
        ) : (
          <div className="shop-product-card__placeholder">
            <ShoppingBag size={28} strokeWidth={1.8} />
          </div>
        )}
        <div className="shop-product-card__shine" aria-hidden />
        <span className="shop-product-card__cat">
          {formatShopCategory(item.category || "general", locale)}
        </span>
        {!inStock && (
          <div className="shop-product-card__sold-overlay">
            <span>{stockLabel}</span>
          </div>
        )}
      </div>

      <div className="shop-product-card__body">
        <p className="shop-product-card__name">{name}</p>
        {desc && variant === "grid" && (
          <p className="shop-product-card__desc">{desc}</p>
        )}
        <div className="shop-product-card__footer">
          <span className="shop-product-card__price">{formatShopPrice(item.price)}</span>
          <span className={`shop-product-card__stock ${inStock ? "shop-product-card__stock--in" : ""}`}>
            {inStock ? "●" : "○"} {stockLabel}
          </span>
        </div>
      </div>
    </Link>
  );

  if (!animated) return card;

  return (
    <motion.div
      layout
      variants={staggerItem}
      initial="initial"
      animate="animate"
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.04 }}
      whileTap={{ scale: 0.98 }}
    >
      {card}
    </motion.div>
  );
}
