"use client"; 
import React, { useState, useEffect } from "react"; 
import Image from "next/image"; 
import { Link } from "@/navigation"; 
import { motion } from "framer-motion"; 
import { Clock, Sparkles, TrendingUp, ChevronRight, PlayCircle } from "lucide-react"; 
import { useLocale } from "next-intl"; 
import Skeleton from "@/app/components/Skeleton";

type LmsI18n = { en: string; mn: string; de?: string };
type Course = {
  _id: string;
  slug: string;
  title: LmsI18n;
  description: LmsI18n;
  thumbnailUrl?: string;
  price?: number;
  currency?: string;
  isFree?: boolean;
  tags?: string[];
};

const LEVELS: Array<{ id: string; label: { en: string; mn: string; de: string } }> = [
  { id: "all", label: { en: "All", mn: "Бүгд", de: "Alle" } },
  { id: "free", label: { en: "Free", mn: "Үнэгүй", de: "Kostenlos" } },
  { id: "paid", label: { en: "Paid", mn: "Төлбөртэй", de: "Bezahlt" } },
];

function CourseCard({ c, locale }: { c: Course; locale: string }) {
  const title = (c.title as any)?.[locale] || c.title?.en || "";
  const desc = (c.description as any)?.[locale] || c.description?.en || "";
  const isFree = !!c.isFree || (c.price ?? 0) === 0;

  return ( 
    <motion.div 
      className="card overflow-hidden press"
      initial={{ opacity: 0, y: 12 }} 
      animate={{ opacity: 1, y: 0 }} 
      whileTap={{ scale: 0.97 }} 
      transition={{ type: 'spring', stiffness: 400, damping: 35 }} 
    > 
      <div className="relative h-36 overflow-hidden bg-slate-100">
        {!!c.thumbnailUrl && (
          <Image src={c.thumbnailUrl} alt={title} fill className="object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" /> 
        <div className="absolute top-3 left-3"> 
          <span
            className="badge text-[11px]"
            style={{
              background: isFree ? "var(--emerald-dim)" : "var(--orange-dim)",
              color: isFree ? "var(--emerald)" : "var(--orange)",
            }}
          >
            {isFree ? <Sparkles size={10} /> : <TrendingUp size={10} />}{" "}
            {isFree ? (locale === "mn" ? "Үнэгүй" : "Free") : (locale === "mn" ? "Төлбөртэй" : "Paid")}
          </span> 
        </div> 
        <div className="absolute bottom-3 right-3">
          <div className="icon-box-sm" style={{ background: "rgba(0,0,0,0.45)" }}>
            <PlayCircle size={16} color="white" />
          </div>
        </div>
      </div> 
      <div className="p-4 space-y-2"> 
        <h3 className="t-headline line-clamp-1">{title}</h3> 
        <p className="t-footnote line-clamp-2 leading-relaxed">{desc}</p> 
        <div className="flex items-center justify-between pt-1"> 
          <div className="flex items-center gap-3"> 
            <span className="t-caption flex items-center gap-1"> 
              <Clock size={11} style={{ color: 'var(--label3)' }} />
              {isFree ? (locale === "mn" ? "Шууд үзэх" : "Instant access") : (locale === "mn" ? "Төлбөр шаардлагатай" : "Payment required")}
            </span> 
          </div> 
          <Link
            href={`/lessons/${c.slug}`}
            className="flex items-center gap-1 font-semibold text-[13px]"
            style={{ color: "var(--blue)" }}
          >
            {locale === "mn" ? "Нээх" : "Open"} <ChevronRight size={14} />
          </Link>
        </div> 
      </div> 
    </motion.div> 
  ); 
} 

export default function LessonsClient() { 
  const locale = useLocale(); 
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true); 
  const [filter, setFilter] = useState<"all" | "free" | "paid">("all");

  useEffect(() => { 
    fetch('/api/lms/courses')
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setCourses(d); })
      .catch(console.error)
      .finally(() => setLoading(false)); 
  }, []); 

  const filtered =
    filter === "all"
      ? courses
      : filter === "free"
        ? courses.filter((c) => !!c.isFree || (c.price ?? 0) === 0)
        : courses.filter((c) => !c.isFree && (c.price ?? 0) > 0);

  if (loading) return ( 
    <div className="page">
      <div className="page-inner space-y-4">
        <div className="pt-2 pb-1 space-y-2">
          <Skeleton className="h-10 w-44" />
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="overflow-x-auto no-scroll -mx-4 px-4">
          <Skeleton className="h-10 w-72" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card overflow-hidden">
              <Skeleton className="h-36 w-full !rounded-none" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ); 

  return ( 
    <div className="page"> 
      <div className="page-inner space-y-4"> 
        <div className="pt-2 pb-1"> 
          <h1 className="t-large-title">{locale === "mn" ? "Сургалтууд" : "Courses"}</h1>
          <p className="t-subhead mt-1" style={{ color: 'var(--label2)' }}>
            {courses.length} {locale === "mn" ? "курс байна" : "courses"}
          </p> 
        </div> 

        <div className="overflow-x-auto no-scroll -mx-4 px-4"> 
          <div className="seg inline-flex"> 
            {LEVELS.map((c) => (
              <button
                key={c.id}
                onClick={() => setFilter(c.id as any)}
                className={`seg-item ${filter === c.id ? "on" : ""}`}
              >
                {(c.label as any)[locale] || c.label.en}
              </button>
            ))}
          </div> 
        </div> 

        <div className="space-y-4 stagger"> 
          {filtered.map((c) => (
            <CourseCard key={c._id} c={c} locale={locale} />
          ))}
          {filtered.length === 0 && ( 
            <div className="card p-10 text-center"> 
              <div className="text-4xl mb-3">📚</div> 
              <p className="t-headline mb-1">{locale === "mn" ? "Сургалт байхгүй" : "No courses yet"}</p> 
              <p className="t-footnote">{locale === "mn" ? "Удахгүй шинэ сургалт нэмэгдэнэ" : "New courses coming soon"}</p> 
            </div> 
          )} 
        </div> 
      </div> 
    </div> 
  ); 
}