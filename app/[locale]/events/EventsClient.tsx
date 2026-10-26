"use client";

import React, { useState } from "react";
import { useCachedFetch } from "@/lib/client-cache";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, MapPin } from "lucide-react";
import { useLocale } from "next-intl";
import PremiumPageShell from "@/app/components/PremiumPageShell";
import IOSLargeTitle from "@/app/components/ui/IOSLargeTitle";
import IOSSegmented from "@/app/components/ui/IOSSegmented";
import EmptyState from "@/app/components/ui/EmptyState";
import IOS26Card from "@/app/components/ui/IOS26Card";
import { springNative } from "@/lib/motion";
import SharedHero from "@/app/components/SharedHero";

interface EventItem {
  _id: string;
  title: { [k: string]: string };
  date: string;
  timeString: string;
  location: { [k: string]: string };
  image: string;
  category: string;
}

const FILTERS = [
  { id: "all", label: "Бүгд" },
  { id: "campaign", label: "Campaign" },
  { id: "workshop", label: "Workshop" },
  { id: "meeting", label: "Meeting" },
  { id: "fundraiser", label: "Fundraiser" },
];

function EventCard({ ev, locale, index }: { ev: EventItem; locale: string; index: number }) {
  const title = ev.title?.[locale] || ev.title?.en || "";
  const loc = ev.location?.[locale] || ev.location?.en || "";
  const d = new Date(ev.date);
  const day = Number.isNaN(d.getTime()) ? "—" : d.getDate().toString().padStart(2, "0");
  const month = Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString(locale === "mn" ? "mn-MN" : "en-US", { month: "short" });

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...springNative, delay: index * 0.04 }}
    >
      <IOS26Card href={`/events/${ev._id}`}>
        <div className="ios26-card__media">
          {ev.image ? (
            <SharedHero
              kind="event"
              id={ev._id}
              src={ev.image}
              alt={title}
              sizes="(max-width: 520px) 100vw, 480px"
              radius={18}
            />
          ) : (
            <div className="ios26-card__media-fallback">
              <Calendar size={36} strokeWidth={1.5} />
            </div>
          )}
          <div className="ios26-card__date">
            <strong>{day}</strong>
            <span>{month}</span>
          </div>
          {ev.category ? <span className="ios26-card__chip">{ev.category}</span> : null}
        </div>
        <div className="ios26-card__body">
          <h3 className="ios26-card__title">{title}</h3>
          <div className="ios26-card__meta">
            {ev.timeString ? <span>{ev.timeString}</span> : null}
            {loc ? (
              <span className="inline-flex items-center gap-1">
                <MapPin size={12} strokeWidth={1.75} />
                {loc}
              </span>
            ) : null}
          </div>
        </div>
      </IOS26Card>
    </motion.div>
  );
}

export default function EventsClient({ initialEvents }: { initialEvents?: EventItem[] }) {
  const locale = useLocale();
  const [filter, setFilter] = useState("all");
  const { data, loading } = useCachedFetch<EventItem[]>("/api/events", {
    staleMsMs: 45_000,
    initialData: initialEvents,
  });
  const events = data ?? [];
  const filtered = filter === "all" ? events : events.filter((e) => e.category === filter);

  return (
    <PremiumPageShell className="ios26-page">
      <div className="home-sections">
        <IOSLargeTitle title="Арга хэмжээ">
          <p className="ios-subhead mt-1">Ойрын эвент, уулзалт, аян</p>
        </IOSLargeTitle>
        <IOSSegmented options={FILTERS} value={filter} onChange={setFilter} />
        <AnimatePresence mode="wait">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="ios-skel h-56 rounded-[22px]" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="Арга хэмжээ байхгүй"
              description="Удахгүй шинэ арга хэмжээ нэмэгдэнэ"
            />
          ) : (
            <div className="space-y-3">
              {filtered.map((ev, i) => (
                <EventCard key={ev._id} ev={ev} locale={locale} index={i} />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </PremiumPageShell>
  );
}
