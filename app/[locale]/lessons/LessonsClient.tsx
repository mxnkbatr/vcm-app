"use client";

import React, { useState, useEffect, useMemo, useSyncExternalStore } from "react";
import { Link } from "@/navigation";
import { BookOpen, Search, Star } from "lucide-react";
import { useLocale } from "next-intl";
import Skeleton from "@/app/components/Skeleton";
import PremiumPageShell from "@/app/components/PremiumPageShell";
import EmptyState from "@/app/components/ui/EmptyState";
import SharedHero from "@/app/components/SharedHero";
import { isNativeApp } from "@/lib/native-perf";
import { hapticSelection } from "@/lib/haptics";

type LmsI18n = { en: string; mn: string; de?: string };
type Course = {
  _id: string;
  slug: string;
  title: LmsI18n;
  description: LmsI18n;
  thumbnailUrl?: string;
  price?: number;
  isFree?: boolean;
  tags?: string[];
  lessonCount?: number;
};

const SORTS = [
  { id: "popular", mn: "Эрэлттэй", en: "Popular" },
  { id: "rating", mn: "Үнэлгээ", en: "Rating" },
  { id: "price-asc", mn: "Үнэ ↑", en: "Price ↑" },
  { id: "price-desc", mn: "Үнэ ↓", en: "Price ↓" },
] as const;

const TAG_LABEL: Record<string, { mn: string; en: string }> = {
  volunteer: { mn: "Сайн дурын", en: "Volunteer" },
  leadership: { mn: "Манлайлал", en: "Leadership" },
  speaking: { mn: "Илтгэл", en: "Speaking" },
  demo: { mn: "Демо", en: "Demo" },
  finance: { mn: "Санхүү", en: "Finance" },
};

const COVER_ACCENTS = ["#0F766E", "#1E5BD8", "#0369A1", "#7C3AED", "#C2410C"];

function isCourseFree(c: Course) {
  return !!c.isFree || (c.price ?? 0) === 0;
}

function pickText(field: LmsI18n | undefined, locale: string) {
  if (!field) return "";
  return field[locale as keyof LmsI18n] || field.mn || field.en || "";
}

function formatPrice(price: number | undefined, locale: string, isFree: boolean) {
  if (isFree) return locale === "mn" ? "Үнэгүй" : "Free";
  return `${Number(price || 0).toLocaleString()}₮`;
}

function coverAccent(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i) * (i + 1)) % COVER_ACCENTS.length;
  return COVER_ACCENTS[hash] || COVER_ACCENTS[0];
}

function ratingFor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i) * 17) % 40;
  return (4.6 + hash / 100).toFixed(1);
}

function tagLabel(tag: string | undefined, locale: string) {
  if (!tag) return locale === "mn" ? "Сургалт" : "Course";
  const mapped = TAG_LABEL[tag.toLowerCase()];
  if (mapped) return locale === "mn" ? mapped.mn : mapped.en;
  return tag;
}

