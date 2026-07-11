"use client";

import { useEffect, useState } from "react";
import { Link } from "@/navigation";
import { useLocale } from "next-intl";
import { ChevronRight } from "lucide-react";
import { clientCache } from "@/lib/client-cache";
import EventCompactRow, { pickI18n } from "./EventCompactRow";

type EventItem = {
  _id: string;
  title?: Record<string, string> | string;
  date?: string;
  timeString?: string;
  location?: Record<string, string> | string;
};

export default function HomeUpcomingEvents({ limit = 3 }: { limit?: number }) {
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
      <div className="home-events-list">
        {Array.from({ length: limit }).map((_, i) => (
          <div key={i} className="home-event-row home-event-row--skeleton animate-pulse" />
        ))}
      </div>
    );
  }

  const upcoming = events.slice(0, limit);

  if (upcoming.length === 0) {
    return (
      <div className="home-events-empty">
        <span className="text-2xl">📅</span>
        <p>Одоогоор эвент байхгүй</p>
        <Link href="/events" className="home-events-empty__link press">
          Бүх эвентийг харах
          <ChevronRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div className="home-events-list">
      {upcoming.map((item) => (
        <EventCompactRow
          key={item._id}
          id={item._id}
          title={pickI18n(item.title as any, lang)}
          date={item.date}
          timeString={item.timeString}
          location={pickI18n(item.location as any, lang)}
          locale={lang}
        />
      ))}
    </div>
  );
}
