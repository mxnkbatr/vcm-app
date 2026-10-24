"use client";

import React, { useState, useEffect } from "react";
import { Link } from "@/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Clock, Globe, CheckCircle2, Star, Users, BookOpen, Heart, Zap,
  GraduationCap, CalendarDays, MapPin, Sparkles, ChevronLeft,
} from "lucide-react";
import { useSession } from "@/lib/hooks/useSession";
import PremiumPageShell from "@/app/components/PremiumPageShell";
import ProgramGlyph from "@/app/components/ui/ProgramGlyph";
import IOSLargeTitle from "@/app/components/ui/IOSLargeTitle";
import IOSSegmented from "@/app/components/ui/IOSSegmented";
import { programColorsByCode, PROGRAM_COLORS } from "@/lib/color-system";
import { springNative } from "@/lib/motion";

const FALLBACK_PROGRAMS = [
  {
    id: "EDU",
    color: PROGRAM_COLORS.edu.main,
    gradFrom: PROGRAM_COLORS.edu.gradFrom,
    gradTo: PROGRAM_COLORS.edu.gradTo,
    iconBg: PROGRAM_COLORS.edu.soft,
    iconColor: PROGRAM_COLORS.edu.main,
    nameKey: "prog_edu",
    descKey: "prog_edu_desc",
    href: "/programs/edu",
    duration: "3–12 сар",
    location: "Монгол улс",
    slots: 8,
    tags: ["Сургалт", "Хэл заалт", "Залуучууд"],
    features: [
      { I: GraduationCap, t: "Дунд, ахлах сургуулиудад зааварлагч болох" },
      { I: BookOpen, t: "Хэл, урлаг, технологи чиглэлийн хичээл заах" },
      { I: Users, t: "Англи B1+ түвшин шаардлагатай" },
      { I: CalendarDays, t: "Уян хатан цагийн хуваарь" },
      { I: Star, t: "VCM-ийн бүрэн дэмжлэг, ментор" },
    ],
    why: "Монголын сургуулиудад мэдлэгийг дамжуулж, нийгмийн хөгжилд хувь нэмэр оруулах ховор боломж.",
  },
  {
    id: "AND",
    color: PROGRAM_COLORS.and.main,
    gradFrom: PROGRAM_COLORS.and.gradFrom,
    gradTo: PROGRAM_COLORS.and.gradTo,
    iconBg: PROGRAM_COLORS.and.soft,
    iconColor: PROGRAM_COLORS.and.main,
    nameKey: "prog_and",
    descKey: "prog_and_desc",
    href: "/programs/and",
    duration: "Уян хатан",
    location: "Улаанбаатар",
    slots: 12,
    tags: ["Тусгай хэрэгцээт", "Халамж", "Хамтын нийгэм"],
    features: [
      { I: Heart, t: "Тусгай хэрэгцээт хүүхдүүдэд сэтгэл зүйн дэмжлэг" },
      { I: Users, t: "Гэр бүлд нийгмийн идэвхтэй туслалцаа" },
      { I: CalendarDays, t: "7 хоногт 2–3 удаа уулзах" },
      { I: MapPin, t: "UB дахь хамтрагч байгууллагуудтай" },
      { I: Star, t: "Урьдчилсан сургалт ба удирдамж" },
    ],
    why: "Нийгмийн хамгийн эмзэг бүлэгт биечлэн туслах, тэдний гэр бүлд баяр баясгалан бэлэглэх.",
  },
  {
    id: "VCLUB",
    color: PROGRAM_COLORS.vclub.main,
    gradFrom: PROGRAM_COLORS.vclub.gradFrom,
    gradTo: PROGRAM_COLORS.vclub.gradTo,
    iconBg: PROGRAM_COLORS.vclub.soft,
    iconColor: PROGRAM_COLORS.vclub.main,
    nameKey: "prog_vclub",
    descKey: "prog_vclub_desc",
    href: "/programs/vclub",
    duration: "Арга хэмжээгээр",
    location: "Монгол улс",
    slots: 20,
    tags: ["Арга хэмжээ", "Сүлжээ", "Манлайлал"],
    features: [
      { I: Zap, t: "Олон нийтийн арга хэмжээнд оролцох" },
      { I: Users, t: "Олон улсын гишүүдийн сүлжээнд нэгдэх" },
      { I: Star, t: "Манлайлал, ур чадвар хөгжүүлэх" },
      { I: Globe, t: "Дэлхийн сайн дурынхантай холбогдох" },
      { I: Sparkles, t: "Нийгмийн томоохон санаачилгуудад нэгдэх" },
    ],
    why: "V-Club бол хувь хүний өсөлт, дэлхийн холбоо тогтоох, нийгмийн томоохон өөрчлөлтийн нэг хэсэг болох газар юм.",
  },
];

