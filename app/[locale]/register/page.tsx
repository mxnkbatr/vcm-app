"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  UserPlus,
  LogIn,
  ArrowRight,
  CheckCircle2,
  ChevronLeft
} from "lucide-react";
import BeforeLoginNews from "@/app/components/BeforeLoginNews";

// --- OPTIONS ---
const OPTIONS = [
  {
    id: "new",
    title: "Би шинэ гишүүн",
    desc: "Анкет бөглөх, хөтөлбөрт бүртгүүлэх.",
    icon: UserPlus,
    badge: "Санал болгож буй",
  },
  {
    id: "existing",
    title: "Би гишүүн болсон",
    desc: "Профайл руу нэвтрэх, төлөв шалгах.",
    icon: LogIn,
    badge: null,
  }
];

export default function RegisterPage() {
  const [selected, setSelected] = useState<string>("new");

  return (
    <div className="page">
      <div className="page-inner space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="pt-2">
            <h1 className="t-large-title">
              Та хэрхэн <br />
              <span style={{ color: 'var(--blue)' }}>Нэгдэхийг</span> хүсч байна вэ?
            </h1>
            <p className="t-subhead mt-2" style={{ color: 'var(--label2)' }}>
              Бид таны бүртгэлийн үйл явцыг танд тохируулан бэлдэх болно.
            </p>
          </div>

          {/* Selection Cards */}
          <div className="space-y-4 mt-8">
            {OPTIONS.map((option) => {
              const isActive = selected === option.id;

              return (
                <div key={option.id} className="relative group">
                  {/* Badge */}
                  {option.badge && (
                    <div className="absolute -top-2 right-4 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full z-20">
                      {option.badge}
                    </div>
                  )}

                  {/* Card Area */}
                  <div
                    onClick={() => setSelected(option.id)}
                    className={`card press p-5 flex items-center gap-4 border-2 transition-all
                      ${isActive ? "border-[#0A84FF]" : "border-transparent"}
                    `}
                  >
                    {/* Icon Box */}
                    <div className="icon-box" style={{ background: isActive ? 'var(--blue)' : 'var(--fill2)', color: isActive ? 'white' : 'var(--label3)' }}>
                      <option.icon size={22} />
                    </div>

                    {/* Text Content */}
                    <div className="flex-1">
                      <h3 className="t-headline">{option.title}</h3>
                      <p className="t-footnote">{option.desc}</p>
                    </div>

                    {/* Radio Checkmark */}
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                      ${isActive ? "border-[#0A84FF] bg-[#0A84FF] text-white" : "border-slate-200 bg-transparent text-transparent"}
                    `}>
                      <CheckCircle2 size={14} strokeWidth={3} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA Button */}
          <div className="mt-8">
            <Link href={selected === "new" ? "/sign-up" : "/sign-in"}>
              <button className="btn btn-primary btn-full">
                {selected === "new" ? "Бүртгэл Үүсгэх" : "Нэвтрэх"}
              </button>
            </Link>
          </div>

          {/* Back Link */}
          <div className="mt-6 text-center">
            <Link href="/" className="inline-flex items-center gap-1 t-caption font-semibold press">
              <ChevronLeft size={14} /> Нүүр хуудас руу буцах
            </Link>
          </div>

        </motion.div>
      </div>
    </div>
  );
}