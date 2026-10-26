"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search, X, Clock, Trash2, Ticket, Newspaper, Users, BookOpen, ShoppingBag, ChevronRight,
} from "lucide-react";
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
import {
  fetchSearchCatalog,
  filterSearchHits,
  SEARCH_FILTERS,
  type SearchCatalog,
  type SearchGroup,
  type SearchHit,
} from "@/lib/search-catalog";

const GROUP_ICON: Record<SearchGroup, typeof Ticket> = {
  events: Ticket,
  news: Newspaper,
  programs: Users,
  courses: BookOpen,
  shop: ShoppingBag,
};

const GROUP_LABEL: Record<SearchGroup, { mn: string; en: string }> = {
  events: { mn: "Эвент", en: "Events" },
  news: { mn: "Мэдээ", en: "News" },
  programs: { mn: "Хөтөлбөр", en: "Programs" },
  courses: { mn: "Сургалт", en: "Courses" },
  shop: { mn: "Дэлгүүр", en: "Shop" },
};

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

type FilterId = "all" | SearchGroup;

export default function GlobalSearch() {
  const locale = useLocale();
  const mn = locale === "mn";
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [filter, setFilter] = useState<FilterId>("all");
  const [loading, setLoading] = useState(false);
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const catalogRef = useRef<SearchCatalog | null>(null);

  useEffect(() => {
    const openSearch = (ev: Event) => {
      const detail = (ev as CustomEvent<{ filter?: FilterId; q?: string }>).detail;
      setOpen(true);
      setRecent(loadRecentSearches());
      if (detail?.filter) setFilter(detail.filter);
      if (detail?.q) {
        setQuery(detail.q);
        setDebounced(detail.q);
      }
    };
    window.addEventListener("vcm:open-search", openSearch);
    return () => window.removeEventListener("vcm:open-search", openSearch);
  }, []);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 50);
    // Prefetch catalog while idle
    if (!catalogRef.current) {
      void fetchSearchCatalog().then((c) => {
        catalogRef.current = c;
      });
    }
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(query), 220);
    return () => window.clearTimeout(t);
  }, [query]);

  const runSearch = useCallback(
    async (q: string, f: FilterId) => {
      if (!q.trim()) {
        setHits([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        if (!catalogRef.current) catalogRef.current = await fetchSearchCatalog();
        setHits(filterSearchHits(catalogRef.current, q, locale, f));
      } finally {
        setLoading(false);
      }
    },
    [locale]
  );

  useEffect(() => {
    void runSearch(debounced, filter);
  }, [debounced, filter, runSearch]);

  const grouped = useMemo(() => {
    const order: SearchGroup[] = ["events", "news", "programs", "courses", "shop"];
    return order
      .map((g) => ({ group: g, items: hits.filter((h) => h.group === g).slice(0, 8) }))
      .filter((g) => g.items.length > 0);
  }, [hits]);

  const close = () => {
    setOpen(false);
    setQuery("");
    setDebounced("");
    setHits([]);
    setFilter("all");
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
          initial={{ y: 8 }}
          animate={{ y: 0 }}
          exit={{ y: 8 }}
          transition={springNative}
        >
          <div className="global-search__panel">
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
                  placeholder={mn ? "Эвент, мэдээ, хөтөлбөр…" : "Events, news, programs…"}
                  aria-label={mn ? "Хайх" : "Search"}
                  enterKeyHint="search"
                  autoCapitalize="off"
                  autoCorrect="off"
                />
                {query ? (
                  <button type="button" className="press" aria-label="Цэвэрлэх" onClick={() => setQuery("")}>
                    <X size={16} strokeWidth={1.75} />
                  </button>
                ) : null}
              </div>
              <button type="button" className="global-search__cancel press" onClick={close}>
                {mn ? "Болих" : "Cancel"}
              </button>
            </div>

            <div className="global-search__filters" role="tablist" aria-label={mn ? "Шүүлтүүр" : "Filter"}>
              {SEARCH_FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={filter === f.id}
                  className={`global-search__chip press ${filter === f.id ? "is-active" : ""}`}
                  onClick={() => setFilter(f.id)}
                >
                  {mn ? f.mn : f.en}
                </button>
              ))}
            </div>

            <div className="global-search__body">
              {!query.trim() && (
                <>
                  {recent.length > 0 && (
                    <section className="mb-5">
                      <div className="flex items-center justify-between mb-2 px-1">
                        <p className="ios-caption uppercase tracking-wide">
                          {mn ? "Сүүлийн хайлт" : "Recent"}
                        </p>
                        <button
                          type="button"
                          className="press text-[13px] font-semibold"
                          style={{ color: "var(--blue)" }}
                          onClick={() => {
                            clearRecentSearches();
                            setRecent([]);
                          }}
                        >
                          {mn ? "Цэвэрлэх" : "Clear"}
                        </button>
                      </div>
                      <ul className="space-y-1">
                        {recent.map((r) => (
                          <li key={r} className="global-search__recent">
                            <button
                              type="button"
                              className="press flex-1 min-w-0 text-left"
                              onClick={() => commitSearch(r)}
                            >
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
                    <p className="ios-caption uppercase tracking-wide mb-2 px-1">
                      {mn ? "Түгээмэл" : "Popular"}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {POPULAR_CHIPS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          className="global-search__suggest press"
                          onClick={() => {
                            if (c === "Эвент") {
                              setFilter("events");
                              return;
                            }
                            if (c === "Мэдээ") {
                              setFilter("news");
                              return;
                            }
                            if (c === "Сургалт") setFilter("courses");
                            commitSearch(c);
                          }}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                    <p className="ios-caption mt-4 px-1" style={{ color: "var(--label3)" }}>
                      {mn
                        ? "Шүүлтүүр сонгоод шууд хайлт хийнэ үү."
                        : "Pick a filter, then type to search."}
                    </p>
                  </section>
                </>
              )}

              {query.trim() && loading && (
                <div className="space-y-3 pt-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="ios-skel h-16 rounded-2xl" />
                  ))}
                </div>
              )}

              {query.trim() && !loading && grouped.length === 0 && (
                <div className="global-search__empty">
                  <Search size={40} strokeWidth={1.5} style={{ color: "var(--label3)" }} />
                  <p className="ios-headline mt-3">{mn ? "Үр дүн олдсонгүй" : "No results"}</p>
                  <p className="ios-subhead mt-1">
                    {mn ? `“${query}” гэсэн хайлтад тохирох зүйл алга` : `Nothing matched “${query}”`}
                  </p>
                  {filter !== "all" && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm mt-4"
                      onClick={() => setFilter("all")}
                    >
                      {mn ? "Бүгдээс хайх" : "Search all"}
                    </button>
                  )}
                </div>
              )}

              {query.trim() && !loading && (
                <>
                  <p className="ios-caption px-1 mb-3" style={{ color: "var(--label3)" }}>
                    {mn ? `${hits.length} үр дүн` : `${hits.length} results`}
                  </p>
                  {grouped.map(({ group, items }) => {
                    const Icon = GROUP_ICON[group];
                    return (
                      <section key={group} className="mb-5">
                        <p className="ios-caption uppercase tracking-wide mb-2 px-1 flex items-center gap-1.5">
                          <Icon size={12} strokeWidth={2} />
                          {GROUP_LABEL[group][mn ? "mn" : "en"]}
                          <span style={{ color: "var(--label4)" }}>· {items.length}</span>
                        </p>
                        <div className="global-search__list">
                          {items.map((item) => (
                            <Link
                              key={`${group}-${item.id}`}
                              href={item.href}
                              className="global-search__row press"
                              onClick={() => {
                                saveRecentSearch(query);
                                close();
                              }}
                            >
                              <span className="global-search__thumb">
                                {item.image ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={item.image} alt="" loading="lazy" />
                                ) : (
                                  <Icon size={18} strokeWidth={1.75} />
                                )}
                              </span>
                              <span className="global-search__row-text">
                                <span className="global-search__row-title">
                                  {highlight(item.title, query)}
                                </span>
                                {item.subtitle ? (
                                  <span className="global-search__row-sub">{item.subtitle}</span>
                                ) : null}
                              </span>
                              <ChevronRight size={16} strokeWidth={1.75} className="global-search__chev" />
                            </Link>
                          ))}
                        </div>
                      </section>
                    );
                  })}
                </>
              )}

              {/* Browse-by-filter with empty query */}
              {!query.trim() && filter !== "all" && (
                <BrowseFilter
                  filter={filter}
                  locale={locale}
                  catalogRef={catalogRef}
                  onPick={() => close()}
                />
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** When a category chip is active with no query, show top items from that group. */
function BrowseFilter({
  filter,
  locale,
  catalogRef,
  onPick,
}: {
  filter: SearchGroup;
  locale: string;
  catalogRef: MutableRefObject<SearchCatalog | null>;
  onPick: () => void;
}) {
  const [items, setItems] = useState<SearchHit[]>([]);
  const mn = locale === "mn";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!catalogRef.current) catalogRef.current = await fetchSearchCatalog();
      if (cancelled || !catalogRef.current) return;
      // Use a broad needle via empty-bypass: pull first N of group
      const cat = catalogRef.current;
      const { pickLocale } = await import("@/lib/search-catalog");
      const out: SearchHit[] = [];
      if (filter === "events") {
        for (const raw of (cat.events as Array<Record<string, unknown>>).slice(0, 12)) {
          out.push({
            id: String(raw._id),
            group: "events",
            title: pickLocale(raw.title, locale),
            subtitle: pickLocale(raw.location, locale),
            href: `/events/${raw._id}`,
            image: typeof raw.image === "string" ? raw.image : undefined,
            score: 0,
          });
        }
      } else if (filter === "news") {
        for (const raw of (cat.news as Array<Record<string, unknown>>).slice(0, 12)) {
          out.push({
            id: String(raw._id),
            group: "news",
            title: pickLocale(raw.title, locale),
            subtitle: pickLocale(raw.summary, locale),
            href: `/news/${raw._id}`,
            image: typeof raw.image === "string" ? raw.image : undefined,
            score: 0,
          });
        }
      } else if (filter === "programs") {
        for (const raw of (cat.programs as Array<Record<string, unknown>>).slice(0, 12)) {
          const code = String(raw.code || raw.slug || "");
          out.push({
            id: String(raw._id || code),
            group: "programs",
            title: pickLocale(raw.name, locale) || pickLocale(raw.title, locale) || code,
            subtitle: pickLocale(raw.tagline, locale),
            href: String(raw.href || `/programs/${code}`),
            score: 0,
          });
        }
      } else if (filter === "courses") {
        for (const raw of (cat.courses as Array<Record<string, unknown>>).slice(0, 12)) {
          out.push({
            id: String(raw._id || raw.slug),
            group: "courses",
            title: pickLocale(raw.title, locale),
            href: `/lessons/${raw.slug || raw._id}`,
            score: 0,
          });
        }
      } else if (filter === "shop") {
        for (const raw of (cat.shop as Array<Record<string, unknown>>).slice(0, 12)) {
          out.push({
            id: String(raw._id),
            group: "shop",
            title: pickLocale(raw.name, locale),
            subtitle: raw.price != null ? `${Number(raw.price).toLocaleString()}₮` : undefined,
            href: `/shop/${raw._id}`,
            image: typeof raw.image === "string" ? raw.image : undefined,
            score: 0,
          });
        }
      }
      if (!cancelled) setItems(out.filter((i) => i.title));
    })();
    return () => {
      cancelled = true;
    };
  }, [filter, locale, catalogRef]);

  if (!items.length) return null;
  const Icon = GROUP_ICON[filter];

  return (
    <section className="mt-6">
      <p className="ios-caption uppercase tracking-wide mb-2 px-1">
        {mn ? "Сүүлийнх" : "Browse"} · {GROUP_LABEL[filter][mn ? "mn" : "en"]}
      </p>
      <div className="global-search__list">
        {items.map((item) => (
          <Link
            key={`browse-${item.group}-${item.id}`}
            href={item.href}
            className="global-search__row press"
            onClick={onPick}
          >
            <span className="global-search__thumb">
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image} alt="" loading="lazy" />
              ) : (
                <Icon size={18} strokeWidth={1.75} />
              )}
            </span>
            <span className="global-search__row-text">
              <span className="global-search__row-title">{item.title}</span>
              {item.subtitle ? <span className="global-search__row-sub">{item.subtitle}</span> : null}
            </span>
            <ChevronRight size={16} strokeWidth={1.75} className="global-search__chev" />
          </Link>
        ))}
      </div>
    </section>
  );
}
