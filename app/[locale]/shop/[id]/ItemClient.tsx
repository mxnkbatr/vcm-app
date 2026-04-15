"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { ArrowLeft, ShoppingCart, Check, AlertCircle, Package, Smartphone, X, QrCode, CheckCircle2, Loader2 } from "lucide-react";
import { IOSAlert, IOSSheet } from "@/components/iOSAlert";

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
        <p className="t-footnote font-medium mb-1" style={{ color: 'var(--label2)' }}>Нийт дүн</p>
        <p className="t-title1 !text-3xl mb-6 flex items-center gap-1" style={{ color: '#003B71' }}>
          <span className="text-sm">₮</span>{amount}
        </p>

        {qpayData?.qPay_shortUrl && (
          <a
            href={qpayData.qPay_shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-full mb-3"
          >
            QPay Апп-аар төлөх
          </a>
        )}

        <button
          onClick={onConfirm}
          disabled={isProcessing}
          className="btn btn-primary btn-full"
          style={{ background: '#003B71' }}
        >
          {isProcessing ? <div className="ios-spinner !w-5 !h-5" /> : "Төлбөр шалгах"}
        </button>
        <div className="pb-8" />
      </div>
  </IOSSheet>
);

export default function ItemClient({ item, locale = 'en' }: { item: any; locale: string }) {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  // Checkout state
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"phone" | "qpay" | "success">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [qpayResponse, setQpayResponse] = useState<any>(null);
  const [activePurchaseId, setActivePurchaseId] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);
  const isDark = mounted && theme === "dark";

  const name = item.name?.[locale] || item.name?.en || "Unknown Item";
  const desc = item.description?.[locale] || item.description?.en || "";

  if (!mounted) return null;

  return (
    <div className="page">
      <div className="page-inner space-y-6">
        {/* Back button */}
        <Link 
          href={`/${locale}/shop`}
          className="inline-flex items-center gap-1 t-caption font-semibold press"
          style={{ color: 'var(--blue)' }}
        >
          <ArrowLeft size={14} />
          {T.back[locale as keyof typeof T.back] || T.back.en}
        </Link>

        <div className="space-y-6">
          
          {/* Top: Image Card */}
          <motion.div 
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="card overflow-hidden relative aspect-square"
          >
            <Image
              src={item.image || "/placeholder.jpg"}
              alt={name}
              fill
              className="object-cover"
              priority
            />
            {/* Category badge floating */}
            <div className="absolute top-4 left-4">
              <span className="badge" style={{ background: 'var(--blue-dim)', color: 'var(--blue)' }}>
                {formatCategory(item.category || "general", locale)}
              </span>
            </div>
          </motion.div>

          {/* Bottom: Info Card */}
          <motion.div 
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6 space-y-5"
          >
            <div>
              <h1 className="t-title1 mb-1">{name}</h1>
              <div className="flex items-center gap-3">
                <span className="t-title2" style={{ color: 'var(--blue)' }}>
                  ₮{item.price}
                </span>
                <span className="t-caption font-bold uppercase tracking-wider">
                  {item.stock > 0 
                    ? (locale === "mn" 
                        ? `${T.inStockPrefix.mn} ${item.stock} ${T.inStockSuffix.mn}` 
                        : `${item.stock} ${T.inStockPrefix[locale as keyof typeof T.inStockPrefix] || T.inStockPrefix.en}`)
                    : (T.outOfStock[locale as keyof typeof T.outOfStock] || T.outOfStock.en)
                  }
                </span>
              </div>
            </div>

            <div className="divider" />

            {/* Description */}
            <div className="space-y-2">
              <h3 className="t-headline" style={{ color: 'var(--label2)' }}>
                {T.details[locale as keyof typeof T.details] || T.details.en}
              </h3>
              <p className="t-body" style={{ color: 'var(--label2)' }}>
                {desc}
              </p>
            </div>

            {/* Order Button or Checkout Flow */}
            {!showCheckout ? (
              <button
                onClick={() => setShowCheckout(true)}
                disabled={item.stock <= 0}
                className="btn btn-primary btn-full"
                style={{ opacity: item.stock <= 0 ? 0.5 : 1 }}
              >
                <ShoppingCart size={18} className="mr-2" />
                {T.order[locale as keyof typeof T.order] || T.order.en}
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4 pt-2"
              >
                {checkoutStep === "phone" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="icon-box" style={{ background: 'var(--blue-dim)', color: 'var(--blue)' }}>
                        <Smartphone size={20} />
                      </div>
                      <h3 className="t-headline">Утасны дугаар</h3>
                    </div>
                    
                    <input
                      type="tel"
                      placeholder="Жишээ: 99112233"
                      value={phoneNumber}
                      onChange={(e) => {
                        setPhoneNumber(e.target.value);
                        setError("");
                      }}
                      className="input"
                    />
                    
                    {error && <p className="t-footnote" style={{ color: 'var(--red)' }}>{error}</p>}
                    
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setShowCheckout(false)}
                        className="btn btn-secondary btn-sm"
                      >
                        Болих
                      </button>
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
                                amount: item.price
                              }),
                            });
                            const data = await res.json();
                            if (res.ok) {
                              setQpayResponse(data.qpay);
                              setActivePurchaseId(data.purchase._id);
                              setCheckoutStep("qpay");
                            } else {
                              setError(data.error || "QPay нэхэмжлэх үүсгэхэд алдаа гарлаа.");
                            }
                          } catch (err) {
                            setError("Сервертэй холбогдоход алдаа гарлаа.");
                          } finally {
                            setIsProcessing(false);
                          }
                        }}
                        disabled={isProcessing}
                        className="btn btn-primary btn-sm"
                      >
                        {isProcessing ? <div className="ios-spinner !w-4 !h-4" /> : "Үргэлжлүүлэх"}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* QPay Sheet */}
      {checkoutStep === "qpay" && (
        <QPayMockup
          amount={item.price}
          qpayData={qpayResponse}
          isProcessing={isProcessing}
          onCancel={() => {
            setCheckoutStep("phone");
            setQpayResponse(null);
          }}
          onConfirm={async () => {
            setIsProcessing(true);
            try {
              const res = await fetch(`/api/purchases/${activePurchaseId}/check`, { method: 'POST' });
              if (res.ok) {
                setCheckoutStep("success");
              } else {
                setError("Төлбөр хараахан ороогүй байна.");
              }
            } catch (err) {
              setError("Шалгахад алдаа гарлаа.");
            } finally {
              setIsProcessing(false);
            }
          }}
        />
      )}

      {/* Success Alert */}
      <IOSAlert 
        isOpen={checkoutStep === "success"} 
        onClose={() => (window.location.href = `/${locale}/dashboard`)}
        title="Баяр хүргэе!"
        message="Таны захиалга амжилттай баталгаажлаа. Бид удахгүй хүргэлтийн талаар холбогдох болно."
        type="success"
        confirmText="Миний хуудас руу"
      />

      {/* Error Alert */}
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
