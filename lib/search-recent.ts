const KEY = "vcm-recent-searches";
const MAX = 8;

export function loadRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === "string") : [];
  } catch {
    return [];
  }
}

export function saveRecentSearch(q: string): string[] {
  const term = q.trim();
  if (!term) return loadRecentSearches();
  const next = [term, ...loadRecentSearches().filter((s) => s.toLowerCase() !== term.toLowerCase())].slice(
    0,
    MAX
  );
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* noop */
  }
  return next;
}

export function removeRecentSearch(q: string): string[] {
  const next = loadRecentSearches().filter((s) => s !== q);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* noop */
  }
  return next;
}

export function clearRecentSearches() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
}

export const POPULAR_CHIPS = [
  "Эвент",
  "Мэдээ",
  "EDU",
  "АНД",
  "V-Club",
  "Сайн дурын",
  "Сургалт",
] as const;
