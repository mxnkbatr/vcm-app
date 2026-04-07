"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { ArrowLeft, ShoppingCart, Check, AlertCircle, Package, Smartphone, X, QrCode, CheckCircle2, Loader2 } from "lucide-react";

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
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl w-full max-w-sm border border-slate-200 dark:border-white/10"
    >
      <div className="bg-[#003B71] p-6 flex justify-between items-center text-white">
        <div className="flex items-center gap-2">
          <QrCode size={24} />
          <h3 className="font-bold text-lg">QPay</h3>
        </div>
        <button onClick={onCancel} className="text-white/80 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>
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
        <p className="text-slate-500 dark:text-slate-400 font-medium mb-1">Total Amount</p>
        <p className="text-3xl font-black text-[#003B71] dark:text-sky-400 mb-6 flex items-center gap-1">
          <span className="text-sm">₮</span>{amount}
        </p>

        {qpayData?.qPay_shortUrl && (
          <a
            href={qpayData.qPay_shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 mb-3 text-center rounded-xl font-bold bg-slate-100 dark:bg-slate-800 text-[#003B71] dark:text-white hover:bg-slate-200 transition-colors"
          >
            Pay with QPay App
          </a>
        )}

        <button
          onClick={onConfirm}
          disabled={isProcessing}
          className="w-full py-4 rounded-xl font-bold text-white bg-[#003B71] hover:bg-[#002f5a] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {isProcessing ? <Loader2 size={18} className="animate-spin" /> : null}
          {isProcessing ? "Checking..." : "Check Payment Status"}
        </button>
      </div>
    </motion.div>
  </div>
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

          {/* Order Button or Checkout Flow */}
          {!showCheckout ? (
            <button
              onClick={() => setShowCheckout(true)}
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
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-2xl border ${isDark ? 'border-white/10 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}
            >
              {checkoutStep === "phone" && (
                <div className="flex flex-col gap-4">
                  <h3 className={`font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    <Smartphone size={18} className="text-sky-500" />
                    Enter Phone Number
                  </h3>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    We need your phone number as your primary identifier for QPay.
                  </p>
                  <input
                    type="tel"
                    placeholder="e.g. 99112233"
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      setError("");
                    }}
                    className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-sky-500/50 transition-all ${
                      isDark ? 'bg-slate-900 border-white/10 text-white placeholder:text-slate-600' : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400'
                    }`}
                  />
                  {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowCheckout(false)}
                      className="flex-1 py-3 rounded-xl font-bold border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        if (!phoneNumber || phoneNumber.length < 8) {
                          setError("Please enter a valid phone number.");
                          return;
                        }
                        // Need to call POST /api/purchases to create invoice
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
                            setError(data.error || "Failed to create QPay invoice.");
                          }
                        } catch (err) {
                          setError("An error occurred connecting to the server.");
                        } finally {
                          setIsProcessing(false);
                        }
                      }}
                      disabled={isProcessing}
                      className="flex-1 py-3 rounded-xl font-bold bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white shadow-md transition-colors"
                    >
                      {isProcessing ? "Please wait..." : "Proceed"}
                    </button>
                  </div>
                </div>
              )}

              {checkoutStep === "success" && (
                <div className="flex flex-col items-center text-center gap-4 py-4">
                  <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    Purchase Successful!
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Your payment was received. We will contact you at {phoneNumber}.
                  </p>
                  <button
                    onClick={() => {
                      setShowCheckout(false);
                      setCheckoutStep("phone");
                      setPhoneNumber("");
                    }}
                    className="mt-2 w-full py-3 rounded-xl font-bold border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {checkoutStep === "qpay" && (
            <QPayMockup
              amount={item.price}
              qpayData={qpayResponse}
              isProcessing={isProcessing}
              onCancel={() => setCheckoutStep("phone")}
              onConfirm={async () => {
                if (!activePurchaseId || !qpayResponse?.invoice_id) return;
                setIsProcessing(true);
                try {
                  const res = await fetch("/api/purchases/check", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      purchaseId: activePurchaseId,
                      invoiceId: qpayResponse.invoice_id
                    }),
                  });
                  const data = await res.json();
                  if (res.ok && data.status === "paid") {
                    setCheckoutStep("success");
                  } else {
                    alert("Payment not confirmed yet. Please ensure you have paid via the QPay app.");
                  }
                } catch (error) {
                  alert("An error occurred while checking the payment status.");
                } finally {
                  setIsProcessing(false);
                }
              }}
            />
          )}
        </motion.div>

      </div>
    </div>
  );
}
