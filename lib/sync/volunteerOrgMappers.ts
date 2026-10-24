import { z } from "zod";
import { sanitizeHtml } from "@/lib/sync/sanitizeHtml";

export const SOURCE = "volunteer.org.mn" as const;
export const BASE = "https://volunteer.org.mn";

export function absUrl(path?: string | null): string {
  if (!path) return "";
  const raw = String(path).trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  const withSlash = raw.startsWith("/") ? raw : `/${raw}`;
  return `${BASE}${encodeURI(withSlash)}`;
}

/** Parse "YYYY-MM-DD HH:mm:ss" as Ulaanbaatar (+08:00). */
export function parseUbDate(input?: string | null): Date | null {
  if (!input) return null;
  const s = String(input).trim();
  const m = s.match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/
  );
  if (m) {
    const sec = m[6] || "00";
    const iso = `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${sec}+08:00`;
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatTimeString(d: Date | null, end?: Date | null): string {
  if (!d) return "00:00";
  const fmt = (date: Date) => {
    const parts = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Ulaanbaatar",
    }).formatToParts(date);
    const h = parts.find((p) => p.type === "hour")?.value || "00";
    const min = parts.find((p) => p.type === "minute")?.value || "00";
    return `${h}:${min}`;
  };
  const start = fmt(d);
  if (!end) return start;
  return `${start} - ${fmt(end)}`;
}

function i18nFromMn(mn: string) {
  const text = mn || "";
  return { mn: text, en: text, de: text };
}

export const newsListItemSchema = z.object({
  id: z.union([z.number(), z.string()]),
  title: z.string().nullable().optional(),
  thumb: z.string().nullable().optional(),
  created_at: z.string().nullable().optional(),
});

export const newsDetailSchema = z.object({
  id: z.union([z.number(), z.string()]).optional(),
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  thumb: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  created_at: z.string().nullable().optional(),
});

export const eventItemSchema = z.object({
  id: z.union([z.number(), z.string()]),
  title: z.string().nullable().optional(),
  is_publish: z.union([z.number(), z.string(), z.boolean()]).nullable().optional(),
  address: z.string().nullable().optional(),
  event_date1: z.string().nullable().optional(),
  event_date2: z.string().nullable().optional(),
  banner: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  price: z.union([z.number(), z.string()]).nullable().optional(),
  personcount: z.union([z.number(), z.string()]).nullable().optional(),
  deleted_at: z.string().nullable().optional(),
});

export const volunteerItemSchema = z.object({
  id: z.union([z.number(), z.string()]),
  works: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  enddate: z.string().nullable().optional(),
  personcount: z.union([z.number(), z.string()]).nullable().optional(),
  organization: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});

export const sliderItemSchema = z.object({
  id: z.union([z.number(), z.string()]),
  text1: z.string().nullable().optional(),
  link: z.string().nullable().optional(),
  link_text: z.string().nullable().optional(),
  slider: z.string().nullable().optional(),
  status: z.union([z.number(), z.string(), z.boolean()]).nullable().optional(),
});

export function isTruthyStatus(v: unknown): boolean {
  return v === true || v === "True" || v === "true" || v === 1 || v === "1";
}

export function mapNewsDoc(
  list: z.infer<typeof newsListItemSchema>,
  detail?: z.infer<typeof newsDetailSchema> | null
) {
  const id = String(list.id);
  const title = (detail?.title || list.title || "").trim() || "Мэдээ";
  const summary = (detail?.description || title).trim();
  const contentHtml = sanitizeHtml(detail?.content || summary);
  const image = absUrl(detail?.thumb || list.thumb) || `${BASE}/favicon.ico`;
  const publishedDate = parseUbDate(detail?.created_at || list.created_at) || new Date();
  const i18nTitle = i18nFromMn(title);
  const i18nSummary = i18nFromMn(summary);
  const i18nContent = i18nFromMn(contentHtml);

  return {
    filter: { source: SOURCE, externalId: id },
    set: {
      title: i18nTitle,
      summary: i18nSummary,
      content: i18nContent,
      author: SOURCE,
      publishedDate,
      image,
      source: SOURCE,
      externalId: id,
      externalUrl: `${BASE}/news/${id}`,
      syncedAt: new Date(),
    },
    setOnInsert: {
      featured: false,
      views: 0,
      status: "published" as const,
      tags: [] as string[],
    },
  };
}

