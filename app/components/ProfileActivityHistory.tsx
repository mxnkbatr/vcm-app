"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Link } from "@/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  ShoppingBag,
  BookOpen,
  ClipboardList,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { programLabelMn, statusMeta } from "@/lib/applicationLabels";
import { isNativeApp } from "@/lib/native-perf";

type Tab = "all" | "programs" | "shop" | "courses";

type ActivityItem = {
  id: string;
  type: "program" | "shop" | "course" | "lesson";
  title: string;
  subtitle: string;
  date: string;
  statusLabel: string;
  statusColor: string;
  statusBg: string;
  href?: string;
  meta?: string;
  progress?: number;
};

function formatDate(d: string | Date | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("mn-MN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function purchaseStatus(status: string) {
  if (status === "completed") return { label: "Төлөгдсөн", color: "var(--emerald)", bg: "var(--emerald-dim)" };
  if (status === "pending") return { label: "Хүлээгдэж буй", color: "var(--orange)", bg: "var(--orange-dim)" };
  return { label: "Амжилтгүй", color: "var(--red)", bg: "var(--red-dim)" };
}

const TYPE_ICON = {
  program: GraduationCap,
  shop: ShoppingBag,
  course: BookOpen,
  lesson: Sparkles,
};

const TYPE_COLOR = {
  program: "var(--blue)",
  shop: "var(--orange)",
  course: "var(--emerald)",
  lesson: "var(--purple)",
};

export default function ProfileActivityHistory({
  applications,
  purchases,
  lmsEnrollments,
  enrolledLessons,
  activeProgram,
}: {
  applications: any[];
  purchases: any[];
  lmsEnrollments: any[];
  enrolledLessons: any[];
  activeProgram?: string | null;
}) {
  const [tab, setTab] = useState<Tab>("all");
  const [nativeApp, setNativeApp] = useState(false);

  useEffect(() => {
    setNativeApp(isNativeApp());
  }, []);

  const items = useMemo(() => {
    const list: ActivityItem[] = [];

    for (const app of applications) {
      const st = statusMeta(app.status);
      list.push({
        id: `app-${app._id}`,
        type: "program",
        title: programLabelMn(app.programId),
        subtitle: "Хөтөлбөрт өргөдөл",
        date: app.createdAt,
        statusLabel: st.mn,
        statusColor: st.color,
        statusBg: st.bg,
        href: "/programs",
      });
    }

    if (activeProgram && activeProgram !== "-") {
      list.push({
        id: "active-program",
        type: "program",
        title: programLabelMn(activeProgram),
        subtitle: "Идэвхтэй хөтөлбөр",
        date: new Date().toISOString(),
        statusLabel: "Идэвхтэй",
        statusColor: "var(--emerald)",
        statusBg: "var(--emerald-dim)",
        href: `/programs/${activeProgram.toLowerCase()}`,
      });
    }

    for (const p of purchases) {
      const item = typeof p.itemId === "object" ? p.itemId : null;
      const st = purchaseStatus(p.status);
      list.push({
        id: `purchase-${p._id}`,
        type: "shop",
        title: item?.name?.mn || item?.name?.en || "Бараа",
        subtitle: `${Number(p.amount || 0).toLocaleString()}₮ · ${p.paymentMethod || "QPay"}`,
        date: p.createdAt,
        statusLabel: st.label,
        statusColor: st.color,
        statusBg: st.bg,
        href: "/shop",
        meta: item?.category,
      });
    }

    for (const c of lmsEnrollments) {
      list.push({
        id: `lms-${c.courseId}`,
        type: "course",
        title: c.title?.mn || c.title?.en || "LMS курс",
        subtitle: `${c.completedLessons}/${c.totalLessons} хичээл`,
        date: c.enrolledAt,
        statusLabel: c.progressPct >= 100 ? "Дууссан" : "Суралцаж байна",
        statusColor: c.progressPct >= 100 ? "var(--emerald)" : "var(--blue)",
        statusBg: c.progressPct >= 100 ? "var(--emerald-dim)" : "var(--blue-dim)",
        href: c.slug ? `/lessons/${c.slug}` : "/lessons",
        progress: c.progressPct,
      });
    }

    for (const l of enrolledLessons) {
      list.push({
        id: `lesson-${l._id}`,
        type: "lesson",
        title: l.title?.mn || l.title?.en || "Сургалт",
        subtitle: l.category || "Volunteer lesson",
        date: l.createdAt,
        statusLabel: "Бүртгэлтэй",
        statusColor: "var(--purple)",
        statusBg: "var(--purple-dim)",
        href: "/lessons",
      });
    }

    return list.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [applications, purchases, lmsEnrollments, enrolledLessons, activeProgram]);

  const visibleItems = useMemo(() => {
    if (!nativeApp) return items;
    // App Store: no shop purchases or digital course access in the iOS app.
    return items.filter((i) => i.type === "program");
  }, [items, nativeApp]);

  const filtered = useMemo(() => {
    if (tab === "all") return visibleItems;
    if (tab === "programs") return visibleItems.filter((i) => i.type === "program");
    if (tab === "shop") return visibleItems.filter((i) => i.type === "shop");
    return visibleItems.filter((i) => i.type === "course" || i.type === "lesson");
  }, [visibleItems, tab]);

  const counts = {
    programs: visibleItems.filter((i) => i.type === "program").length,
    shop: visibleItems.filter((i) => i.type === "shop").length,
    courses: visibleItems.filter((i) => i.type === "course" || i.type === "lesson").length,
  };

  const TABS: { id: Tab; label: string }[] = nativeApp
    ? [
        { id: "all", label: "Бүгд" },
        { id: "programs", label: "Хөтөлбөр" },
      ]
    : [
        { id: "all", label: "Бүгд" },
        { id: "programs", label: "Хөтөлбөр" },
        { id: "shop", label: "Дэлгүүр" },
        { id: "courses", label: "Хичээл" },
      ];

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className={`grid gap-2 ${nativeApp ? "grid-cols-1" : "grid-cols-3"}`}>
        {(nativeApp
          ? [{ label: "Хөтөлбөр", value: counts.programs, color: "var(--blue)" }]
          : [
              { label: "Хөтөлбөр", value: counts.programs, color: "var(--blue)" },
              { label: "Захиалга", value: counts.shop, color: "var(--orange)" },
              { label: "Хичээл", value: counts.courses, color: "var(--emerald)" },
            ]
        ).map((s) => (
          <div key={s.label} className="liquid-card p-3 text-center">
            <p className="text-[22px] font-black" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider mt-0.5" style={{ color: "var(--label3)" }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="seg w-full flex overflow-x-auto no-scroll">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`seg-item flex-1 min-w-[72px] ${tab === t.id ? "on" : ""}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="space-y-3"
        >
          {filtered.length === 0 ? (
            <div className="liquid-card p-8 text-center">
              <p className="t-footnote" style={{ color: "var(--label3)" }}>
                {tab === "programs" && "Хөтөлбөрт өргөдөл өгөөгүй байна"}
                {tab === "shop" && "Захиалга байхгүй"}
                {tab === "courses" && "Хичээлд бүртгүүлээгүй байна"}
                {tab === "all" && "Түүх хоосон байна"}
              </p>
              <Link
                href={
                  nativeApp
                    ? "/programs"
                    : tab === "shop"
                      ? "/shop"
                      : tab === "courses"
                        ? "/lessons"
                        : "/programs"
                }
                className="btn btn-secondary btn-sm mt-4 inline-flex"
              >
                Эхлэх <ChevronRight size={14} />
              </Link>
            </div>
          ) : (
            filtered.map((item, i) => {
              const Icon = TYPE_ICON[item.type];
              const color = TYPE_COLOR[item.type];
              const inner = (
                <div className="liquid-card p-4 flex items-center gap-3 press">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${color}18`, color }}
                  >
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-bold truncate" style={{ color: "var(--label)" }}>
                      {item.title}
                    </p>
                    <p className="text-[12px] truncate mt-0.5" style={{ color: "var(--label2)" }}>
                      {item.subtitle}
                    </p>
                    <p className="text-[11px] mt-1" style={{ color: "var(--label3)" }}>
                      {formatDate(item.date)}
                    </p>
                    {typeof item.progress === "number" && item.progress > 0 && (
                      <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--fill2)" }}>
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${item.progress}%`, background: color }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap"
                      style={{ background: item.statusBg, color: item.statusColor }}
                    >
                      {item.statusLabel}
                    </span>
                    {item.href && <ChevronRight size={16} style={{ color: "var(--label3)" }} />}
                  </div>
                </div>
              );
              return item.href ? (
                <Link key={item.id} href={item.href} className="block">
                  {inner}
                </Link>
              ) : (
                <div key={item.id}>{inner}</div>
              );
            })
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
