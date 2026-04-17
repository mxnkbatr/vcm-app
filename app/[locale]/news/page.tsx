"use client";

import { useState } from "react";
import { useCachedFetch } from "@/lib/client-cache";
import { motion } from "framer-motion";
import { Link } from "@/navigation";
import { useLocale } from "next-intl";
import { Calendar, Eye, Tag, ChevronRight, Newspaper } from "lucide-react";
import Image from "next/image";

type NewsItem = {
  _id: string;
  title: { en: string; mn: string; de: string };
  summary: { en: string; mn: string; de: string };
  image: string;
  author: string;
  publishedDate: string;
  tags: string[];
  featured: boolean;
  views: number;
};

export default function NewsPage() {
  const locale = useLocale() as "en" | "mn" | "de";
  const { data, loading } = useCachedFetch<NewsItem[]>("/api/news", { staleMsMs: 90_000 });
  const news = data ?? [];

  const t = (field: { en: string; mn: string; de: string }) =>
    field[locale] || field.mn || field.en;

  return (
    <div className="page">
      <div className="page-inner space-y-6">

        {/* Header */}
        <div className="pt-2">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--label3)" }}>
            Volunteer Center Mongolia
          </p>
          <h1 className="t-large-title">Мэдээ</h1>
          <p className="t-subhead mt-1" style={{ color: "var(--label2)" }}>
            Сүүлийн үеийн мэдээ, мэдээлэл
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="card overflow-hidden animate-pulse">
                <div className="h-44 bg-slate-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 w-3/4 bg-slate-200 rounded-lg" />
                  <div className="h-3 w-full bg-slate-200 rounded-lg" />
                  <div className="h-3 w-1/2 bg-slate-200 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : news.length === 0 ? (
          <div className="card p-12 text-center space-y-3">
            <Newspaper size={40} className="mx-auto" style={{ color: "var(--label4)" }} />
            <p className="t-headline" style={{ color: "var(--label2)" }}>Мэдээ байхгүй байна</p>
          </div>
        ) : (
          <div className="space-y-4 stagger">
            {news.map((item, idx) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.07 }}
              >
                <div className="card overflow-hidden press">
                  {/* Image */}
                  {item.image && (
                    <div className="relative h-44 w-full overflow-hidden">
                      <Image
                        src={item.image}
                        alt={t(item.title)}
                        fill
                        className="object-cover"
                        sizes="(max-width: 520px) 100vw, 520px"
                      />
                      {item.featured && (
                        <div className="absolute top-3 left-3">
                          <span className="badge text-[10px] uppercase tracking-widest" style={{ background: "var(--blue)", color: "white" }}>
                            Онцлох
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-4 space-y-2">
                    {/* Meta */}
                    <div className="flex items-center gap-3 text-[11px]" style={{ color: "var(--label3)" }}>
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        {new Date(item.publishedDate).toLocaleDateString(locale === "mn" ? "mn-MN" : "en-US", { year: "numeric", month: "short", day: "numeric" })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye size={11} />
                        {item.views}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="t-headline line-clamp-2">{t(item.title)}</h2>

                    {/* Summary */}
                    <p className="t-footnote line-clamp-3" style={{ color: "var(--label2)" }}>
                      {t(item.summary)}
                    </p>

                    {/* Tags */}
                    {item.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {item.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold" style={{ background: "var(--fill2)", color: "var(--label2)" }}>
                            <Tag size={9} />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Author & Read more */}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[11px] font-medium" style={{ color: "var(--label3)" }}>
                        {item.author}
                      </span>
                      <span className="flex items-center gap-0.5 text-[12px] font-bold" style={{ color: "var(--blue)" }}>
                        Дэлгэрэнгүй <ChevronRight size={13} />
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
