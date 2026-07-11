/**
 * VCM premium color system — тод, ойлгомжтой модуль бүрийн өнгө.
 * Cream суурь дээр илүү тод, cool gemeer.
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

/** Үндсэн 4 модуль — нүүр хуудсын category card */
export const MODULE_COLORS: Record<ModuleId, ColorSwatch & { label: string; sub: string }> = {
  programs: {
    label: "Хөтөлбөр",
    sub: "EDU · АНД · V-Club",
    main: "#0B84E5",
    soft: "#E3F2FD",
    border: "#90CAF9",
    gradFrom: "#1A9AFF",
    gradTo: "#0668C8",
    onSoft: "#0668C8",
  },
  shop: {
    label: "Дэлгүүр",
    sub: "VCM бүтээгдэхүүн",
    main: "#E8910A",
    soft: "#FFF3E0",
    border: "#FFCC80",
    gradFrom: "#FFAA22",
    gradTo: "#C87808",
    onSoft: "#A86006",
  },
  lessons: {
    label: "Сургалт",
    sub: "LMS хичээл",
    main: "#0FA878",
    soft: "#E0F5EC",
    border: "#80DDB8",
    gradFrom: "#14C48E",
    gradTo: "#088A60",
    onSoft: "#067A52",
  },
  events: {
    label: "Арга хэмжээ",
    sub: "Бүртгэл, эвент",
    main: "#E8457A",
    soft: "#FDE8F0",
    border: "#F8A8C4",
    gradFrom: "#F05588",
    gradTo: "#C83068",
    onSoft: "#A82858",
  },
};

/** Хөтөлбөр бүрийн өнгө — EDU / АНД / V-Club */
export const PROGRAM_COLORS: Record<ProgramId, ColorSwatch & { emoji: string }> = {
  edu: {
    emoji: "🎓",
    main: "#0B84E5",
    soft: "#E3F2FD",
    border: "#90CAF9",
    gradFrom: "#1A9AFF",
    gradTo: "#0668C8",
    onSoft: "#0668C8",
  },
  and: {
    emoji: "🤝",
    main: "#0FA878",
    soft: "#E0F5EC",
    border: "#80DDB8",
    gradFrom: "#14C48E",
    gradTo: "#088A60",
    onSoft: "#067A52",
  },
  vclub: {
    emoji: "🌍",
    main: "#E8910A",
    soft: "#FFF3E0",
    border: "#FFCC80",
    gradFrom: "#FFAA22",
    gradTo: "#C87808",
    onSoft: "#A86006",
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

/** CSS gradient string for program headers / cards */
export function programGradient(code?: string): string {
  const c = programColorsByCode(code);
  return `linear-gradient(145deg, ${c.gradFrom}, ${c.gradTo})`;
}

export const BRAND_SURFACE = {
  bg: "#FBF8F3",
  bgElevated: "#FFFDFB",
  bgMuted: "#F3EEE6",
  bgTint: "#EEF4FA",
  border: "#E5DED4",
  text: "#142433",
  textSecondary: "#475F73",
  textTertiary: "#728596",
  primary: "#0B84E5",
  primarySoft: "#E3F2FD",
} as const;

/** 4 модулийн spectrum gradient (CSS) */
export const MODULE_SPECTRUM =
  "linear-gradient(90deg, #0B84E5 0%, #0FA878 33%, #E8910A 66%, #E8457A 100%)";
