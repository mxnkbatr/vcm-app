"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Link } from "@/navigation";
import { motion } from "framer-motion";
import { Clock, Sparkles, TrendingUp, ChevronRight, PlayCircle, BookOpen } from "lucide-react";
import { useLocale } from "next-intl";
import Skeleton from "@/app/components/Skeleton";
import PremiumPageShell from "@/app/components/PremiumPageShell";
import NativeFeatureUnavailable from "@/app/components/NativeFeatureUnavailable";
import { isNativeApp } from "@/lib/native-perf";
import IOSLargeTitle from "@/app/components/ui/IOSLargeTitle";
import IOSSegmented from "@/app/components/ui/IOSSegmented";
import EmptyState from "@/app/components/ui/EmptyState";
import { springNative } from "@/lib/motion";

type LmsI18n = { en: string; mn: string; de?: string };
type Course = {
  _id: string;
  slug: string;
  title: LmsI18n;
  description: LmsI18n;
  thumbnailUrl?: string;
  price?: number;
  isFree?: boolean;
};

const LEVELS = [
  { id: "all", label: "Бүгд" },
  { id: "free", label: "Үнэгүй" },
  { id: "paid", label: "Төлбөртэй" },
];

function isCourseFree(c: Course) {
  return !!c.isFree || (c.price ?? 0) === 0;
}

function CourseCard({ c, locale }: { c: Course; locale: string }) {
  const title = (c.title as any)?.[locale] || c.title?.en || "";
  const desc = (c.description as any)?.[locale] || c.description?.en || "";
  const isFree = isCourseFree(c);

  return (
    <motion.div whileTap={{ scale: 0.97 }} transition={springNative}>
      <Link href={`/lessons/${c.slug}`} className="press block overflow-hidden rounded-[20px] bg-[var(--card)] border-[0.5px] border-[var(--sep)]">
        <div className="relative h-36 bg-[var(--fill2)]">
          {!!c.thumbnailUrl && <Image src={c.thumbnailUrl} alt={title} fill className="object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute top-3 left-3">
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold"
              style={{
                background: isFree ? "var(--emerald-dim)" : "var(--orange-dim)",
                color: isFree ? "var(--emerald)" : "var(--orange)",
              }}
            >
              {isFree ? <Sparkles size={10} strokeWidth={1.75} /> : <TrendingUp size={10} strokeWidth={1.75} />}
              {isFree ? (locale === "mn" ? "Үнэгүй" : "Free") : locale === "mn" ? "Төлбөртэй" : "Paid"}
            </span>
          </div>
          <div className="absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.45)" }}>
            <PlayCircle size={18} color="white" strokeWidth={1.75} />
          </div>
        </div>
        <div className="p-4 space-y-1">
          <h3 className="ios-headline line-clamp-1">{title}</h3>
          <p className="ios-footnote line-clamp-2">{desc}</p>
          <div className="flex items-center justify-between pt-2">
            <span className="ios-caption inline-flex items-center gap-1">
              <Clock size={12} strokeWidth={1.75} />
              {isFree ? (locale === "mn" ? "Шууд үзэх" : "Instant access") : locale === "mn" ? "Төлбөр шаардлагатай" : "Payment required"}
            </span>
            <span className="inline-flex items-center gap-1 ios-footnote" style={{ color: "var(--blue)", fontWeight: 600 }}>
              {locale === "mn" ? "Нээх" : "Open"} <ChevronRight size={14} strokeWidth={1.75} />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function LessonsClient({ initialCourses }: { initialCourses?: Course[] }) {
  const locale = useLocale();
  const [courses, setCourses] = useState<Course[]>(initialCourses ?? []);
  const [loading, setLoading] = useState(!initialCourses?.length);
  const [filter, setFilter] = useState("all");
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
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setCourses(d);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [initialCourses, nativeApp, ready]);

  if (!ready) {
    return (
      <PremiumPageShell>
        <Skeleton className="h-10 w-44" />
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

  const filtered =
    filter === "all"
      ? courses
      : filter === "free"
        ? courses.filter(isCourseFree)
        : courses.filter((c) => !isCourseFree(c));

  if (loading) {
    return (
      <PremiumPageShell>
        <div className="space-y-4">
          <Skeleton className="h-10 w-44" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="ios-skel h-56 rounded-[20px]" />
          ))}
        </div>
      </PremiumPageShell>
    );
  }

  return (
    <PremiumPageShell>
      <div className="space-y-4">
        <IOSLargeTitle title={locale === "mn" ? "Сургалтууд" : "Courses"}>
          <p className="ios-footnote mt-1">
            {courses.length} {locale === "mn" ? "курс байна" : "courses"}
          </p>
        </IOSLargeTitle>
        <IOSSegmented options={LEVELS} value={filter} onChange={setFilter} />
        <div className="space-y-3">
          {filtered.map((c) => (
            <CourseCard key={c._id} c={c} locale={locale} />
          ))}
          {filtered.length === 0 && (
            <EmptyState
              icon={BookOpen}
              title={locale === "mn" ? "Сургалт байхгүй" : "No courses yet"}
              description={
                locale === "mn"
                  ? "Одоогоор үзэх боломжтой сургалт алга."
                  : "There are no courses available right now."
              }
            />
          )}
        </div>
      </div>
    </PremiumPageShell>
  );
}
