"use client";
import React, { useState } from "react";
import { useCachedFetch } from "@/lib/client-cache";
import Image from "next/image";
import { Link } from "@/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, MapPin, Calendar, ChevronRight } from "lucide-react";
import { useLocale } from "next-intl";
import PremiumPageShell from "@/app/components/PremiumPageShell";
import PremiumSectionHeader from "@/app/components/PremiumSectionHeader";
import EventCompactRow, { pickI18n } from "@/app/components/EventCompactRow";

interface EventItem {
  _id: string;
  title: { [k: string]: string };
  description: { [k: string]: string };
  date: string;
  timeString: string;
  location: { [k: string]: string };
  image: string;
  category: string;
  status: string;
  link?: string;
}

const CAT_META: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  campaign:   { label: "Campaign",   color: "#0A84FF", bg: "rgba(10,132,255,0.14)",  dot: "#0A84FF" },
  workshop:   { label: "Workshop",   color: "#FF9F0A", bg: "rgba(255,159,10,0.14)",  dot: "#FF9F0A" },
  meeting:    { label: "Meeting",    color: "#30D158", bg: "rgba(48,209,88,0.14)",   dot: "#30D158" },
  fundraiser: { label: "Fundraiser", color: "#FF3B30", bg: "rgba(255,59,48,0.14)",   dot: "#FF3B30" },
  general:    { label: "General",    color: "#8E8E93", bg: "rgba(142,142,147,0.14)", dot: "#8E8E93" },
};
const getCat = (c: string) => CAT_META[c?.toLowerCase()] || CAT_META.general;

const FILTERS = [
  { id: "all",        label: "Бүгд" },
  { id: "campaign",   label: "Campaign" },
  { id: "workshop",   label: "Workshop" },
  { id: "meeting",    label: "Meeting" },
  { id: "fundraiser", label: "Fundraiser" },
];

function EventCard({ ev, locale, index }: { ev: EventItem; locale: string; index: number }) {
  const cat   = getCat(ev.category);
  const title = ev.title?.[locale] || ev.title?.en || "";
  const loc   = ev.location?.[locale] || ev.location?.en || "";

  const d = new Date(ev.date);
  const day   = d.getDate().toString().padStart(2, "0");
  const month = d.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const weekday = d.toLocaleDateString(locale === "mn" ? "mn-MN" : "en-US", { weekday: "short" });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: "spring", stiffness: 360, damping: 32 }}
    >
      <Link
        href={`/events/${ev._id}`}
        className="press block overflow-hidden"
        style={{
          borderRadius: "var(--r-3xl)",
          background: "var(--card)",
          boxShadow: "var(--s-card)",
          border: "0.5px solid var(--sep)",
        }}
      >
        {/* Hero image */}
        <div className="relative overflow-hidden" style={{ height: 220, background: "var(--fill2)" }}>
          {ev.image ? (
            <Image
              src={ev.image}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 520px) 100vw, 480px"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${cat.color}22, ${cat.color}44)` }}
            >
              <Calendar size={48} style={{ color: cat.color, opacity: 0.4 }} />
            </div>
          )}

          {/* Dark gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.1) 100%)",
            }}
          />

          {/* Date badge — top left */}
          <div
            className="absolute top-4 left-4 flex flex-col items-center justify-center rounded-[18px] px-3 py-2"
            style={{
              background: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "0.5px solid rgba(255,255,255,0.3)",
              minWidth: 52,
            }}
          >
            <span className="text-[20px] font-black text-white leading-none">{day}</span>
            <span className="text-[9px] font-bold text-white/80 uppercase tracking-widest mt-0.5">{month}</span>
          </div>

          {/* Category badge — top right */}
          <div className="absolute top-4 right-4">
            <span
              className="text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wide shadow-sm"
              style={{ background: cat.color, color: "white" }}
            >
              {cat.label}
            </span>
          </div>

          {/* Title overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h3 className="text-white font-bold text-[18px] leading-snug line-clamp-2 drop-shadow-md">
              {title}
            </h3>
          </div>
        </div>

        {/* Info row */}
        <div className="px-5 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-4 min-w-0">
            {ev.timeString && (
              <span className="flex items-center gap-1.5 text-[13px] font-medium flex-shrink-0" style={{ color: "var(--label2)" }}>
                <Clock size={14} style={{ color: cat.color }} />
                {ev.timeString}
              </span>
            )}
            {loc && (
              <span className="flex items-center gap-1.5 text-[13px] font-medium truncate" style={{ color: "var(--label2)" }}>
                <MapPin size={14} style={{ color: "var(--label3)" }} />
                <span className="truncate">{loc}</span>
              </span>
            )}
          </div>
          <div
            className="flex items-center gap-1 flex-shrink-0 px-3.5 py-1.5 rounded-full"
            style={{ background: `${cat.color}18` }}
          >
            <span className="text-[12px] font-bold" style={{ color: cat.color }}>Үзэх</span>
            <ChevronRight size={14} style={{ color: cat.color }} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* skeleton */
function EventsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="skeleton"
          style={{ borderRadius: "var(--r-2xl)", height: 256 }}
        />
      ))}
    </div>
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
  const filtered = filter === "all" ? events : events.filter(e => e.category === filter);

  return (
    <PremiumPageShell>
      <div className="space-y-5 pt-2">

        <PremiumSectionHeader
          title="Арга хэмжээ"
          subtitle="Ойрын үйл явдлуудыг хар"
        />

        {/* Filter pills */}
        <div className="premium-filter-row">
          {FILTERS.map(f => {
            const isOn = filter === f.id;
            const meta = getCat(f.id);
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`premium-filter-pill press ${isOn ? "on" : ""}`}
              >
                {f.id !== "all" && (
                  <span
                    className="premium-filter-pill__dot"
                    style={{ background: meta.dot }}
                  />
                )}
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {loading ? (
            <EventsSkeleton />
          ) : filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="premium-empty-state"
            >
              <div className="premium-empty-state__icon">📅</div>
              <p className="premium-empty-state__title">
                Арга хэмжээ байхгүй
              </p>
              <p className="premium-empty-state__sub">
                Удахгүй шинэ арга хэмжээ нэмэгдэнэ
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={filter}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="home-events-list"
            >
              {filtered.map((ev) => (
                <EventCompactRow
                  key={ev._id}
                  id={ev._id}
                  title={pickI18n(ev.title, locale)}
                  date={ev.date}
                  timeString={ev.timeString}
                  location={pickI18n(ev.location, locale)}
                  locale={locale}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </PremiumPageShell>
  );
}
