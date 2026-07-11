"use client";

import { Link } from "@/navigation";
import { Calendar, MapPin, ChevronRight } from "lucide-react";

type EventCompactRowProps = {
  id: string;
  title: string;
  date?: string;
  timeString?: string;
  location?: string;
  locale?: string;
  className?: string;
};

function formatEventDate(date?: string, lang?: string) {
  if (!date) return "—";
  const d = new Date(typeof date === "string" ? date.replace(/-/g, "/") : date);
  return d.toLocaleDateString(lang === "mn" ? "mn-MN" : "en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function EventCompactRow({
  id,
  title,
  date,
  timeString,
  location,
  locale = "mn",
  className = "",
}: EventCompactRowProps) {
  return (
    <Link href={`/events/${id}`} className={`home-event-row press ${className}`}>
      <div className="home-event-row__date">
        <Calendar size={14} strokeWidth={2.2} />
        <span>{formatEventDate(date, locale)}</span>
      </div>
      <p className="home-event-row__title">{title || "Арга хэмжээ"}</p>
      <div className="home-event-row__meta">
        {timeString && <span>{timeString}</span>}
        {location && (
          <span className="home-event-row__loc">
            <MapPin size={11} />
            {location}
          </span>
        )}
      </div>
      <ChevronRight size={16} className="home-event-row__chev" strokeWidth={2.5} />
    </Link>
  );
}

export function pickI18n(
  val: Record<string, string> | string | undefined,
  lang: string
) {
  if (!val) return "";
  if (typeof val === "string") return val;
  return val[lang] || val.en || val.mn || "";
}
