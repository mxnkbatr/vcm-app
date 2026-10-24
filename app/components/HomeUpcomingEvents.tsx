"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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
};

function resolveDate(item: EventItem): Date | null {
  const raw = item.date ?? item.startDate ?? item.eventDate;
  if (!raw) return null;
  if (raw instanceof Date) {
    return Number.isNaN(raw.getTime()) ? null : raw;
  }
  const s = String(raw).trim();
  if (!s) return null;
  // Prefer ISO; also accept "YYYY-MM-DD" / "YYYY/MM/DD"
  const normalized = s.includes("T") || s.includes("Z") ? s : s.replace(/-/g, "/");
  const d = new Date(normalized);
  return Number.isNaN(d.getTime()) ? null : d;
}

function parts(item: EventItem, lang?: string) {
  const d = resolveDate(item);
  if (!d) return { day: "—", month: "" };
  return {
    day: d.getDate().toString().padStart(2, "0"),
    month: d.toLocaleDateString(lang === "mn" ? "mn-MN" : "en-US", { month: "short" }),
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
      <div className="ios-carousel">
        {[1, 2, 3].map((i) => (
          <div key={i} className="ios-event-card">
            <div className="ios-skel" style={{ aspectRatio: "16/10", borderRadius: 24 }} />
            <div className="ios-skel h-4 mt-2 w-3/4" />
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
      // Prefer upcoming, then soonest overall
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
    <div className="ios-carousel">
      {upcoming.map((item) => {
        const title = pickI18n(item.title, lang) || "Арга хэмжээ";
        const { day, month } = parts(item, lang);
        return (
          <Link key={item._id} href={`/events/${item._id}`} className="ios-event-card press">
            <div className="ios-event-card__media">
              {item.image ? (
                <Image src={item.image} alt="" fill className="object-cover" sizes="240px" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ color: "var(--blue)" }}>
                  <Calendar size={28} strokeWidth={1.75} />
                </div>
              )}
              <div className="ios-event-card__badge">
                <strong>{day}</strong>
                <span>{month}</span>
              </div>
            </div>
            <p className="ios-event-card__title">{title}</p>
          </Link>
        );
      })}
    </div>
  );
}
