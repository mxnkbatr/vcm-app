"use client"; 
import React, { useState, useEffect } from "react"; 
import Image from "next/image"; 
import { Link } from "@/navigation"; 
import { motion } from "framer-motion"; 
import { Clock, Sparkles, TrendingUp, ChevronRight, PlayCircle } from "lucide-react"; 
import { useLocale } from "next-intl"; 
import Skeleton from "@/app/components/Skeleton";
import PremiumPageShell from "@/app/components/PremiumPageShell";
import PremiumSectionHeader from "@/app/components/PremiumSectionHeader";
import NativeFeatureUnavailable from "@/app/components/NativeFeatureUnavailable";
import { isNativeApp } from "@/lib/native-perf";

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

function isCourseFree(c: Course) {
  return !!c.isFree || (c.price ?? 0) === 0;
}

function CourseCard({ c, locale }: { c: Course; locale: string }) {
  const title = (c.title as any)?.[locale] || c.title?.en || "";
  const desc = (c.description as any)?.[locale] || c.description?.en || "";
  const isFree = isCourseFree(c);

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

export default function LessonsClient({ initialCourses }: { initialCourses?: Course[] }) {
  const locale = useLocale();
  const [courses, setCourses] = useState<Course[]>(initialCourses ?? []);
  const [loading, setLoading] = useState(!initialCourses?.length);
  const [filter, setFilter] = useState<"all" | "free" | "paid">("all");
  const [nativeApp, setNativeApp] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const native = isNativeApp();
    setNativeApp(native);
    setReady(true);
    if (native) setLoading(false);
  }, []);

  useEffect(() => {
    if (!ready || nativeApp) return;
    if (initialCourses?.length) {
      setLoading(false);
      return;
    }
    fetch("/api/lms/courses")
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setCourses(d); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [initialCourses, nativeApp, ready]);

  // App Store 3.1.1: digital courses are not offered or consumed in the iOS app.
  if (!ready) {
    return (
      <PremiumPageShell>
        <div className="space-y-4 pt-2">
          <Skeleton className="h-10 w-44" />
          <Skeleton className="h-5 w-40" />
        </div>
      </PremiumPageShell>
    );
  }

  if (nativeApp) {
    return (
      <NativeFeatureUnavailable
        locale={locale}
        titleMn="Сургалт апп дээр байхгүй"
        titleEn="Courses are not available in the app"
        subMn="Онлайн сургалт зөвхөн веб хувилбар дээр."
        subEn="Online courses are only available on the website, not in this iOS app."
      />
    );
  }

  const visibleCourses = courses;
  const filterTabs = LEVELS;

  const filtered =
    filter === "all"
      ? visibleCourses
      : filter === "free"
        ? visibleCourses.filter(isCourseFree)
        : visibleCourses.filter((c) => !isCourseFree(c));

  if (loading) return (
    <PremiumPageShell>
      <div className="space-y-4 pt-2">
        <Skeleton className="h-10 w-44" />
        <Skeleton className="h-5 w-40" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card overflow-hidden">
              <Skeleton className="h-36 w-full !rounded-none" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </PremiumPageShell>
  );

  return (
    <PremiumPageShell>
      <div className="space-y-4 pt-2">
        <PremiumSectionHeader
          title={locale === "mn" ? "Сургалтууд" : "Courses"}
          subtitle={`${visibleCourses.length} ${locale === "mn" ? "курс байна" : "courses"}`}
        />

        <div className="overflow-x-auto no-scroll -mx-4 px-4"> 
          <div className="seg inline-flex"> 
            {filterTabs.map((c) => (
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
            <div className="premium-empty-state"> 
              <div className="premium-empty-state__icon">📚</div>
              <p className="premium-empty-state__title">{locale === "mn" ? "Сургалт байхгүй" : "No courses yet"}</p> 
              <p className="premium-empty-state__sub">
                {locale === "mn"
                  ? "Одоогоор үзэх боломжтой сургалт алга."
                  : "There are no courses available right now."}
              </p> 
            </div> 
          )} 
        </div> 
      </div>
    </PremiumPageShell>
  ); 
}