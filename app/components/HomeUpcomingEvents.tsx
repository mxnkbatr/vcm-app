"use client";

import { useEffect, useState } from "react";
import SharedHero from "@/app/components/SharedHero";
import { Link } from "@/navigation";
import { useLocale } from "next-intl";
import { Calendar } from "lucide-react";
import { clientCache } from "@/lib/client-cache";
import { pickI18n } from "./EventCompactRow";
import EmptyState from "./ui/EmptyState";

type EventItem = {
  _id: string;
  title?: Record<string, string> | string;
  date?: string | Date;
  startDate?: string | Date;
  eventDate?: string | Date;
  timeString?: string;
  image?: string;
  location?: Record<string, string> | string;
};

function resolveDate(item: EventItem): Date | null {
  const raw = item.date ?? item.startDate ?? item.eventDate;
  if (!raw) return null;
  if (raw instanceof Date) {
    return Number.isNaN(raw.getTime()) ? null : raw;
  }
  const s = String(raw).trim();
  if (!s) return null;
  if (s.includes("T") || s.includes("Z") || /^\d{4}-\d{2}-\d{2}/.test(s)) {
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(s.replace(/-/g, "/"));
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatEventBadge(item: EventItem, lang: string) {
  const d = resolveDate(item);
  if (!d) return { day: "—", month: "" };
  const locale = lang === "mn" ? "mn-MN" : "en-US";
  return {
    day: String(d.getDate()),
    month: d.toLocaleDateString(locale, { month: "short" }),
  };
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function HomeUpcomingEvents({ limit = 8, query = "" }: { limit?: number; query?: string }) {
  const lang = useLocale();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const cached = clientCache.get<EventItem[]>("/api/events");
      if (cached) {
        setEvents(cached);
        setLoading(false);
        if (clientCache.age("/api/events") < 60_000) return;
      }
      try {
        const res = await fetch("/api/events");
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : [];
          clientCache.set("/api/events", list);
          setEvents(list);
        }
      } catch {
        /* noop */
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  if (loading) {
    return (
      <div className="ios-carousel ios-carousel--wide">
        {[1, 2, 3].map((i) => (
          <div key={i} className="ios-event-card ios-event-card--wow">
            <div className="ios-skel" style={{ aspectRatio: "16/10", borderRadius: 24 }} />
          </div>
        ))}
      </div>
    );
  }

  const q = query.trim().toLowerCase();
  const today = startOfToday().getTime();
  const upcoming = events
    .filter((item) => !q || pickI18n(item.title, lang).toLowerCase().includes(q))
    .sort((a, b) => {
      const da = resolveDate(a)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const db = resolveDate(b)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const ra = da >= today ? da : da + 1e15;
      const rb = db >= today ? db : db + 1e15;
      return ra - rb;
    })
    .slice(0, limit);

  if (upcoming.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title="Одоогоор эвент байхгүй"
        description="Шинэ арга хэмжээ нэмэгдэхэд энд харагдана."
        actionLabel="Бүх эвент"
        href="/events"
      />
    );
  }

  return (
    <div className="ios-carousel ios-carousel--wide">
      {upcoming.map((item) => {
        const title = pickI18n(item.title, lang) || "Арга хэмжээ";
        const loc = pickI18n(item.location, lang);
        const { day, month } = formatEventBadge(item, lang);
        return (
          <Link key={item._id} href={`/events/${item._id}`} prefetch className="ios-event-card ios-event-card--wow press">
            <div className="ios-event-card__media">
              {item.image ? (
                <SharedHero
                  kind="event"
                  id={item._id}
                  src={item.image}
                  alt={title}
                  imgClassName="object-cover object-center"
                  sizes="(max-width:520px) 80vw, 360px"
                  radius={20}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ color: "var(--blue)", background: "var(--blue-light)" }}>
                  <Calendar size={28} strokeWidth={1.75} />
                </div>
              )}
              <div className="ios-event-card__badge glass-surface">
                <strong>{day}</strong>
                <span>{month}</span>
              </div>
              <div className="ios-event-card__glass glass-surface">
                <p className="ios-event-card__title">{title}</p>
                {item.timeString || loc ? (
                  <p className="ios-event-card__meta">
                    {[item.timeString, loc].filter(Boolean).join(" · ")}
                  </p>
                ) : null}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
