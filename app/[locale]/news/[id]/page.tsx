"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Calendar, Eye, ArrowLeft, Tag, User } from "lucide-react";
import { motion } from "framer-motion";
import { useLocale } from "next-intl";
import { Link } from "@/navigation";

export default function NewsDetailPage() {
  const locale = useLocale() as "en" | "mn" | "de";
  const params = useParams();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [news, setNews] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => setMounted(true), []);
  const id = params.id as string;

  useEffect(() => {
    if (!id) return;
    fetch(`/api/news/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setNews(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  /* ── Loading ── */
  if (!mounted || loading) return (
    <div className="min-h-dvh flex items-center justify-center" style={{ background: "var(--bg)" }}>
      <div className="ios-spinner" />
    </div>
  );

  /* ── Not found ── */
  if (!news) return (
    <div className="min-h-dvh flex flex-col items-center justify-center gap-4 px-6" style={{ background: "var(--bg)" }}>
      <div className="text-5xl">📰</div>
      <h1 className="text-[20px] font-bold text-center" style={{ color: "var(--label)" }}>
        Мэдээ олдсонгүй
      </h1>
      <Link href="/news" className="px-6 py-3 rounded-2xl text-white font-semibold text-[14px]"
        style={{ background: "var(--blue)" }}>
        Буцах
      </Link>
    </div>
  );

  const t = (field: { en: string; mn: string; de: string }) =>
    field?.[locale] || field?.mn || field?.en;

  const d = new Date(news.publishedDate);
  const dateFormatted = d.toLocaleDateString(
    locale === "mn" ? "mn-MN" : locale === "de" ? "de-DE" : "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  return (
    <div className="min-h-dvh relative" style={{ background: "var(--bg)", paddingBottom: 160 }}>
      {/* ── Top Nav ── */}
      <div
        className="absolute top-0 left-0 right-0 px-4 flex justify-between items-center z-20"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 12px) + 12px)" }}
      >
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md press"
          style={{ background: "rgba(255,255,255,0.8)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
        >
          <ArrowLeft size={20} style={{ color: "var(--label)" }} />
        </button>
      </div>

      {/* ── Hero Image ── */}
      <div className="relative w-full h-[350px] bg-slate-200">
        <Image
          src={news.image || "/logo.jpg"}
          alt={t(news.title)}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        {news.featured && (
          <div className="absolute bottom-4 left-4">
            <span className="badge text-[10px] uppercase tracking-widest" style={{ background: "var(--blue)", color: "white" }}>
              Онцлох
            </span>
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 -mt-6 bg-white rounded-t-[32px] px-5 py-8" style={{ minHeight: "60vh", background: "var(--bg)" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <div className="flex items-center gap-4 text-[12px] font-medium mb-4" style={{ color: "var(--label3)" }}>
            <span className="flex items-center gap-1"><Calendar size={14} /> {dateFormatted}</span>
            <span className="flex items-center gap-1"><User size={14} /> {news.author}</span>
            <span className="flex items-center gap-1"><Eye size={14} /> {news.views}</span>
          </div>

          <h1 className="text-[24px] font-black leading-tight mb-4" style={{ color: "var(--label)" }}>
            {t(news.title)}
          </h1>

          <p className="text-[15px] font-medium leading-relaxed mb-6" style={{ color: "var(--label2)" }}>
            {t(news.summary)}
          </p>

          <div 
            className="prose prose-sm max-w-none text-[15px] leading-relaxed" 
            style={{ color: "var(--label)" }}
            dangerouslySetInnerHTML={{ __html: t(news.content) }}
          />

          {news.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t" style={{ borderColor: "var(--sep)" }}>
              {news.tags.map((tag: string) => (
                <span key={tag} className="flex items-center gap-1 px-3 py-1 rounded-xl text-[11px] font-bold" style={{ background: "var(--fill2)", color: "var(--label2)" }}>
                  <Tag size={10} /> {tag}
                </span>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}