type Prog = (typeof FALLBACK_PROGRAMS)[0];

function mapApiToProg(p: any): Prog {
  const icons = [GraduationCap, BookOpen, Users, Star, Globe];
  const colors = programColorsByCode(p.code || p.slug);
  return {
    id: p.code,
    color: p.color || colors.main,
    gradFrom: p.gradFrom || colors.gradFrom,
    gradTo: p.gradTo || colors.gradTo,
    iconBg: colors.soft,
    iconColor: p.color || colors.main,
    nameKey: p.name?.mn || p.code,
    descKey: p.description?.mn || "",
    href: p.href || `/programs/${p.slug}`,
    duration: p.duration || "",
    location: p.location || "",
    slots: p.slots || 0,
    tags: p.tags || [],
    features: (p.features || []).map((f: any, i: number) => ({
      I: icons[i % icons.length],
      t: f.mn || f.en || "",
    })),
    why: p.why?.mn || p.why?.en || "",
  };
}

function programTitle(p: Prog, nt: (k: string) => string) {
  return p.nameKey.startsWith("prog_") ? nt(p.nameKey) : p.nameKey;
}
function programDesc(p: Prog, nt: (k: string) => string) {
  return p.descKey.startsWith("prog_") ? nt(p.descKey) : p.descKey;
}

function ProgCard({ p, onTap, nt }: { p: Prog; onTap: () => void; nt: any }) {
  return (
    <motion.button
      type="button"
      onClick={onTap}
      whileTap={{ scale: 0.97 }}
      transition={springNative}
      className="w-full text-left overflow-hidden rounded-[20px] bg-[var(--card)] border-[0.5px] border-[var(--sep)]"
    >
      <div className="relative h-36" style={{ background: `linear-gradient(145deg, ${p.gradFrom}, ${p.gradTo})` }}>
        <div className="absolute inset-0 flex items-center justify-center text-white/90">
          <ProgramGlyph id={p.id} size={48} />
        </div>
        <div className="absolute bottom-3 left-4 right-4 text-white">
          <p className="text-[12px] font-semibold uppercase tracking-wide opacity-80">{p.id}</p>
          <p className="text-[20px] font-bold leading-tight">{programTitle(p, nt)}</p>
        </div>
      </div>
      <div className="px-4 py-3 flex items-center gap-3 ios-footnote">
        <span className="inline-flex items-center gap-1"><Clock size={14} strokeWidth={1.75} />{p.duration}</span>
        <span className="inline-flex items-center gap-1"><MapPin size={14} strokeWidth={1.75} />{p.location}</span>
      </div>
    </motion.button>
  );
}

