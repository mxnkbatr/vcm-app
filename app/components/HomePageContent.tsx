"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useSession } from "@/lib/hooks/useSession";
import { Link } from "@/navigation";
import {
  ChevronRight,
  Sparkles,
  GraduationCap,
  Heart,
  Calendar,
  Users,
  ShoppingBag,
  BookOpen,
  Ticket,
} from "lucide-react";

import LazySection from "./LazySection";
import BannerSlider from "./BannerSlider";

const EventsSection = dynamic(() => import("./Events"), { ssr: false });
const ShopClient = dynamic(() => import("@/app/[locale]/shop/ShopClient"), { ssr: false });

const QUICK_ACTIONS_FALLBACK = [
  { id: "edu", emoji: "🎓", label: "EDU Хөтөлбөр", sub: "Сургуульд заалт", href: "/programs/edu", from: "#0ea5e9", to: "#3b82f6" },
  { id: "and", emoji: "🤝", label: "АНД Хөтөлбөр", sub: "Нийгмийн халамж", href: "/programs/and", from: "#10b981", to: "#0d9488" },
  { id: "vclub", emoji: "🌍", label: "V-Club", sub: "Олон улсын сүлжээ", href: "/programs/vclub", from: "#f59e0b", to: "#f97316" },
];

export default function HomePageContent({
  shopItems,
  initialBanners,
  initialPrograms,
  locale,
}: {
  shopItems?: any[];
  initialBanners?: any[];
  initialPrograms?: any[];
  locale?: string;
}) {
  const mapPrograms = (data: any[]) =>
    data.map((p: any) => ({
      id: p.slug || p.code?.toLowerCase(),
      emoji: p.emoji || "🌍",
      label: p.name?.mn || p.code,
      sub: p.description?.mn || "",
      href: p.href || `/programs/${p.slug || p.code?.toLowerCase()}`,
      from: p.gradFrom || p.color,
      to: p.gradTo || p.color,
    }));

  const [items] = useState<any[]>(shopItems || []);
  const [quickActions] = useState(() =>
    initialPrograms?.length ? mapPrograms(initialPrograms) : QUICK_ACTIONS_FALLBACK
  );
  const [mounted, setMounted] = useState(false);
  const { status } = useSession();
  const isSignedIn = mounted && status === "authenticated";

  useEffect(() => { setMounted(true); }, []);

  const categories = useMemo(() => ([
    {
      href: "/programs",
      icon: Users,
      title: "Community & Clubs",
      sub: "ADU · V Club · гишүүнчлэл",
      tone: "#0B7DD6",
      bg: "linear-gradient(145deg, #E8F4FC, #D6EBFA)",
    },
    {
      href: "/shop",
      icon: ShoppingBag,
      title: "E-commerce (Shop)",
      sub: "Мерч бүтээгдэхүүн",
      tone: "#C8842A",
      bg: "linear-gradient(145deg, #FBF0E0, #F5E6D0)",
    },
    {
      href: "/lessons",
      icon: BookOpen,
      title: "LMS (Education)",
      sub: "Курс · видео хичээл",
      tone: "#2A9D6E",
      bg: "linear-gradient(145deg, #E5F7EF, #D4F0E4)",
    },
    {
      href: "/events",
      icon: Ticket,
      title: "Events & Registration",
      sub: "Бүртгэл · тасалбар",
      tone: "#C45C7A",
      bg: "linear-gradient(145deg, #FBE8EE, #F5D8E2)",
    },
  ]), []);

  return (
    <div
      className="min-h-dvh relative"
      style={{
        paddingBottom: "calc(env(safe-area-inset-bottom, 34px) + 100px)",
      }}
    >
      {/* top nav spacer (floating liquid chrome) */}
      <div style={{ height: "calc(72px + env(safe-area-inset-top))" }} />

      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <BannerSlider locale={locale || "mn"} initialBanners={initialBanners} />
      </motion.div>

      {/* Categories (Community/Shop/LMS/Events) */}
      <motion.section
        className="mt-8 px-5"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.10, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mb-4">
          <h2 className="t-title3" style={{ color: "var(--label)" }}>Үндсэн хэсгүүд</h2>
          <p className="t-footnote mt-0.5">Системийн 4 том модуль</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {categories.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="press liquid-card flex flex-col items-center text-center p-5 relative overflow-hidden"
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 relative z-10"
                style={{ background: c.bg, color: c.tone, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4)" }}
              >
                <c.icon size={26} strokeWidth={2} />
              </div>
              <div className="relative z-10">
                <p className="text-[14px] font-bold leading-tight mb-1" style={{ color: "var(--label)" }}>
                  {c.title}
                </p>
                <p className="text-[11px] font-medium" style={{ color: "var(--label2)" }}>
                  {c.sub}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </motion.section>

      {/* Programs */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14, duration: 0.4 }}
        className="mt-8"
      >
        <div className="px-5 mb-4">
          <h2 className="t-title3" style={{ color: "var(--label)" }}>Санал болгож буй</h2>
          <p className="t-footnote mt-0.5">Онцлох хөтөлбөрүүд</p>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scroll px-5 pb-2">
          {quickActions.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.18 + i * 0.07 }}
            >
              <Link
                href={a.href}
                className="flex-shrink-0 press block overflow-hidden liquid-card"
                style={{ width: 148 }}
              >
                <div className="p-4 h-[130px] flex flex-col items-center justify-center text-center relative">
                  <span className="text-[40px] mb-2">{a.emoji}</span>
                  <div>
                    <p className="font-bold text-[13px] leading-tight" style={{ color: "var(--label)" }}>{a.label}</p>
                    <p className="text-[11px] font-medium mt-1" style={{ color: "var(--label2)" }}>{a.sub}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.39 }}>
            <Link
              href="/apply"
              className="flex-shrink-0 press block liquid-card overflow-hidden"
              style={{
                width: 148,
                height: 130,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                background: "linear-gradient(145deg, #4DA8E8, #0B7DD6)",
                border: "0.5px solid rgba(255,255,255,0.35)",
              }}
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.2)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35)" }}>
                <Sparkles size={22} color="white" />
              </div>
              <p className="text-white font-bold text-[13px] mt-1">Өргөдөл</p>
              <p className="text-white/70 text-[11px] font-medium">Нэгд →</p>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Sign up (guest only) */}
      {(!mounted || !isSignedIn) && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }} className="mx-5 mt-6">
          <div
            className="overflow-hidden press liquid-card"
            style={{
              padding: "24px 20px",
              position: "relative",
              background: "linear-gradient(135deg, #4DA8E8 0%, #0B7DD6 55%, #1A4B8C 100%)",
              border: "0.5px solid rgba(255,255,255,0.35)",
            }}
          >
            <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
            <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-white/80 text-[12px] font-bold uppercase tracking-wider mb-1">Шинэ гишүүн</p>
                <p className="text-white font-black text-[20px] leading-snug">Сайн дурын<br />бүлэгт нэгд</p>
              </div>
              <Link
                href="/register"
                className="flex-shrink-0 press bg-white hover:bg-slate-50 text-sky-600 px-5 py-3 rounded-full font-bold text-[14px] transition-colors"
              >
                Бүртгүүлэх
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* Events */}
      <LazySection placeholder={
        <div className="mt-8">
          <div className="flex gap-3 px-5">
            {[1,2,3].map(i => <div key={i} className="flex-shrink-0 rounded-3xl animate-pulse" style={{ width: 190, height: 250, background: "var(--fill2)" }} />)}
          </div>
        </div>
      }>
        <section className="mt-8">
          <div className="flex items-center justify-between px-5 mb-4">
            <div>
              <h2 className="text-[22px] font-bold text-slate-900 tracking-tight">Арга хэмжээ</h2>
              <p className="text-[13px] font-medium text-slate-500 mt-0.5">Ойрын үйл явдлууд</p>
            </div>
            <Link
              href="/events"
              className="flex items-center gap-1 press text-[13px] font-bold px-4 py-2 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              Бүгд <ChevronRight size={14} />
            </Link>
          </div>
          <div className="flex overflow-x-auto gap-3 px-5 pb-3 no-scroll">
            <EventsSection isHorizontal compact defaultTab="events" />
          </div>
        </section>
      </LazySection>

      {/* Shop */}
      {items.length > 0 && locale && (
        <LazySection placeholder={
          <div className="mt-8">
            <div className="flex gap-3 px-5">
              {[1,2,3].map(i => <div key={i} className="flex-shrink-0 rounded-3xl animate-pulse" style={{ width: 164, height: 220, background: "var(--fill2)" }} />)}
            </div>
          </div>
        }>
          <section className="mt-8">
            <div className="flex items-center justify-between px-5 mb-4">
              <div>
                <h2 className="text-[22px] font-bold text-slate-900 tracking-tight">Дэлгүүр</h2>
                <p className="text-[13px] font-medium text-slate-500 mt-0.5">VCM бүтээгдэхүүн</p>
              </div>
              <Link
                href="/shop"
                className="flex items-center gap-1 press text-[13px] font-bold px-4 py-2 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              >
                Бүгд <ChevronRight size={14} />
              </Link>
            </div>
            <div className="flex overflow-x-auto gap-3 px-5 pb-3 no-scroll">
              <ShopClient items={items} locale={locale} isHorizontal />
            </div>
          </section>
        </LazySection>
      )}
    </div>
  );
}

