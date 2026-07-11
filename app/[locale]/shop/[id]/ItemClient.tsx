"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft, ShoppingCart, Package, Smartphone, X,
  Loader2, Sparkles,
} from "lucide-react";
import { IOSAlert, IOSSheet } from "@/app/components/iOSAlert";
import NativeDock from "@/app/components/NativeDock";
import { useCart } from "@/app/context/CartContext";
import { hapticImpact } from "@/lib/haptics";
import { ImpactStyle } from "@capacitor/haptics";
import { staggerContainer, staggerItem, springNative } from "@/lib/motion";

const T = {
  back: { en: "Back to Shop", mn: "Буцах", de: "Zurück zum Shop" },
  details: { en: "Product Details", mn: "Бүтээгдэхүүний тухай", de: "Produktdetails" },
  inStockPrefix: { en: "in stock — Ready to ship", mn: "Агуулахад", de: "auf Lager — Versandfertig" },
  inStockSuffix: { en: "", mn: "ширхэг байна", de: "" },
  outOfStock: { en: "Out of stock", mn: "Дууссан", de: "Ausverkauft" },
  order: { en: "Order", mn: "Захиалах", de: "Bestellen" },
  addCart: { en: "Add to cart", mn: "Сагсанд", de: "In den Warenkorb" },
  catGeneral: { en: "General", mn: "Ерөнхий", de: "Allgemein" },
} as const;

const formatCategory = (cat: string, locale: string) => {
  if (!cat || cat.toLowerCase() === "general") {
    return T.catGeneral[locale as keyof typeof T.catGeneral] || T.catGeneral.en;
  }
  return cat.charAt(0).toUpperCase() + cat.slice(1);
};