export function shouldSkipEvent(item: z.infer<typeof eventItemSchema>): boolean {
  if (item.deleted_at) return true;
  const pub = item.is_publish;
  if (pub === 0 || pub === "0" || pub === false || pub === "false") return true;
  if (pub != null && !isTruthyStatus(pub) && pub !== 1 && pub !== "1") return true;
  return false;
}

/** End of Asia/Ulaanbaatar calendar day for a start instant (keeps same-day events visible). */
export function endOfUbDay(d: Date): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ulaanbaatar",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const y = parts.find((p) => p.type === "year")?.value;
  const m = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;
  if (!y || !m || !day) return new Date(d.getTime() + 12 * 60 * 60 * 1000);
  return new Date(`${y}-${m}-${day}T23:59:59+08:00`);
}

export function mapEventDoc(item: z.infer<typeof eventItemSchema>, now = new Date()) {
  if (shouldSkipEvent(item)) return null;
  const id = String(item.id);
  const title = (item.title || "").trim() || "Эвент";
  const date = parseUbDate(item.event_date1);
  if (!date) return null;
  const end = parseUbDate(item.event_date2);
  const description = sanitizeHtml(item.content) || title;
  const location = (item.address || "").trim() || "Улаанбаатар";
  const image = absUrl(item.banner) || `${BASE}/favicon.ico`;
  const price = Number(item.price) || 0;
  // Prefer explicit end; otherwise keep "upcoming" through the UB calendar day of start.
  const effectiveEnd = end && end.getTime() >= date.getTime() ? end : endOfUbDay(date);
  const status = effectiveEnd.getTime() < now.getTime() ? "past" : "upcoming";

  return {
    filter: { source: SOURCE, externalId: id },
    set: {
      title: i18nFromMn(title),
      description: i18nFromMn(description),
      date,
      timeString: formatTimeString(date, end),
      location: i18nFromMn(location),
      image,
      category: "campaign" as const,
      university: "VCM",
      ticketPrice: price,
      status,
      source: SOURCE,
      externalId: id,
      externalUrl: `${BASE}/events/${id}`,
      syncedAt: new Date(),
    },
    setOnInsert: {
      featured: false,
      attendees: [] as unknown[],
    },
  };
}

export function mapVolunteerProgramDoc(item: z.infer<typeof volunteerItemSchema>) {
  const id = String(item.id);
  const name = (item.works || "").trim() || `Хөтөлбөр ${id}`;
  const description = (item.description || name).trim();
  const image = absUrl(item.image);
  const slots = Math.max(0, Number(item.personcount) || 0);
  const org = (item.organization || "").trim();
  const slug = `vorg-${id}`;
  const code = `VORG${id}`;

  return {
    filter: { source: SOURCE, externalId: id },
    set: {
      code,
      slug,
      name: i18nFromMn(name),
      description: i18nFromMn(description),
      why: i18nFromMn(description),
      href: `/programs/${slug}`,
      location: org || "Монгол улс",
      slots: slots || 10,
      emoji: "🤝",
      ...(image ? { image, color: "#0EA5E9" } : {}),
      tags: org ? [org] : [],
      source: SOURCE,
      externalId: id,
      externalUrl: `${BASE}/volunteer/${id}`,
      syncedAt: new Date(),
    },
    setOnInsert: {
      active: true,
      order: 1000 + (Number(id) || 0),
      applicationQuestions: [],
      features: [],
      duration: "",
    },
  };
}

export function mapBannerDoc(item: z.infer<typeof sliderItemSchema>, order = 0) {
  const id = String(item.id);
  const title = (item.text1 || "").trim() || "Баннер";
  const image = absUrl(item.slider);
  if (!image) return null;
  const active = isTruthyStatus(item.status);

  return {
    filter: { source: SOURCE, externalId: id },
    set: {
      title: { mn: title, en: title },
      subtitle: { mn: item.link_text || "", en: item.link_text || "" },
      image,
      link: item.link || "",
      active,
      order,
      source: SOURCE,
      externalId: id,
      externalUrl: item.link || BASE,
      syncedAt: new Date(),
    },
    setOnInsert: {
      intervalSec: 8,
    },
  };
}
