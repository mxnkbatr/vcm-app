"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X, Clock, Trash2 } from "lucide-react";
import { Link } from "@/navigation";
import { useLocale } from "next-intl";
import { springNative } from "@/lib/motion";
import {
  clearRecentSearches,
  loadRecentSearches,
  POPULAR_CHIPS,
  removeRecentSearch,
  saveRecentSearch,
} from "@/lib/search-recent";
import { clientCache } from "@/lib/client-cache";

type Hit = {
  id: string;
  group: "events" | "programs" | "courses" | "shop";
  title: string;
  subtitle?: string;
  href: string;
};

const GROUP_LABEL: Record<Hit["group"], { mn: string; en: string }> = {
  events: { mn: "Эвент", en: "Events" },
  programs: { mn: "Хөтөлбөр", en: "Programs" },
  courses: { mn: "Сургалт", en: "Courses" },
  shop: { mn: "Дэлгүүр", en: "Shop" },
};

function pickLocale(
  value: unknown,
  locale: string
): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null) {
    const o = value as Record<string, string>;
    return o[locale] || o.mn || o.en || Object.values(o)[0] || "";
  }
  return String(value);
}

function highlight(text: string, q: string) {
  if (!q.trim()) return text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx < 0) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="search-mark">{text.slice(idx, idx + q.length)}</mark>
      {text.slice(idx + q.length)}
    </>
  );
}

async function fetchCatalog(): Promise<{
  events: unknown[];
  programs: unknown[];
  courses: unknown[];
  shop: unknown[];
}> {
  const urls = ["/api/events", "/api/programs", "/api/lms/courses", "/api/shopping"] as const;
  const results = await Promise.all(
    urls.map(async (url) => {
      const cached = clientCache.get<unknown>(url);
      if (cached) return cached;
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      clientCache.set(url, data);
      return data;
    })
  );
  return {
    events: Array.isArray(results[0]) ? results[0] : [],
    programs: Array.isArray(results[1]) ? results[1] : [],
    courses: Array.isArray(results[2]) ? results[2] : [],
    shop: Array.isArray(results[3]) ? results[3] : [],
  };
}

function filterHits(catalog: Awaited<ReturnType<typeof fetchCatalog>>, q: string, locale: string): Hit[] {
  const needle = q.trim().toLowerCase();
  if (!needle) return [];
  const hits: Hit[] = [];

  for (const e of catalog.events as Array<Record<string, unknown>>) {
    const title = pickLocale(e.title, locale);
    const loc = pickLocale(e.location, locale);
    if (title.toLowerCase().includes(needle) || loc.toLowerCase().includes(needle)) {
      hits.push({
        id: String(e._id),
        group: "events",
        title,
        subtitle: loc,
        href: `/events/${e._id}`,
      });
    }
  }
  for (const p of catalog.programs as Array<Record<string, unknown>>) {
    const title = pickLocale(p.name, locale) || pickLocale(p.title, locale) || String(p.code || "");
    if (title.toLowerCase().includes(needle)) {
      hits.push({
        id: String(p._id || p.code),
        group: "programs",
        title,
        subtitle: pickLocale(p.tagline, locale),
        href: String(p.href || `/programs/${p.code || p.slug || ""}`),
      });
    }
  }
  for (const c of catalog.courses as Array<Record<string, unknown>>) {
    const title = pickLocale(c.title, locale);
    if (title.toLowerCase().includes(needle)) {
      hits.push({
        id: String(c._id || c.slug),
        group: "courses",
        title,
        subtitle: pickLocale(c.category, locale),
        href: `/lessons/${c.slug || c._id}`,
      });
    }
  }
  for (const s of catalog.shop as Array<Record<string, unknown>>) {
    const title = pickLocale(s.name, locale);
    if (title.toLowerCase().includes(needle)) {
      hits.push({
        id: String(s._id),
        group: "shop",
        title,
        subtitle: s.price != null ? `${s.price}₮` : undefined,
        href: `/shop/${s._id}`,
      });
    }
  }
  return hits;
}

