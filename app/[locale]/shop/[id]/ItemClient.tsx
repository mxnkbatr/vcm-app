"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  ShoppingCart, Package, Smartphone, X,
  Loader2, Sparkles, Tag,
} from "lucide-react";
import { IOSAlert, IOSSheet } from "@/app/components/iOSAlert";
import DetailDock from "@/app/components/DetailDock";
import { useCart } from "@/app/context/CartContext";
import { hapticImpact } from "@/lib/haptics";
import { ImpactStyle } from "@capacitor/haptics";
import { formatShopCategory, formatShopPrice } from "@/app/components/ShopProductCard";
import NativeFeatureUnavailable from "@/app/components/NativeFeatureUnavailable";
import { isNativeApp } from "@/lib/native-perf";
import { BLUR_DATA_URL } from "@/lib/image-blur";

const T = {
  back: { en: "Back", mn: "Буцах", de: "Zurück" },
  details: { en: "About this product", mn: "Бүтээгдэхүүний тухай", de: "Produktdetails" },
  inStockPrefix: { en: "in stock — Ready to ship", mn: "Агуулахад", de: "auf Lager" },
  inStockSuffix: { en: "", mn: "ширхэг байна", de: "" },
  outOfStock: { en: "Out of stock", mn: "Дууссан", de: "Ausverkauft" },
  order: { en: "Order", mn: "Захиалах", de: "Bestellen" },
  addCart: { en: "Add to cart", mn: "Сагсанд", de: "In den Warenkorb" },
} as const;

