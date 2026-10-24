/**
 * VCM iOS color system — brand blue accents on system backgrounds.
 */

export type ModuleId = "programs" | "shop" | "lessons" | "events";
export type ProgramId = "edu" | "and" | "vclub";

export type ColorSwatch = {
  main: string;
  soft: string;
  border: string;
  gradFrom: string;
  gradTo: string;
  onSoft: string;
};

const BLUE = "#1E5BD8";
const SOFT = "#E8EEFB";
const BORDER = "rgba(60, 60, 67, 0.12)";

export const MODULE_COLORS: Record<ModuleId, ColorSwatch & { label: string; sub: string }> = {
  programs: {
    label: "Хөтөлбөр",
    sub: "EDU · АНД · V-Club",
    main: BLUE,
    soft: SOFT,
    border: BORDER,
    gradFrom: BLUE,
    gradTo: "#1848A8",
    onSoft: BLUE,
  },
  shop: {
    label: "Дэлгүүр",
    sub: "VCM бүтээгдэхүүн",
    main: BLUE,
    soft: SOFT,
    border: BORDER,
    gradFrom: BLUE,
    gradTo: "#1848A8",
    onSoft: BLUE,
  },
  lessons: {
    label: "Сургалт",
    sub: "LMS хичээл",
    main: BLUE,
    soft: SOFT,
    border: BORDER,
    gradFrom: BLUE,
    gradTo: "#1848A8",
    onSoft: BLUE,
  },
  events: {
    label: "Арга хэмжээ",
    sub: "Бүртгэл, эвент",
    main: BLUE,
    soft: SOFT,
    border: BORDER,
    gradFrom: BLUE,
    gradTo: "#1848A8",
    onSoft: BLUE,
  },
};

export const PROGRAM_COLORS: Record<ProgramId, ColorSwatch & { emoji: string }> = {
  edu: {
    emoji: "🎓",
    main: BLUE,
    soft: SOFT,
    border: BORDER,
    gradFrom: BLUE,
    gradTo: "#1848A8",
    onSoft: BLUE,
  },
  and: {
    emoji: "🤝",
    main: BLUE,
    soft: SOFT,
    border: BORDER,
    gradFrom: BLUE,
    gradTo: "#1848A8",
    onSoft: BLUE,
  },
  vclub: {
    emoji: "🌍",
    main: BLUE,
    soft: SOFT,
    border: BORDER,
    gradFrom: BLUE,
    gradTo: "#1848A8",
    onSoft: BLUE,
  },
};

export function programColorsByCode(code?: string): ColorSwatch {
  const key = (code || "").toLowerCase() as ProgramId;
  if (key in PROGRAM_COLORS) return PROGRAM_COLORS[key];
  return PROGRAM_COLORS.edu;
}

export function programColorsBySlug(slug?: string): ColorSwatch {
  return programColorsByCode(slug);
}

export function programGradient(code?: string): string {
  const c = programColorsByCode(code);
  return `linear-gradient(145deg, ${c.gradFrom}, ${c.gradTo})`;
}

export const BRAND_SURFACE = {
  bg: "#F2F2F7",
  bgElevated: "#FFFFFF",
  bgMuted: "#E5E5EA",
  bgTint: "#E8EEFB",
  border: "rgba(60, 60, 67, 0.12)",
  text: "#000000",
  textSecondary: "rgba(60, 60, 67, 0.6)",
  textTertiary: "rgba(60, 60, 67, 0.6)",
  primary: BLUE,
  primarySoft: SOFT,
} as const;

export const MODULE_SPECTRUM = "none";
