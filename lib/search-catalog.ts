import { clientCache } from "@/lib/client-cache";

export type SearchGroup = "events" | "news" | "programs" | "courses" | "shop";

export type SearchHit = {
  id: string;
  group: SearchGroup;
  title: string;
  subtitle?: string;
  href: string;
  image?: string;
  score: number;
};

export type SearchCatalog = {
  events: unknown[];
  news: unknown[];
  programs: unknown[];
  courses: unknown[];
  shop: unknown[];
};

export const SEARCH_FILTERS: { id: "all" | SearchGroup; mn: string; en: string }[] = [
  { id: "all", mn: "Бүгд", en: "All" },
  { id: "events", mn: "Эвент", en: "Events" },
  { id: "news", mn: "Мэдээ", en: "News" },
  { id: "programs", mn: "Хөтөлбөр", en: "Programs" },
  { id: "courses", mn: "Сургалт", en: "Courses" },
  { id: "shop", mn: "Дэлгүүр", en: "Shop" },
];

export function pickLocale(value: unknown, locale: string): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null) {
    const o = value as Record<string, string>;
    return o[locale] || o.mn || o.en || Object.values(o)[0] || "";
  }
  return String(value);
}

function norm(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Score how well haystack matches needle (higher = better). */
export function matchScore(haystack: string, needle: string): number {
  const h = norm(haystack);
  const n = norm(needle);
  if (!h || !n) return 0;
  if (h === n) return 120;
  if (h.startsWith(n)) return 90;
  const words = h.split(" ");
  if (words.some((w) => w.startsWith(n))) return 70;
  if (h.includes(n)) return 50;
  // token overlap
  const nTokens = n.split(" ").filter(Boolean);
  if (nTokens.length > 1 && nTokens.every((t) => h.includes(t))) return 40;
  return 0;
}

function bestScore(fields: Array<string | undefined>, needle: string): number {
  let max = 0;
  for (const f of fields) {
    if (!f) continue;
    max = Math.max(max, matchScore(f, needle));
  }
  return max;
}

export async function fetchSearchCatalog(): Promise<SearchCatalog> {
  const urls = [
    "/api/events",
    "/api/news",
    "/api/programs",
    "/api/lms/courses",
    "/api/shopping",
  ] as const;

  const results = await Promise.all(
    urls.map(async (url) => {
      const cached = clientCache.get<unknown>(url);
      if (cached) return cached;
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      // LMS may return { courses: [] }
      const list = Array.isArray(data)
        ? data
        : Array.isArray((data as { courses?: unknown[] })?.courses)
          ? (data as { courses: unknown[] }).courses
          : Array.isArray((data as { items?: unknown[] })?.items)
            ? (data as { items: unknown[] }).items
            : [];
      clientCache.set(url, list);
      return list;
    })
  );

  return {
    events: results[0] as unknown[],
    news: results[1] as unknown[],
    programs: results[2] as unknown[],
    courses: results[3] as unknown[],
    shop: results[4] as unknown[],
  };
}

export function filterSearchHits(
  catalog: SearchCatalog,
  q: string,
  locale: string,
  filter: "all" | SearchGroup = "all"
): SearchHit[] {
  const needle = q.trim();
  if (!needle) return [];
  const hits: SearchHit[] = [];
  const want = (g: SearchGroup) => filter === "all" || filter === g;

  if (want("events")) {
    for (const raw of catalog.events as Array<Record<string, unknown>>) {
      const title = pickLocale(raw.title, locale);
      const loc = pickLocale(raw.location, locale);
      const desc = pickLocale(raw.description, locale);
      const cat = String(raw.category || "");
      const score = bestScore([title, loc, desc, cat, String(raw.university || "")], needle);
      if (score <= 0) continue;
      hits.push({
        id: String(raw._id),
        group: "events",
        title,
        subtitle: [cat, loc].filter(Boolean).join(" · ") || undefined,
        href: `/events/${raw._id}`,
        image: typeof raw.image === "string" ? raw.image : undefined,
        score: score + 5, // slight boost — upcoming actions
      });
    }
  }

  if (want("news")) {
    for (const raw of catalog.news as Array<Record<string, unknown>>) {
      const title = pickLocale(raw.title, locale);
      const summary = pickLocale(raw.summary, locale);
      const tags = Array.isArray(raw.tags) ? (raw.tags as string[]).join(" ") : "";
      const author = String(raw.author || "");
      const score = bestScore([title, summary, tags, author], needle);
      if (score <= 0) continue;
      hits.push({
        id: String(raw._id),
        group: "news",
        title,
        subtitle: summary || author || undefined,
        href: `/news/${raw._id}`,
        image: typeof raw.image === "string" ? raw.image : undefined,
        score,
      });
    }
  }

  if (want("programs")) {
    for (const raw of catalog.programs as Array<Record<string, unknown>>) {
      const title =
        pickLocale(raw.name, locale) || pickLocale(raw.title, locale) || String(raw.code || "");
      const tagline = pickLocale(raw.tagline, locale) || pickLocale(raw.description, locale);
      const code = String(raw.code || raw.slug || "");
      const score = bestScore([title, tagline, code], needle);
      if (score <= 0) continue;
      hits.push({
        id: String(raw._id || code),
        group: "programs",
        title,
        subtitle: tagline || code || undefined,
        href: String(raw.href || `/programs/${code}`),
        image: typeof raw.image === "string" ? raw.image : undefined,
        score: score + 3,
      });
    }
  }

  if (want("courses")) {
    for (const raw of catalog.courses as Array<Record<string, unknown>>) {
      const title = pickLocale(raw.title, locale);
      const cat = pickLocale(raw.category, locale);
      const score = bestScore([title, cat, String(raw.slug || "")], needle);
      if (score <= 0) continue;
      hits.push({
        id: String(raw._id || raw.slug),
        group: "courses",
        title,
        subtitle: cat || undefined,
        href: `/lessons/${raw.slug || raw._id}`,
        image: typeof raw.thumbnail === "string" ? raw.thumbnail : typeof raw.image === "string" ? raw.image : undefined,
        score,
      });
    }
  }

  if (want("shop")) {
    for (const raw of catalog.shop as Array<Record<string, unknown>>) {
      const title = pickLocale(raw.name, locale);
      const cat = String(raw.category || "");
      const score = bestScore([title, cat], needle);
      if (score <= 0) continue;
      hits.push({
        id: String(raw._id),
        group: "shop",
        title,
        subtitle: raw.price != null ? `${Number(raw.price).toLocaleString()}₮` : cat || undefined,
        href: `/shop/${raw._id}`,
        image: typeof raw.image === "string" ? raw.image : undefined,
        score,
      });
    }
  }

  return hits.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, "mn"));
}
