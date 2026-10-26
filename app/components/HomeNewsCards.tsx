"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Link } from "@/navigation";
import { useLocale } from "next-intl";
import { Newspaper } from "lucide-react";
import { clientCache } from "@/lib/client-cache";
import EmptyState from "./ui/EmptyState";

type NewsItem = {
  _id: string;
  title?: { mn?: string; en?: string } | string;
  summary?: { mn?: string; en?: string } | string;
  image?: string;
  publishedDate?: string;
  source?: string;
};

function pick(field: NewsItem["title"], locale: string) {
  if (!field) return "";
  if (typeof field === "string") return field;
  return field[locale as "mn" | "en"] || field.mn || field.en || "";
}

export default function HomeNewsCards({ limit = 6 }: { limit?: number }) {
  const locale = useLocale();
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const cached = clientCache.get<NewsItem[]>("/api/news");
      if (cached) {
        setItems(cached);
        setLoading(false);
        if (clientCache.age("/api/news") < 60_000) return;
      }
      try {
        const res = await fetch("/api/news");
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : [];
          clientCache.set("/api/news", list);
          if (!cancelled) setItems(list);
        }
      } catch {
        /* noop */
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="home-news-stack">
        {[1, 2, 3].map((i) => (
          <div key={i} className="home-news-card">
            <div className="ios-skel home-news-card__thumb" />
            <div className="flex-1 space-y-2">
              <div className="ios-skel h-4 w-4/5" />
              <div className="ios-skel h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const list = items.slice(0, limit);
  if (!list.length) {
    return (
      <EmptyState
        icon={Newspaper}
        title="Мэдээ байхгүй"
        description="Шинэ мэдээ нэмэгдсний дараа энд харагдана."
        actionLabel="Мэдээ"
        href="/news"
      />
    );
  }

  return (
    <div className="home-news-stack">
      {list.map((item) => {
        const title = pick(item.title, locale) || "Мэдээ";
        const summary = pick(item.summary, locale);
        return (
          <Link key={item._id} href={`/news/${item._id}`} prefetch className="home-news-card press glass-press">
            <div className="home-news-card__thumb">
              {item.image ? (
                <Image src={item.image} alt={title} fill className="object-cover" sizes="96px" />
              ) : (
                <span className="home-news-card__fallback">
                  <Newspaper size={22} strokeWidth={1.75} />
                </span>
              )}
            </div>
            <div className="home-news-card__body">
              {item.source === "volunteer.org.mn" ? (
                <span className="home-news-card__src">volunteer.org.mn</span>
              ) : null}
              <p className="home-news-card__title">{title}</p>
              {summary ? <p className="home-news-card__sub">{summary}</p> : null}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