export default function GlobalSearch() {
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [loading, setLoading] = useState(false);
  const [hits, setHits] = useState<Hit[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const catalogRef = useRef<Awaited<ReturnType<typeof fetchCatalog>> | null>(null);

  useEffect(() => {
    const openSearch = () => {
      setOpen(true);
      setRecent(loadRecentSearches());
    };
    window.addEventListener("vcm:open-search", openSearch);
    return () => window.removeEventListener("vcm:open-search", openSearch);
  }, []);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(query), 250);
    return () => window.clearTimeout(t);
  }, [query]);

  const runSearch = useCallback(
    async (q: string) => {
      if (!q.trim()) {
        setHits([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        if (!catalogRef.current) catalogRef.current = await fetchCatalog();
        setHits(filterHits(catalogRef.current, q, locale));
      } finally {
        setLoading(false);
      }
    },
    [locale]
  );

  useEffect(() => {
    void runSearch(debounced);
  }, [debounced, runSearch]);

  const grouped = useMemo(() => {
    const order: Hit["group"][] = ["events", "programs", "courses", "shop"];
    return order
      .map((g) => ({ group: g, items: hits.filter((h) => h.group === g) }))
      .filter((g) => g.items.length > 0);
  }, [hits]);

  const close = () => {
    setOpen(false);
    setQuery("");
    setDebounced("");
    setHits([]);
  };

  const commitSearch = (term: string) => {
    setQuery(term);
    setDebounced(term);
    setRecent(saveRecentSearch(term));
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="global-search lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <motion.div
            className="global-search__panel"
            initial={{ y: -24, opacity: 0.85 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -16, opacity: 0 }}
            transition={springNative}
          >
            <div className="global-search__bar">
              <div className="global-search__field">
                <Search size={18} strokeWidth={1.75} />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && query.trim()) commitSearch(query);
                  }}
                  placeholder="Хайх"
                  aria-label="Хайх"
                />
                {query && (
                  <button type="button" className="press" aria-label="Цэвэрлэх" onClick={() => setQuery("")}>
                    <X size={16} strokeWidth={1.75} />
                  </button>
                )}
              </div>
              <button type="button" className="global-search__cancel press" onClick={close}>
                Болих
              </button>
            </div>

            <div className="global-search__body">
              {!query.trim() && (
                <>
                  {recent.length > 0 && (
                    <section className="mb-5">
                      <div className="flex items-center justify-between mb-2 px-1">
                        <p className="ios-caption uppercase tracking-wide">Сүүлийн хайлт</p>
                        <button
                          type="button"
                          className="press text-[13px] font-semibold"
                          style={{ color: "var(--blue)" }}
                          onClick={() => {
                            clearRecentSearches();
                            setRecent([]);
                          }}
                        >
                          Цэвэрлэх
                        </button>
                      </div>
                      <ul className="space-y-1">
                        {recent.map((r) => (
                          <li key={r} className="global-search__recent">
                            <button type="button" className="press flex-1 min-w-0 text-left" onClick={() => commitSearch(r)}>
                              <Clock size={16} strokeWidth={1.75} />
                              <span className="truncate">{r}</span>
                            </button>
                            <button
                              type="button"
                              className="press p-2"
                              aria-label="Устгах"
                              onClick={() => setRecent(removeRecentSearch(r))}
                            >
                              <Trash2 size={15} strokeWidth={1.75} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                  <section>
                    <p className="ios-caption uppercase tracking-wide mb-2 px-1">Түгээмэл</p>
                    <div className="flex flex-wrap gap-2">
                      {POPULAR_CHIPS.map((c) => (
                        <button key={c} type="button" className="auth-chip press" onClick={() => commitSearch(c)}>
                          {c}
                        </button>
                      ))}
                    </div>
                  </section>
                </>
              )}

              {query.trim() && loading && (
                <div className="space-y-3 pt-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="ios-skel h-14 rounded-2xl" />
                  ))}
                </div>
              )}

              {query.trim() && !loading && grouped.length === 0 && (
                <div className="global-search__empty">
                  <Search size={40} strokeWidth={1.5} style={{ color: "var(--label3)" }} />
                  <p className="ios-headline mt-3">Үр дүн олдсонгүй</p>
                  <p className="ios-subhead mt-1">“{query}” гэсэн хайлтад тохирох зүйл алга</p>
                </div>
              )}

              {query.trim() && !loading &&
                grouped.map(({ group, items }) => (
                  <section key={group} className="mb-5">
                    <p className="ios-caption uppercase tracking-wide mb-2 px-1">
                      {GROUP_LABEL[group][locale === "mn" ? "mn" : "en"]}
                    </p>
                    <div className="ios-list">
                      {items.map((item) => (
                        <Link
                          key={`${group}-${item.id}`}
                          href={item.href}
                          className="ios-list-row press"
                          onClick={() => {
                            saveRecentSearch(query);
                            close();
                          }}
                        >
                          <span className="ios-list-row__text">
                            <span className="ios-list-row__title">{highlight(item.title, query)}</span>
                            {item.subtitle ? (
                              <span className="ios-list-row__sub">{item.subtitle}</span>
                            ) : null}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </section>
                ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
