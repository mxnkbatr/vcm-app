/** Canonical short labels — keep AND/АНД and VCLUB/V-Club consistent in UI. */

const SHORT: Record<string, { mn: string; en: string }> = {
  edu: { mn: "EDU", en: "EDU" },
  and: { mn: "АНД", en: "AND" },
  vclub: { mn: "V-Club", en: "V-Club" },
};

export function programSlugKey(raw?: string | null): "edu" | "and" | "vclub" {
  const s = String(raw || "").toLowerCase().trim();
  if (s.includes("анд") || s === "and" || /(^|[^a-z])and([^a-z]|$)/.test(s)) return "and";
  if (s.includes("v-club") || s.includes("vclub") || s.includes("v club")) return "vclub";
  const ascii = s.replace(/[^a-z0-9]/g, "");
  if (ascii === "and") return "and";
  if (ascii === "vclub" || ascii === "vclubs") return "vclub";
  if (ascii === "edu") return "edu";
  return "edu";
}

export function programShortLabel(
  codeOrSlug: string | null | undefined,
  locale: string = "mn"
): string {
  const key = programSlugKey(codeOrSlug);
  const pair = SHORT[key];
  return locale === "en" ? pair.en : pair.mn;
}

/** Normalize free-form API names that mix AND / АНД / VCLUB / V-CLUB. */
export function normalizeProgramDisplayName(
  name: string | undefined,
  codeOrSlug?: string,
  locale: string = "mn"
): string {
  if (codeOrSlug) {
    const key = programSlugKey(codeOrSlug);
    const short = programShortLabel(key, locale);
    if (!name) return short;
    const lower = name.toLowerCase();
    if (
      lower.includes("and") ||
      lower.includes("анд") ||
      lower.includes("vclub") ||
      lower.includes("v-club") ||
      lower.includes("edu")
    ) {
      return short;
    }
  }
  if (!name) return programShortLabel("edu", locale);
  return name
    .replace(/\bAND\b/gi, locale === "mn" ? "АНД" : "AND")
    .replace(/\bАНД\b/g, locale === "mn" ? "АНД" : "AND")
    .replace(/\bV[\s-]?CLUB\b/gi, "V-Club")
    .replace(/\bVCLUB\b/gi, "V-Club");
}