function CourseCard({ c, locale, hot }: { c: Course; locale: string; hot?: boolean }) {
  const mn = locale === "mn";
  const title = pickText(c.title, locale);
  const free = isCourseFree(c);
  const accent = coverAccent(c._id || c.slug);
  const tag = tagLabel(c.tags?.find((t) => t !== "demo") || c.tags?.[0], locale);
  const lessons = c.lessonCount ?? 0;
  const rating = ratingFor(c._id || c.slug);

  return (
    <Link href={`/lessons/${c.slug}`} prefetch className="dc-course-card press">
      <div className="dc-course-card__thumb" style={{ background: `linear-gradient(145deg, ${accent}, #0f172a)` }}>
        {c.thumbnailUrl ? (
          <SharedHero
            kind="lesson"
            id={c.slug}
            src={c.thumbnailUrl}
            alt={title}
            sizes="112px"
            radius={14}
          />
        ) : (
          <span className="dc-course-card__thumb-label">{title.slice(0, 12)}</span>
        )}
      </div>

      <div className="dc-course-card__body">
        <div className="dc-course-card__badges">
          <span className="dc-course-card__badge dc-course-card__badge--accent">{tag}</span>
          {hot ? (
            <span className="dc-course-card__badge">
              {mn ? "Хамгийн эрэлттэй" : "Trending"}
            </span>
          ) : null}
        </div>

        <h3 className="dc-course-card__title">{title}</h3>

        <p className="dc-course-card__meta">
          {lessons > 0
            ? mn
              ? `${lessons} хичээл`
              : `${lessons} lessons`
            : mn
              ? "Онлайн сургалт"
              : "Online course"}
          <span aria-hidden> · </span>
          <Star size={11} strokeWidth={2.2} className="dc-course-card__star" fill="currentColor" />
          {rating}
        </p>

        <div className="dc-course-card__price-row">
          <span className={`dc-course-card__price ${free ? "is-free" : ""}`}>
            {formatPrice(c.price, locale, free)}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function LessonsClient({ initialCourses }: { initialCourses?: Course[] }) {
  const locale = useLocale();
  const mn = locale === "mn";
  const [courses, setCourses] = useState<Course[]>(initialCourses ?? []);
  const [loading, setLoading] = useState(!initialCourses?.length);
  const [sort, setSort] = useState<(typeof SORTS)[number]["id"]>("popular");
  const [query, setQuery] = useState("");
  const ready = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const nativeApp = ready && isNativeApp();

  useEffect(() => {
    if (!ready) return;
    if (initialCourses?.length) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    fetch("/api/lms/courses")
      .then((r) => r.json())
      .then((d) => {
        // Native shell: free courses only (App Store 3.1.1 — no paid digital content).
        if (!cancelled && Array.isArray(d)) setCourses(nativeApp ? d.filter(isCourseFree) : d);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [initialCourses, nativeApp, ready]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = courses.filter((c) => {
      if (!q) return true;
      const title = pickText(c.title, locale).toLowerCase();
      const desc = pickText(c.description, locale).toLowerCase();
      const tags = (c.tags ?? []).join(" ").toLowerCase();
      return title.includes(q) || desc.includes(q) || tags.includes(q);
    });

    if (sort === "price-asc") {
      list = [...list].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    } else if (sort === "price-desc") {
      list = [...list].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    } else if (sort === "rating") {
      list = [...list].sort(
        (a, b) => Number(ratingFor(b._id || b.slug)) - Number(ratingFor(a._id || a.slug))
      );
    }
    return list;
  }, [courses, locale, query, sort]);

  if (!ready) {
    return (
      <PremiumPageShell>
        <Skeleton className="h-10 w-44" />
      </PremiumPageShell>
    );
  }

  if (loading) {
    return (
      <PremiumPageShell className="dc-lms-page">
        <div className="dc-lms">
          <Skeleton className="h-10 w-full rounded-full" />
          <Skeleton className="h-9 w-3/4 rounded-full" />
          <Skeleton className="h-28 rounded-[24px]" />
          <Skeleton className="h-28 rounded-[24px]" />
        </div>
      </PremiumPageShell>
    );
  }

  return (
    <PremiumPageShell className="dc-lms-page" bottomPad>
      <div className="dc-lms">
        <label className="dc-lms__search dc-lms__search--solo">
          <Search size={16} strokeWidth={2.2} className="dc-lms__search-icon" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={mn ? "Сургалт, багш хайх..." : "Search courses..."}
            enterKeyHint="search"
          />
        </label>

        <div className="dc-lms__chips" role="tablist" aria-label={mn ? "Эрэмбэ" : "Sort"}>
          {SORTS.filter((f) => !nativeApp || !f.id.startsWith("price")).map((f) => {
            const on = sort === f.id;
            return (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={on}
                className={`dc-lms__chip ${on ? "is-on" : ""}`}
                onClick={() => {
                  void hapticSelection();
                  setSort(f.id);
                }}
              >
                {mn ? f.mn : f.en}
              </button>
            );
          })}
        </div>

        <div className="dc-lms__results-head">
          <h2>{mn ? "Үр дүн" : "Results"}</h2>
          <span>
            {filtered.length} {mn ? "сургалт" : filtered.length === 1 ? "course" : "courses"}
          </span>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title={mn ? "Сургалт олдсонгүй" : "No courses found"}
            description={
              mn
                ? "Хайлт эсвэл шүүлтээ өөрчилж үзээрэй."
                : "Try a different search or sort."
            }
            actionLabel={mn ? "Хөтөлбөр үзэх" : "Browse programs"}
            href="/programs"
          />
        ) : (
          <div className="dc-lms__list">
            {filtered.map((c, i) => (
              <CourseCard key={c._id} c={c} locale={locale} hot={sort === "popular" && i < 2} />
            ))}
          </div>
        )}
      </div>
    </PremiumPageShell>
  );
}