const QPayCheckoutSheet = ({ amount, onConfirm, onCancel, isProcessing, qpayData }: any) => (
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
      <p className="t-title1 !text-3xl mb-6 flex items-center gap-1" style={{ color: "var(--module-shop)" }}>
        <span className="text-sm">₮</span>{Number(amount).toLocaleString()}
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
  const [nativeApp, setNativeApp] = useState(false);
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

  useEffect(() => {
    setMounted(true);
    setNativeApp(isNativeApp());
  }, []);

  const name = item.name?.[locale] || item.name?.en || "Unknown Item";
  const desc = item.description?.[locale] || item.description?.en || "";
  const inStock = item.stock > 0;
  const category = formatShopCategory(item.category || "general", locale);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("vcm:page-title", { detail: { title: name } }));
    return () => {
      window.dispatchEvent(new CustomEvent("vcm:page-title", { detail: { title: "" } }));
    };
  }, [name]);
  const stockText =
    item.stock > 0
      ? locale === "mn"
        ? `${T.inStockPrefix.mn} ${item.stock} ${T.inStockSuffix.mn}`
        : `${item.stock} ${T.inStockPrefix[locale as keyof typeof T.inStockPrefix] || T.inStockPrefix.en}`
      : T.outOfStock[locale as keyof typeof T.outOfStock] || T.outOfStock.en;
  const hasImage = Boolean(item.image);

  if (!mounted) return null;

  if (nativeApp) {
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
    <div className="app-detail app-detail--shop">
      <div className="app-detail__hero app-detail__hero--shop">
        {hasImage ? (
          <Image
            src={item.image}
            alt={name}
            fill
            className="app-detail__hero-img object-cover"
            priority
            sizes="100vw"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: "var(--fill2)" }} aria-hidden>
            <Package size={48} style={{ color: "var(--label3)" }} />
          </div>
        )}
        <div className="app-detail__hero-fade" aria-hidden />
      </div>

      <div className="app-detail__sheet">
        <div className="app-detail__handle" aria-hidden />

        <div className="app-detail__meta">
          <span className="app-detail__pill app-detail__pill--shop">
            <Sparkles size={11} /> {category}
          </span>
        </div>
        <h1 className="app-detail__title">{name}</h1>

        <div className="app-detail__price-row">
          <span className="app-detail__price">
            {formatShopPrice(appliedPromo ? payAmount : item.price)}
          </span>
          {appliedPromo ? (
            <span className="app-detail__price-old">{formatShopPrice(item.price)}</span>
          ) : null}
        </div>

        <div className="app-detail__meta" style={{ marginTop: 12 }}>
          <span className={`app-detail__pill ${inStock ? "app-detail__pill--ok" : "app-detail__pill--warn"}`}>
            {inStock ? "●" : "○"} {stockText}
          </span>
          <span className="app-detail__pill">
            <Tag size={11} strokeWidth={2.2} /> VCM Shop
          </span>
        </div>

        {desc ? (
          <div className="app-detail__card" style={{ marginTop: 18, padding: "16px 18px" }}>
            <p className="app-detail__section-label">
              {T.details[locale as keyof typeof T.details] || T.details.en}
            </p>
            <p className="app-article__p" style={{ marginTop: 8 }}>{desc}</p>
          </div>
        ) : null}

      </div>

      <DetailDock
        visible={!showCheckout && checkoutStep !== "qpay"}
        leading={
          <>
            <span className="detail-dock__price">
              {formatShopPrice(appliedPromo ? payAmount : item.price)}
            </span>
            {appliedPromo ? (
              <span className="detail-dock__price-sub">{appliedPromo.code}</span>
            ) : null}
          </>
        }
      >
        <button
          type="button"
          onClick={() => void handleAddToCart()}
          disabled={!inStock}
          className="detail-dock__btn detail-dock__btn--secondary press"
        >
          <Package size={17} strokeWidth={1.85} />
          <span>{addedToCart ? "✓" : T.addCart[locale as keyof typeof T.addCart] || T.addCart.en}</span>
        </button>
        <button
          type="button"
          onClick={() => void handleOrder()}
          disabled={!inStock}
          className="detail-dock__btn detail-dock__btn--primary press"
        >
          <ShoppingCart size={17} strokeWidth={1.85} />
          <span>{T.order[locale as keyof typeof T.order] || T.order.en}</span>
        </button>
      </DetailDock>

      {/* Checkout sheet */}
      <IOSSheet
        isOpen={showCheckout && checkoutStep === "phone"}
        onClose={() => setShowCheckout(false)}
        title="Захиалах"
      >
        <div className="px-5 pb-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="icon-box" style={{ background: "var(--module-shop-soft)", color: "var(--module-shop)" }}>
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
            <p className="t-caption font-bold">
              Промо код <span style={{ color: "var(--label3)", fontWeight: 500 }}>(заавал биш)</span>
            </p>
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
                    setPromoError("");
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
                  placeholder="Байвал оруулна уу"
                  value={promoInput}
                  onChange={(e) => {
                    setPromoInput(e.target.value.toUpperCase());
                    setPromoError("");
                  }}
                  autoComplete="off"
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={!promoInput.trim()}
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
                      if (!data.valid) throw new Error(data.error || "Промо код буруу байна");
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
            type="button"
            onClick={async () => {
              if (!phoneNumber || phoneNumber.length < 8) {
                setError("Утасны дугаараа зөв оруулна уу.");
                return;
              }
              setIsProcessing(true);
              setError("");
              setPromoError("");
              try {
                const body: Record<string, unknown> = {
                  itemId: item._id,
                  quantity: 1,
                  phoneNumber,
                };
                if (appliedPromo?.code) body.promoCode = appliedPromo.code;

                const res = await fetch("/api/purchases", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(body),
                });
                const data = await res.json();
                if (res.ok) {
                  setQpayResponse({
                    ...data.qpay,
                    invoice_id: data.purchase?.invoiceId || data.qpay?.invoice_id,
                  });
                  setActivePurchaseId(data.purchase._id);
                  setShowCheckout(false);
                  setCheckoutStep("qpay");
                } else {
                  setError(
                    data.error === "Unauthorized"
                      ? "Сесс дууссан байна. Хуудсыг шинэчлээд дахин оролдоно уу."
                      : data.error || "QPay нэхэмжлэх үүсгэхэд алдаа гарлаа."
                  );
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
        <QPayCheckoutSheet
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
              const invoiceId =
                qpayResponse?.invoice_id ||
                qpayResponse?.invoiceId ||
                qpayResponse?.id;
              const res = await fetch(`/api/purchases/check`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  purchaseId: activePurchaseId,
                  invoiceId,
                  phoneNumber,
                }),
              });
              if (res.ok) {
                setCheckoutStep("success");
              } else if (res.status === 402) {
                setError("Төлбөр хараахан ороогүй байна.");
              } else {
                const data = await res.json().catch(() => ({}));
                setError(data.error || "Төлбөр шалгахад алдаа гарлаа.");
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