const QPayMockup = ({ amount, onConfirm, onCancel, isProcessing, qpayData }: any) => (
  <IOSSheet isOpen={true} onClose={onCancel} title="QPay Төлбөр">
    <div className="p-8 flex flex-col items-center">
      {qpayData?.qr_image ? (
        <div className="w-48 h-48 bg-white rounded-xl flex items-center justify-center mb-6 p-2 shadow-sm border border-slate-100">
          <img src={`data:image/png;base64,${qpayData.qr_image}`} alt="QPay QR" className="w-full h-full object-contain" />
        </div>
      ) : (
        <div className="w-48 h-48 bg-slate-100 rounded-xl flex items-center justify-center mb-6 border-2 border-dashed border-slate-300">
          <Loader2 size={40} className="text-slate-400 animate-spin" />
        </div>
      )}
      <p className="t-footnote font-medium mb-1" style={{ color: "var(--label2)" }}>Нийт дүн</p>
      <p className="t-title1 !text-3xl mb-6 flex items-center gap-1" style={{ color: "var(--blue)" }}>
        <span className="text-sm">₮</span>{amount}
      </p>
      {qpayData?.qPay_shortUrl && (
        <a href={qpayData.qPay_shortUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-full mb-3">
          QPay Апп-аар төлөх
        </a>
      )}
      <button onClick={onConfirm} disabled={isProcessing} className="btn btn-primary btn-full">
        {isProcessing ? <div className="ios-spinner !w-5 !h-5" /> : "Төлбөр шалгах"}
      </button>
      <div className="pb-8" />
    </div>
  </IOSSheet>
);

export default function ItemClient({ item, locale = "en" }: { item: any; locale: string }) {
  const [mounted, setMounted] = useState(false);

  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"phone" | "qpay" | "success">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [qpayResponse, setQpayResponse] = useState<any>(null);
  const [activePurchaseId, setActivePurchaseId] = useState<string | null>(null);
  const [promoInput, setPromoInput] = useState("");
  const [promoError, setPromoError] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    finalAmount: number;
    discountAmount: number;
  } | null>(null);
  const [payAmount, setPayAmount] = useState(item.price);

  const { addToCart } = useCart();
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => setMounted(true), []);

  const name = item.name?.[locale] || item.name?.en || "Unknown Item";
  const desc = item.description?.[locale] || item.description?.en || "";
  const inStock = item.stock > 0;
  const stockText =
    item.stock > 0
      ? locale === "mn"
        ? `${T.inStockPrefix.mn} ${item.stock} ${T.inStockSuffix.mn}`
        : `${item.stock} ${T.inStockPrefix[locale as keyof typeof T.inStockPrefix] || T.inStockPrefix.en}`
      : T.outOfStock[locale as keyof typeof T.outOfStock] || T.outOfStock.en;

  if (!mounted) return null;

  const handleAddToCart = async () => {
    await hapticImpact(ImpactStyle.Light);
    addToCart({
      _id: item._id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleOrder = async () => {
    await hapticImpact(ImpactStyle.Medium);
    setShowCheckout(true);
    setCheckoutStep("phone");
  };

  return (
    <div className="page page--immersive">
      {/* Hero */}
      <motion.div
        className="native-hero"
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <Image
          src={item.image || "/placeholder.jpg"}
          alt={name}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="native-hero__gradient" />
        <div className="native-hero__shine" aria-hidden />

        <Link
          href={`/${locale}/shop`}
          className="native-back press"
          onClick={() => hapticImpact(ImpactStyle.Light)}
        >
          <ArrowLeft size={16} strokeWidth={2.5} />
          {T.back[locale as keyof typeof T.back] || T.back.en}
        </Link>

        <motion.div
          className="native-hero__badge"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, ...springNative }}
        >
          <Sparkles size={12} />
          {formatCategory(item.category || "general", locale)}
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div
        className="native-sheet"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={staggerItem} className="native-sheet__handle" aria-hidden />

        <motion.div variants={staggerItem} className="space-y-2">
          <h1 className="t-title1">{name}</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-[22px] font-black tracking-tight"
              style={{ color: "var(--blue)" }}
            >
              ₮{Number(item.price).toLocaleString()}
            </span>
            {appliedPromo && (
              <span className="text-[13px] font-semibold line-through" style={{ color: "var(--label3)" }}>
                ₮{Number(item.price).toLocaleString()}
              </span>
            )}
          </div>
          <p
            className="text-[12px] font-bold uppercase tracking-wider"
            style={{ color: inStock ? "var(--emerald)" : "var(--red)" }}
          >
            {inStock ? "● " : "○ "}{stockText}
          </p>
        </motion.div>

        <motion.div variants={staggerItem} className="divider my-5" />

        <motion.div variants={staggerItem} className="space-y-3">
          <h3 className="t-headline flex items-center gap-2" style={{ color: "var(--label)" }}>
            <span className="native-accent-bar" />
            {T.details[locale as keyof typeof T.details] || T.details.en}
          </h3>
          <p className="t-body leading-relaxed" style={{ color: "var(--label2)" }}>
            {desc}
          </p>
        </motion.div>

        <div className="h-28" />
      </motion.div>

      {/* Floating dock */}
      <NativeDock
        visible={!showCheckout && checkoutStep !== "qpay"}
        price={appliedPromo ? payAmount : item.price}
        priceLabel={appliedPromo ? `${appliedPromo.code} хөнгөлөлт` : undefined}
      >
        <button
          onClick={handleAddToCart}
          disabled={!inStock}
          className="native-dock__btn native-dock__btn--secondary press"
          style={{ opacity: inStock ? 1 : 0.45 }}
        >
          <Package size={18} />
          <span>{addedToCart ? "✓" : T.addCart[locale as keyof typeof T.addCart] || T.addCart.en}</span>
        </button>
        <button
          onClick={handleOrder}
          disabled={!inStock}
          className="native-dock__btn native-dock__btn--primary press"
          style={{ opacity: inStock ? 1 : 0.45 }}
        >
          <ShoppingCart size={18} />
          <span>{T.order[locale as keyof typeof T.order] || T.order.en}</span>
        </button>
      </NativeDock>

      {/* Checkout sheet */}
      <IOSSheet
        isOpen={showCheckout && checkoutStep === "phone"}
        onClose={() => setShowCheckout(false)}
        title="Захиалах"
      >
        <div className="px-5 pb-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="icon-box" style={{ background: "var(--blue-dim)", color: "var(--blue)" }}>
              <Smartphone size={20} />
            </div>
            <div>
              <h3 className="t-headline">Утасны дугаар</h3>
              <p className="t-caption">Хүргэлтийн мэдээлэл илгээнэ</p>
            </div>
          </div>

          <input
            type="tel"
            placeholder="Жишээ: 99112233"
            value={phoneNumber}
            onChange={(e) => { setPhoneNumber(e.target.value); setError(""); }}
            className="input"
          />

          <div className="space-y-2">
            <p className="t-caption font-bold">Промо код</p>
            {appliedPromo ? (
              <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: "var(--emerald-dim)" }}>
                <span className="font-bold" style={{ color: "var(--emerald)" }}>
                  {appliedPromo.code} (-₮{appliedPromo.discountAmount.toLocaleString()})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAppliedPromo(null);
                    setPayAmount(item.price);
                    setPromoInput("");
                  }}
                  className="press"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  className="input flex-1"
                  placeholder="PROMO"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={async () => {
                    if (!promoInput.trim()) return;
                    setPromoError("");
                    try {
                      const res = await fetch("/api/promo/validate", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          code: promoInput.trim(),
                          context: "shop",
                          items: [{ id: item._id, price: item.price, quantity: 1 }],
                        }),
                      });
                      const data = await res.json();
                      if (!data.valid) throw new Error(data.error);
                      setAppliedPromo({
                        code: data.code,
                        finalAmount: data.finalAmount,
                        discountAmount: data.discountAmount,
                      });
                      setPayAmount(data.finalAmount);
                    } catch (e: unknown) {
                      setPromoError(e instanceof Error ? e.message : "Алдаа");
                    }
                  }}
                >
                  Хэрэглэх
                </button>
              </div>
            )}
            {promoError && <p className="t-footnote" style={{ color: "var(--red)" }}>{promoError}</p>}
            <p className="t-caption" style={{ color: "var(--label2)" }}>
              Төлөх дүн: ₮{payAmount.toLocaleString()}
            </p>
          </div>

          {error && <p className="t-footnote" style={{ color: "var(--red)" }}>{error}</p>}

          <button
            onClick={async () => {
              if (!phoneNumber || phoneNumber.length < 8) {
                setError("Утасны дугаараа зөв оруулна уу.");
                return;
              }
              setIsProcessing(true);
              setError("");
              try {
                const res = await fetch("/api/purchases", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    itemId: item._id,
                    phoneNumber,
                    amount: payAmount,
                    promoCode: appliedPromo?.code,
                  }),
                });
                const data = await res.json();
                if (res.ok) {
                  setQpayResponse(data.qpay);
                  setActivePurchaseId(data.purchase._id);
                  setShowCheckout(false);
                  setCheckoutStep("qpay");
                } else {
                  setError(data.error || "QPay нэхэмжлэх үүсгэхэд алдаа гарлаа.");
                }
              } catch {
                setError("Сервертэй холбогдоход алдаа гарлаа.");
              } finally {
                setIsProcessing(false);
              }
            }}
            disabled={isProcessing}
            className="btn btn-primary btn-full"
          >
            {isProcessing ? <div className="ios-spinner !w-5 !h-5" /> : "Үргэлжлүүлэх →"}
          </button>
        </div>
      </IOSSheet>

      {checkoutStep === "qpay" && (
        <QPayMockup
          amount={payAmount}
          qpayData={qpayResponse}
          isProcessing={isProcessing}
          onCancel={() => {
            setCheckoutStep("phone");
            setShowCheckout(true);
            setQpayResponse(null);
          }}
          onConfirm={async () => {
            setIsProcessing(true);
            try {
              const res = await fetch(`/api/purchases/${activePurchaseId}/check`, { method: "POST" });
              if (res.ok) {
                setCheckoutStep("success");
              } else {
                setError("Төлбөр хараахан ороогүй байна.");
              }
            } catch {
              setError("Шалгахад алдаа гарлаа.");
            } finally {
              setIsProcessing(false);
            }
          }}
        />
      )}

      <IOSAlert
        isOpen={checkoutStep === "success"}
        onClose={() => (window.location.href = `/${locale}/dashboard`)}
        title="Баяр хүргэе!"
        message="Таны захиалга амжилттай баталгаажлаа. Бид удахгүй хүргэлтийн талаар холбогдох болно."
        type="success"
        confirmText="Миний хуудас руу"
      />

      <IOSAlert
        isOpen={!!error && checkoutStep !== "phone"}
        onClose={() => setError("")}
        title="Алдаа"
        message={error}
        type="error"
      />
    </div>
  );
}