function ProgDetail({ p, onBack, nt, signed }: { p: Prog; onBack: () => void; nt: any; signed: boolean }) {
  return (
    <motion.div
      key="detail"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={springNative}
      className="space-y-4 pb-28"
    >
      <button type="button" onClick={onBack} className="inline-flex items-center gap-1 min-h-[44px] press" style={{ color: "var(--blue)" }}>
        <ChevronLeft size={20} strokeWidth={1.75} />
        <span className="ios-headline">Хөтөлбөрүүд</span>
      </button>

      <div className="relative overflow-hidden rounded-[28px] h-52" style={{ background: `linear-gradient(145deg, ${p.gradFrom}, ${p.gradTo})` }}>
        <div className="absolute inset-0 flex items-center justify-center text-white/90">
          <ProgramGlyph id={p.id} size={56} />
        </div>
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <p className="text-[13px] font-semibold uppercase opacity-80">{p.id}</p>
          <h2 className="text-[28px] font-bold leading-tight">{programTitle(p, nt)}</h2>
        </div>
      </div>

      <div className="ios-list">
        <div className="px-4 py-3">
          <p className="ios-headline mb-2">Хөтөлбөрийн тухай</p>
          <p className="ios-body" style={{ color: "var(--label2)", fontSize: 15 }}>{programDesc(p, nt)}</p>
        </div>
        <div className="px-4 py-3" style={{ borderTop: "0.5px solid var(--sep)" }}>
          <p className="ios-headline mb-3">Юу хийх вэ?</p>
          <div className="space-y-3">
            {p.features.map((f, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0" style={{ background: p.iconBg, color: p.iconColor }}>
                  <f.I size={14} strokeWidth={1.75} />
                </div>
                <span className="ios-body" style={{ fontSize: 15, color: "var(--label2)" }}>{f.t}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="px-4 py-3" style={{ borderTop: "0.5px solid var(--sep)" }}>
          <p className="ios-headline mb-2">Яагаад нэгдэх вэ?</p>
          <p className="ios-body" style={{ color: "var(--label2)", fontSize: 15 }}>{p.why}</p>
        </div>
      </div>

      <div className="ios-sticky-cta">
        <Link href={signed ? `/programs/apply?p=${p.id}` : "/register"} prefetch={signed} className="btn btn-primary inline-flex items-center justify-center">
          Нэгдэх
        </Link>
      </div>
    </motion.div>
  );
}

export default function ProgramsClient({ initialPrograms }: { initialPrograms?: any[] }) {
  const nt = useTranslations("navbar");
  const { status } = useSession();
  const signed = status === "authenticated";
  const [sel, setSel] = useState<Prog | null>(null);
  const [filter, setFilter] = useState("all");
  const [programs, setPrograms] = useState<Prog[]>(() =>
    initialPrograms?.length ? initialPrograms.map(mapApiToProg) : FALLBACK_PROGRAMS
  );

  useEffect(() => {
    if (initialPrograms?.length) return;
    fetch("/api/programs")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setPrograms(data.map(mapApiToProg));
      })
      .catch(() => {});
  }, [initialPrograms]);

  const list = filter === "all" ? programs : programs.filter((p) => p.id === filter);
  const segOptions = [
    { id: "all", label: "Бүгд" },
    ...programs.map((p) => ({ id: p.id, label: p.id })),
  ];

  return (
    <PremiumPageShell>
      <AnimatePresence mode="wait">
        {!sel ? (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <IOSLargeTitle title="Хөтөлбөрүүд" />
            <IOSSegmented options={segOptions} value={filter} onChange={setFilter} />
            <div className="space-y-3">
              {list.map((p) => (
                <ProgCard key={p.id} p={p} onTap={() => setSel(p)} nt={nt} />
              ))}
            </div>
            {!signed && (
              <div className="ios-list p-4">
                <p className="ios-headline">Нэгдэхэд бэлэн үү?</p>
                <p className="ios-footnote mt-1 mb-3">Бүртгүүлж хөтөлбөрт өргөдлөө гаргаарай</p>
                <Link href="/register" className="btn btn-primary inline-flex w-full items-center justify-center">
                  Эхлэх
                </Link>
              </div>
            )}
          </motion.div>
        ) : (
          <ProgDetail key="detail" p={sel} onBack={() => setSel(null)} nt={nt} signed={signed} />
        )}
      </AnimatePresence>
    </PremiumPageShell>
  );
}
