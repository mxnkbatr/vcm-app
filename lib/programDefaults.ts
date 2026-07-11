import Program from "@/lib/models/Program";
import { defaultQuestionsForCode } from "@/lib/programQuestions";
import { PROGRAM_COLORS } from "@/lib/color-system";

export const DEFAULT_PROGRAMS = [
  {
    code: "EDU",
    slug: "edu",
    emoji: "🎓",
    color: PROGRAM_COLORS.edu.main,
    gradFrom: PROGRAM_COLORS.edu.gradFrom,
    gradTo: PROGRAM_COLORS.edu.gradTo,
    name: { mn: "EDU Хөтөлбөр", en: "EDU Program", de: "EDU Programm" },
    description: {
      mn: "Сургуульд заалт, хэл заалт",
      en: "School tutoring and language teaching",
      de: "Schulunterricht und Sprachunterricht",
    },
    why: {
      mn: "Монголын сургуулиудад мэдлэгийг дамжуулж, нийгмийн хөгжилд хувь нэмэр оруулах.",
      en: "Share knowledge in Mongolian schools and contribute to social development.",
      de: "Wissen in mongolischen Schulen teilen.",
    },
    href: "/programs/edu",
    duration: "3–12 сар",
    location: "Монгол улс",
    slots: 8,
    tags: ["Сургалт", "Хэл заалт", "Залуучууд"],
    features: [
      { mn: "Дунд, ахлах сургуулиудад зааварлагч болох", en: "Tutor in secondary schools" },
      { mn: "Англи B1+ түвшин шаардлагатай", en: "English B1+ required" },
    ],
    order: 1,
    active: true,
    applicationQuestions: defaultQuestionsForCode("EDU"),
  },
  {
    code: "AND",
    slug: "and",
    emoji: "🤝",
    color: PROGRAM_COLORS.and.main,
    gradFrom: PROGRAM_COLORS.and.gradFrom,
    gradTo: PROGRAM_COLORS.and.gradTo,
    name: { mn: "АНД Хөтөлбөр", en: "AND Program", de: "AND Programm" },
    description: {
      mn: "Тусгай хэрэгцээт хүүхдүүдэд туслалцаа",
      en: "Support for children with special needs",
      de: "Unterstützung für Kinder mit besonderen Bedürfnissen",
    },
    why: {
      mn: "Нийгмийн хамгийн эмзэг бүлэгт биечлэн туслах.",
      en: "Provide hands-on support to vulnerable groups.",
      de: "Persönliche Unterstützung für vulnerable Gruppen.",
    },
    href: "/programs/and",
    duration: "Уян хатан",
    location: "Улаанбаатар",
    slots: 12,
    tags: ["Тусгай хэрэгцээт", "Халамж"],
    features: [
      { mn: "Тусгай хэрэгцээт хүүхдүүдэд сэтгэл зүйн дэмжлэг", en: "Psychological support for children" },
    ],
    order: 2,
    active: true,
    applicationQuestions: defaultQuestionsForCode("AND"),
  },
  {
    code: "VCLUB",
    slug: "vclub",
    emoji: "🌍",
    color: PROGRAM_COLORS.vclub.main,
    gradFrom: PROGRAM_COLORS.vclub.gradFrom,
    gradTo: PROGRAM_COLORS.vclub.gradTo,
    name: { mn: "V-Club", en: "V-Club", de: "V-Club" },
    description: {
      mn: "Олон улсын сүлжээ, арга хэмжээ",
      en: "International network and events",
      de: "Internationales Netzwerk und Veranstaltungen",
    },
    why: {
      mn: "Дэлхийн сайн дурынхантай холбогдох, манлайлал хөгжүүлэх.",
      en: "Connect with global volunteers and grow leadership.",
      de: "Mit globalen Freiwilligen vernetzen.",
    },
    href: "/programs/vclub",
    duration: "Арга хэмжээгээр",
    location: "Монгол улс",
    slots: 20,
    tags: ["Арга хэмжээ", "Сүлжээ", "Манлайлал"],
    features: [
      { mn: "Олон нийтийн арга хэмжээнд оролцох", en: "Join community events" },
    ],
    order: 3,
    active: true,
    applicationQuestions: defaultQuestionsForCode("VCLUB"),
  },
];

export async function ensureDefaultPrograms() {
  const count = await Program.countDocuments();
  if (count === 0) {
    await Program.insertMany(DEFAULT_PROGRAMS);
    return;
  }

  const programs = await Program.find({
    $or: [
      { applicationQuestions: { $exists: false } },
      { applicationQuestions: { $size: 0 } },
    ],
  });

  for (const program of programs) {
    program.applicationQuestions = defaultQuestionsForCode(program.code);
    await program.save();
  }
}
