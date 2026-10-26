"use client";

import React, { useState, useEffect } from "react";
import { Link } from "@/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Clock, Globe, Star, Users, BookOpen, Heart, Zap,
  GraduationCap, CalendarDays, MapPin, Sparkles, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useSession } from "@/lib/hooks/useSession";
import PremiumPageShell from "@/app/components/PremiumPageShell";
import ProgramGlyph from "@/app/components/ui/ProgramGlyph";
import IOSLargeTitle from "@/app/components/ui/IOSLargeTitle";
import { programColorsByCode, PROGRAM_COLORS } from "@/lib/color-system";
import { springNative } from "@/lib/motion";
import { hapticSelection } from "@/lib/haptics";

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

function mapApiToProg(raw: unknown): Prog {
  const p = raw as {
    code?: string;
    slug?: string;
    color?: string;
    gradFrom?: string;
    gradTo?: string;
    name?: { mn?: string };
    description?: { mn?: string };
    href?: string;
    duration?: string;
    location?: string;
    slots?: number;
    tags?: string[];
    features?: Array<{ mn?: string; en?: string }>;
    why?: { mn?: string; en?: string };
  };
  const icons = [GraduationCap, BookOpen, Users, Star, Globe];
  const colors = programColorsByCode(p.code || p.slug || "");
  return {
    id: p.code || "PROG",
    color: p.color || colors.main,
    gradFrom: p.gradFrom || colors.gradFrom,
    gradTo: p.gradTo || colors.gradTo,
    iconBg: colors.soft,
    iconColor: p.color || colors.main,
    nameKey: p.name?.mn || p.code || "",
    descKey: p.description?.mn || "",
    href: p.href || `/programs/${p.slug}`,
    duration: p.duration || "",
    location: p.location || "",
    slots: p.slots || 0,
    tags: p.tags || [],
    features: (p.features || []).map((f, i) => ({
      I: icons[i % icons.length]!,
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

function ProgCard({ p, onTap, nt }: { p: Prog; onTap: () => void; nt: (k: string) => string }) {
  return (
    <button type="button" onClick={onTap} className="prog-glass-card press glass-press">
      <span
        className="prog-glass-card__icon"
        style={{ background: `linear-gradient(145deg, ${p.gradFrom}, ${p.gradTo})` }}
      >
        <ProgramGlyph id={p.id} size={22} />
      </span>
      <span className="prog-glass-card__body">
        <span className="prog-glass-card__code">{p.id}</span>
        <span className="prog-glass-card__title">{programTitle(p, nt)}</span>
        <span className="prog-glass-card__meta">
          {p.duration ? (
            <span><Clock size={12} strokeWidth={2} />{p.duration}</span>
          ) : null}
          {p.location ? (
            <span><MapPin size={12} strokeWidth={2} />{p.location}</span>
          ) : null}
        </span>
      </span>
      <ChevronRight size={16} strokeWidth={1.75} className="prog-glass-card__chev" />
    </button>
  );
}

function ProgDetail({ p, onBack, nt, signed }: { p: Prog; onBack: () => void; nt: (k: string) => string; signed: boolean }) {
  return (
    <motion.div
      key="detail"
      initial={{ x: 28 }}
      animate={{ x: 0 }}
      exit={{ x: 28 }}
      transition={springNative}
      className="prog-detail"
    >
      <button type="button" onClick={onBack} className="prog-detail__back press">
        <ChevronLeft size={20} strokeWidth={1.85} />
        <span>Хөтөлбөрүүд</span>
      </button>

      <div
        className="prog-detail__hero"
        style={{ background: `linear-gradient(145deg, ${p.gradFrom}, ${p.gradTo})` }}
      >
        <div className="prog-detail__hero-glow" aria-hidden />
        <div className="prog-detail__hero-icon">
          <ProgramGlyph id={p.id} size={44} />
        </div>
        <p className="prog-detail__code">{p.id}</p>
        <h2 className="prog-detail__title">{programTitle(p, nt)}</h2>
        <div className="prog-detail__chips">
          {p.duration ? <span className="prog-detail__chip"><Clock size={13} />{p.duration}</span> : null}
          {p.location ? <span className="prog-detail__chip"><MapPin size={13} />{p.location}</span> : null}
        </div>
      </div>

      <div className="ios-list prog-detail__list">
        <div className="prog-detail__block">
          <p className="ios-headline">Хөтөлбөрийн тухай</p>
          <p className="prog-detail__text">{programDesc(p, nt)}</p>
        </div>
        {p.features.length > 0 && (
          <div className="prog-detail__block prog-detail__block--sep">
            <p className="ios-headline">Юу хийх вэ?</p>
            <div className="prog-detail__features">
              {p.features.map((f, i) => (
                <div key={i} className="prog-detail__feature">
                  <span className="prog-detail__feature-icon" style={{ background: p.iconBg, color: p.iconColor }}>
                    <f.I size={14} strokeWidth={1.85} />
                  </span>
                  <span>{f.t}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {p.why ? (
          <div className="prog-detail__block prog-detail__block--sep">
            <p className="ios-headline">Яагаад нэгдэх вэ?</p>
            <p className="prog-detail__text">{p.why}</p>
          </div>
        ) : null}
      </div>

      <div className="prog-detail__cta">
        <Link
          href={signed ? `/programs/apply?p=${p.id}` : "/sign-in"}
          prefetch={signed}
          className="btn btn-primary auth-cta"
        >
          Нэгдэх
        </Link>
      </div>
    </motion.div>
  );
}

export default function ProgramsClient({ initialPrograms }: { initialPrograms?: unknown[] }) {
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
  const chipOptions = [
    { id: "all", label: "Бүгд" },
    ...programs.map((p) => {
      const title = programTitle(p, nt);
      // Keep chip short — prefer code for long volunteer org names
      const label = title.length <= 14 ? title : p.id;
      return { id: p.id, label };
    }),
  ];

  return (
    <PremiumPageShell className="ios26-page">
      <AnimatePresence mode="wait">
        {!sel ? (
          <motion.div
            key="list"
            initial={false}
            animate={{ opacity: 1 }}
            className="home-sections"
          >
            <IOSLargeTitle title="Хөтөлбөр">
              <p className="ios-subhead mt-1">Танд тохирох хөтөлбөрөө сонгоорой</p>
            </IOSLargeTitle>

            <div className="ios-filter-chips" role="tablist" aria-label="Хөтөлбөрийн шүүлт">
              {chipOptions.map((o) => {
                const on = filter === o.id;
                return (
                  <button
                    key={o.id}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    className={`ios-filter-chip press ${on ? "is-on" : ""}`}
                    onClick={() => {
                      void hapticSelection();
                      setFilter(o.id);
                    }}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>

            <div className="prog-glass-stack">
              {list.map((p) => (
                <ProgCard key={p.id} p={p} onTap={() => setSel(p)} nt={nt} />
              ))}
              {list.length === 0 && (
                <div className="ios-empty">
                  <p className="ios-empty__title">Хөтөлбөр олдсонгүй</p>
                  <p className="ios-empty__desc">Өөр шүүлт сонгоод үзнэ үү.</p>
                </div>
              )}
            </div>

            {!signed && (
              <div className="ios26-cta-banner">
                <p className="ios-headline">Нэгдэхэд бэлэн үү?</p>
                <p className="ios-subhead mt-1 mb-3">Бүртгүүлж хөтөлбөрт өргөдлөө гаргаарай</p>
                <Link href="/sign-up" className="btn btn-primary auth-cta inline-flex w-full items-center justify-center">
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
