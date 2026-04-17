"use client";

import React, { useState } from "react";
import { useCart } from "@/app/context/CartContext";
import { Link } from "@/navigation";
import { Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import Image from "next/image";

export default function CartClient({ locale }: { locale: string }) {
  const { items, updateQuantity, removeFromCart, total } = useCart();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/qpay/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          description: "VCM Shop Order",
        }),
      });
      const data = await res.json();
      if (data.qPay_url) {
        window.location.href = data.qPay_url;
      } else {
        alert("Төлбөрийн нэхэмжлэл үүсгэхэд алдаа гарлаа.");
      }
    } catch (e) {
      console.error(e);
      alert("Алдаа гарлаа.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="page flex flex-col items-center justify-center min-h-[60vh]">
        <div className="icon-box mx-auto mb-4" style={{ background: "var(--fill2)", color: "var(--label3)" }}>
          <Trash2 size={24} />
        </div>
        <h2 className="t-headline">Сагс хоосон байна</h2>
        <Link href="/shop" className="mt-4 text-blue-500 font-semibold press">
          Дэлгүүр рүү буцах
        </Link>
      </div>
    );
  }

  return (
    <div className="page pb-48">
      <div className="page-inner space-y-4">
        <h1 className="t-large-title pt-4">Миний сагс</h1>
        
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item._id} className="card p-3 flex gap-4 items-center">
              <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                <Image src={item.image} alt="Product" fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[15px] truncate" style={{ color: "var(--label)" }}>
                  {item.name[locale as keyof typeof item.name] || item.name.en}
                </p>
                <p className="text-[13px] font-bold mt-1 text-blue-500">
                  ₮{item.price.toLocaleString()}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="p-1 bg-gray-100 rounded-full press">
                    <Minus size={14} />
                  </button>
                  <span className="text-[13px] font-semibold w-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="p-1 bg-gray-100 rounded-full press">
                    <Plus size={14} />
                  </button>
                  <button onClick={() => removeFromCart(item._id)} className="p-1 ml-auto text-red-500 press">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div 
          className="fixed left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-gray-200 z-50"
          style={{ bottom: "calc(56px + env(safe-area-inset-bottom, 0px))" }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[15px] font-semibold text-gray-500">Нийт дүн:</span>
            <span className="text-xl font-black text-blue-500">₮{total.toLocaleString()}</span>
          </div>
          <button 
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-blue-500 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 press disabled:opacity-50"
          >
            {loading ? "Уншиж байна..." : "Төлбөр төлөх (QPay)"} 
            {!loading && <ArrowRight size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
