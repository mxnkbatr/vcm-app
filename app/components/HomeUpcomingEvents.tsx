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
  date?: string;
  image?: string;
};

function parts(date?: string, lang?: string) {
  if (!date) return { day: "—", month: "" };
  const raw = typeof date === "string" ? date : String(date);
  const normalized = raw.includes("T") ? raw : raw.replace(/-/g, "/");
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) return { day: "—", month: "" };
  return {
    day: d.getDate().toString().padStart(2, "0"),
    month: d.toLocaleDateString(lang === "mn" ? "mn-MN" : "en-US", { month: "short" }),
  };
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
          clientCache.set("/api/events", data);
          setEvents(Array.isArray(data) ? data : []);
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
            <div className="ios-skel" style={{ aspectRatio: "16/10", borderRadius: 20 }} />
            <div className="ios-skel h-4 mt-2 w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  const q = query.trim().toLowerCase();
  const upcoming = events
    .filter((item) => !q || pickI18n(item.title as any, lang).toLowerCase().includes(q))
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
        const title = pickI18n(item.title as any, lang) || "Арга хэмжээ";
        const { day, month } = parts(item.date, lang);
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
