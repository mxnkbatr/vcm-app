"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import Image from "next/image";
import { Clock, Sparkles, TrendingUp, ChevronRight, PlayCircle, BookOpen } from "lucide-react";
import { useLocale } from "next-intl";
import Skeleton from "@/app/components/Skeleton";
import PremiumPageShell from "@/app/components/PremiumPageShell";
import NativeFeatureUnavailable from "@/app/components/NativeFeatureUnavailable";
import { isNativeApp } from "@/lib/native-perf";
import IOSLargeTitle from "@/app/components/ui/IOSLargeTitle";
import IOSSegmented from "@/app/components/ui/IOSSegmented";
import EmptyState from "@/app/components/ui/EmptyState";
import IOS26Card from "@/app/components/ui/IOS26Card";

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
  const title =
    c.title?.[locale as keyof LmsI18n] || c.title?.en || c.title?.mn || "";
  const desc =
    c.description?.[locale as keyof LmsI18n] || c.description?.en || c.description?.mn || "";
  const isFree = isCourseFree(c);

  return (
    <IOS26Card href={`/lessons/${c.slug}`}>
      <div className="ios26-card__media ios26-card__media--sm">
        {!!c.thumbnailUrl && <Image src={c.thumbnailUrl} alt={title} fill className="object-cover" />}
        <div className="ios26-card__shade" />
        <span
          className="ios26-card__chip"
          style={{
            background: isFree ? "var(--emerald-dim)" : "var(--orange-dim)",
            color: isFree ? "var(--emerald)" : "var(--orange)",
          }}
        >
          {isFree ? <Sparkles size={10} strokeWidth={1.75} /> : <TrendingUp size={10} strokeWidth={1.75} />}
          {isFree ? (locale === "mn" ? "Үнэгүй" : "Free") : locale === "mn" ? "Төлбөртэй" : "Paid"}
        </span>
        <div className="ios26-card__play">
          <PlayCircle size={18} color="white" strokeWidth={1.75} />
        </div>
      </div>
      <div className="ios26-card__body">
        <h3 className="ios26-card__title">{title}</h3>
        <p className="ios26-card__desc">{desc}</p>
        <div className="ios26-card__meta">
          <span className="inline-flex items-center gap-1">
            <Clock size={12} strokeWidth={1.75} />
            {isFree ? (locale === "mn" ? "Шууд үзэх" : "Instant access") : locale === "mn" ? "Төлбөр шаардлагатай" : "Payment required"}
          </span>
          <span className="inline-flex items-center gap-1" style={{ color: "var(--blue)", fontWeight: 600 }}>
            {locale === "mn" ? "Нээх" : "Open"} <ChevronRight size={14} strokeWidth={1.75} />
          </span>
        </div>
      </div>
    </IOS26Card>
  );
}

export default function LessonsClient({ initialCourses }: { initialCourses?: Course[] }) {
  const locale = useLocale();
  const [courses, setCourses] = useState<Course[]>(initialCourses ?? []);
  const [loading, setLoading] = useState(!initialCourses?.length);
  const [filter, setFilter] = useState("all");
  const ready = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const nativeApp = ready && isNativeApp();

  useEffect(() => {
    if (!ready || nativeApp) {
      return;
    }
    if (initialCourses?.length) return;
    let cancelled = false;
    fetch("/api/lms/courses")
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && Array.isArray(d)) setCourses(d);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
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
    <PremiumPageShell className="ios26-page">
      <div className="home-sections">
        <IOSLargeTitle title={locale === "mn" ? "Сургалтууд" : "Courses"}>
          <p className="ios-subhead mt-1">
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
              actionLabel={locale === "mn" ? "Хөтөлбөр үзэх" : "Browse programs"}
              href="/programs"
            />
          )}
        </div>
      </div>
    </PremiumPageShell>
  );
}
