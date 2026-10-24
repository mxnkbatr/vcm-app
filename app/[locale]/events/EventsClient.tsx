"use client";

import React, { useState } from "react";
import { useCachedFetch } from "@/lib/client-cache";
import Image from "next/image";
import { Link } from "@/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar } from "lucide-react";
import { useLocale } from "next-intl";
import PremiumPageShell from "@/app/components/PremiumPageShell";
import IOSLargeTitle from "@/app/components/ui/IOSLargeTitle";
import IOSSegmented from "@/app/components/ui/IOSSegmented";
import EmptyState from "@/app/components/ui/EmptyState";
import { springNative } from "@/lib/motion";

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
  const d = new Date(ev.date);
  const day = Number.isNaN(d.getTime()) ? "—" : d.getDate().toString().padStart(2, "0");
  const month = Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString(locale === "mn" ? "mn-MN" : "en-US", { month: "short" });

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...springNative, delay: index * 0.04 }}>
      <Link href={`/events/${ev._id}`} className="press block overflow-hidden rounded-[20px] bg-[var(--card)] border-[0.5px] border-[var(--sep)]">
        <div className="relative h-44 bg-[var(--fill2)]">
          {ev.image ? (
            <Image src={ev.image} alt={title} fill className="object-cover" sizes="(max-width: 520px) 100vw, 480px" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ color: "var(--blue)" }}>
              <Calendar size={40} strokeWidth={1.75} />
            </div>
          )}
          <div className="ios-event-card__badge" style={{ top: 12, left: 12 }}>
            <strong>{day}</strong>
            <span>{month}</span>
          </div>
        </div>
        <div className="px-4 py-3">
          <h3 className="ios-headline line-clamp-2">{title}</h3>
          {ev.timeString ? <p className="ios-footnote mt-1">{ev.timeString}</p> : null}
        </div>
      </Link>
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
    <PremiumPageShell>
      <div className="space-y-4">
        <IOSLargeTitle title="Арга хэмжээ" />
        <IOSSegmented options={FILTERS} value={filter} onChange={setFilter} />
        <AnimatePresence mode="wait">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="ios-skel h-56 rounded-[20px]" />
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
