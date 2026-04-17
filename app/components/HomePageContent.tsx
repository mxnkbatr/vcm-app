"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
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

const QUICK_ACTIONS = [
  { id: "edu", emoji: "🎓", label: "EDU Хөтөлбөр", sub: "Сургуульд заалт", href: "/programs/edu", from: "#0ea5e9", to: "#3b82f6" },
  { id: "and", emoji: "🤝", label: "АНД Хөтөлбөр", sub: "Нийгмийн халамж", href: "/programs/and", from: "#10b981", to: "#0d9488" },
  { id: "vclub", emoji: "🌍", label: "V-Club", sub: "Олон улсын сүлжээ", href: "/programs/vclub", from: "#f59e0b", to: "#f97316" },
];

export default function HomePageContent({ shopItems, locale }: { shopItems?: any[]; locale?: string }) {
  const [items, setItems] = useState<any[]>(shopItems || []);
  const [mounted, setMounted] = useState(false);
  const { status, data: session } = useSession();
  const isSignedIn = mounted && status === "authenticated";
  const firstName = (session?.user as any)?.name?.split(" ")?.[0];

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!shopItems || shopItems.length === 0) {
      fetch("/api/shopping")
        .then((res) => res.json())
        .then((data) => { if (Array.isArray(data)) setItems(data.slice(0, 8)); })
        .catch(() => {});
    }
  }, [shopItems]);

  const categories = useMemo(() => ([
    {
      href: "/programs",
      icon: Users,
      title: "Community & Clubs",
      sub: "ADU · V Club · гишүүнчлэл",
      tone: "var(--blue)",
      bg: "var(--blue-dim)",
    },
    {
      href: "/shop",
      icon: ShoppingBag,
      title: "E-commerce (Shop)",
      sub: "Мерч бүтээгдэхүүн",
      tone: "var(--orange)",
      bg: "var(--orange-dim)",
    },
    {
      href: "/lessons",
      icon: BookOpen,
      title: "LMS (Education)",
      sub: "Курс · видео хичээл",
      tone: "var(--emerald)",
      bg: "var(--emerald-dim)",
    },
    {
      href: "/events",
      icon: Ticket,
      title: "Events & Registration",
      sub: "Бүртгэл · тасалбар",
      tone: "var(--red)",
      bg: "var(--red-dim)",
    },
  ]), []);

  return (
    <div
      className="min-h-dvh"
      style={{
        background: "var(--bg)",
        paddingBottom: "calc(env(safe-area-inset-bottom, 34px) + 80px)",
      }}
    >
      {/* top nav spacer (MobileChrome 56px) */}
      <div style={{ height: "calc(56px + env(safe-area-inset-top))" }} />

      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <BannerSlider />
      </motion.div>

      {/* Home header */}
      <div className="px-5 mt-6">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--label3)" }}>
              Volunteer Center Mongolia
            </p>
            <h1
              className="text-[32px] font-bold tracking-tight leading-none"
              style={{ color: "var(--label)" }}
              suppressHydrationWarning
            >
              {mounted ? (isSignedIn ? `Сайн уу, ${firstName || "найз"}` : "Нүүр") : "Нүүр"}
            </h1>
          </div>

          <Link
            href="/dashboard"
            className="btn btn-ghost btn-sm shrink-0 press"
          >
            Миний <ChevronRight size={14} strokeWidth={3} />
          </Link>
        </div>
      </div>

      {/* Categories (Community/Shop/LMS/Events) */}
      <motion.section
        className="mt-8 px-5"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.10, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mb-4">
          <h2 className="text-[22px] font-bold text-slate-900 tracking-tight">Үндсэн хэсгүүд</h2>
          <p className="text-[13px] font-medium text-slate-500 mt-0.5">Системийн 4 том модуль</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {categories.map((c, idx) => (
            <Link
              key={c.href}
              href={c.href}
              className="press flex flex-col items-center text-center p-5 relative overflow-hidden bg-white rounded-[24px] shadow-sm border border-slate-100"
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 relative z-10"
                style={{ background: c.bg, color: c.tone }}
              >
                <c.icon size={26} strokeWidth={2} />
              </div>
              <div className="relative z-10">
                <p className="text-[14px] font-bold leading-tight mb-1 text-slate-900">
                  {c.title}
                </p>
                <p className="text-[11px] font-medium text-slate-500">
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
          <h2 className="text-[22px] font-bold text-slate-900 tracking-tight">Санал болгож буй</h2>
          <p className="text-[13px] font-medium text-slate-500 mt-0.5">Онцлох хөтөлбөрүүд</p>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scroll px-5 pb-2">
          {QUICK_ACTIONS.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.18 + i * 0.07 }}
            >
              <Link
                href={a.href}
                className="flex-shrink-0 press block overflow-hidden bg-white rounded-[24px] shadow-sm border border-slate-100"
                style={{ width: 140 }}
              >
                <div className="p-4 h-[130px] flex flex-col items-center justify-center text-center relative">
                  <span className="text-[40px] mb-2">{a.emoji}</span>
                  <div>
                    <p className="text-slate-900 font-bold text-[13px] leading-tight">{a.label}</p>
                    <p className="text-slate-500 text-[11px] font-medium mt-1">{a.sub}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.39 }}>
            <Link
              href="/apply"
              className="flex-shrink-0 press block bg-slate-900 rounded-[24px] shadow-sm"
              style={{
                width: 140,
                height: 130,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <div className="w-12 h-12 rounded-2xl bg-sky-500 flex items-center justify-center shadow-lg shadow-sky-500/30">
                <Sparkles size={22} color="white" />
              </div>
              <p className="text-white font-bold text-[13px] mt-1">Өргөдөл</p>
              <p className="text-slate-400 text-[11px] font-medium">Нэгд →</p>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Sign up (guest only) */}
      {(!mounted || !isSignedIn) && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }} className="mx-5 mt-6">
          <div
            className="overflow-hidden press"
            style={{
              borderRadius: "var(--r-3xl)",
              background: "linear-gradient(135deg, #0EA5E9, #3b82f6)",
              padding: "24px 20px",
              position: "relative",
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

      {/* Mission */}
      <LazySection placeholder={null}>
        <section className="mt-8 mx-5 pb-2">
          <div
            className="press overflow-hidden relative bg-white rounded-[32px] shadow-sm border border-slate-100 px-6 py-8"
          >
            <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-sky-50 pointer-events-none" />
            <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-emerald-50 pointer-events-none" />
            <div className="relative z-10 flex flex-col items-center text-center gap-4">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-widest mb-2 text-sky-500">
                  Volunteer Center Mongolia
                </p>
                <p className="text-[26px] font-black leading-tight text-slate-900 tracking-tight">
                  Small Actions,<br />Big Differences
                </p>
                <p className="text-[14px] font-medium mt-3 text-slate-500 max-w-[250px] mx-auto">
                  Сайн дурын хөтөлбөр, сургалт, арга хэмжээг нэг дороос.
                </p>
              </div>
              <div className="shrink-0 flex items-center justify-center gap-3 mt-2">
                <Link href="/about" className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-3 rounded-full text-[14px] font-bold transition-colors">
                  Бидний тухай
                </Link>
                <Link href="/apply" className="bg-sky-500 hover:bg-sky-600 text-white px-5 py-3 rounded-full text-[14px] font-bold transition-colors shadow-lg shadow-sky-500/25">
                  Нэгдэх
                </Link>
              </div>
            </div>
          </div>
        </section>
      </LazySection>
    </div>
  );
}

