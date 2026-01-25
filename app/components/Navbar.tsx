"use client";

import React, { useState, useEffect } from "react";
import { Link, usePathname } from "@/navigation";
import Image from "next/image";
import {
  Home,
  Globe,
  Sun,
  Moon,
  BookOpen,
  CalendarClock,
  Ticket,
  Plane,
  ChevronDown,
} from "lucide-react";
import { useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { Motion as motion } from "./MotionProxy";
import { useTheme } from "next-themes";
import { useTranslations, useLocale } from "next-intl";
import dynamic from "next/dynamic";
import { useIsMobile } from "./MotionProxy";
import LanguageToggle from "./LanguageToggle";

// Dynamically import Clerk components to reduce initial JS bundle
const AuthActions = dynamic(() => import("./AuthActions"), {
  ssr: false,
  loading: () => <div className="w-[120px] h-9" />
});

// --- COLOR PALETTE CONFIGURATION ---
const BRAND = {
  RED: "#E31B23",
  GREEN: "#00C896",
  WHITE: "#FFFFFF",
};

export default function Navbar() {
  const t = useTranslations("navbar");
  const locale = useLocale();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const { scrollY } = useScroll();
  const isMobile = useIsMobile();
  const content = {
    login: { en: "Log In", mn: "Нэвтрэх", de: "Anmelden" },
    dashboard: { en: "Dashboard", mn: "Хяналтын самбар", de: "Dashboard" },
    home: t("home"),
    about: t("about"),
    program: t("program"),
    events: t("events"),
    lessons: t("lessons"),
    booking: t("booking"),
    news: t("news"),
    logo: t("logo"),
  };

  useEffect(() => setMounted(true), []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const shouldBeScrolled = latest > 50;
    if (shouldBeScrolled !== isScrolled) {
      setIsScrolled(shouldBeScrolled);
    }
  });

  const isDark = mounted && resolvedTheme === "dark";

  const desktopNav = [
    { name: t("home"), href: "/" },
    { name: t("about"), href: "/about" },
    { name: t("program"), href: "/aupair", hasDropdown: true },
    { name: t("events"), href: "/events" },
    { name: t("lessons"), href: "/lessons" },
    { name: t("booking"), href: "/booking" },
    { name: t("news"), href: "/news" },
  ];

  const mobileNav = [
    { id: "home", icon: Home, href: "/", label: t("home") },
    { id: "aupair", icon: Plane, href: "/aupair", label: t("program") },
    { id: "booking", icon: CalendarClock, href: "/booking", label: t("booking"), isMain: true },
    { id: "events", icon: Ticket, href: "/events", label: t("events") },
    { id: "news", icon: BookOpen, href: "/news", label: t("news") },
  ];

  const AU_PAIR_COUNTRIES = [
    { code: "DE", name: t("germany"), desc: t("desc_de"), href: "/aupair/germany", flag: "🇩🇪" },
    { code: "AT", name: t("austria"), desc: t("desc_at"), href: "/aupair/austria", flag: "🇦🇹" },
    { code: "CH", name: t("switzerland"), desc: t("desc_ch"), href: "/aupair/switzerland", flag: "🇨🇭" },
    { code: "BE", name: t("belgium"), desc: t("desc_be"), href: "/aupair/belgium", flag: "🇧🇪" },
  ];
  const language = locale === "mn" ? "mn" : locale === "en" ? "en" : "de";
  return (
    <>
      <motion.header
        className="fixed top-5 left-0 right-0 hidden lg:flex justify-center pointer-events-none z-[999]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <nav
          onMouseLeave={() => setHoveredNav(null)}
          style={{ WebkitBackdropFilter: "blur(12px)" }}
          className={`
          z-[100] transform-gpu pointer-events-auto flex items-center justify-between transition-[background-color,border-color,shadow,padding] duration-700 relative
          w-[98%] xl:w-[1250px] py-3 px-6 rounded-full border backdrop-blur-md shadow-2xl
          ${isScrolled
              ? (isDark ? "bg-[#00101a]/95 border-red-900/40 shadow-black" : "bg-white/95 border-emerald-100 shadow-emerald-100/50")
              : (isDark ? "bg-[#00101a]/80 border-white/5" : "bg-white/80 border-white/20 shadow-none")}
          ${isDark ? "text-slate-100" : "text-[#001829]"}
        `}>
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="relative w-10 h-10 overflow-hidden rounded-full border-2 border-white/50 shadow-md bg-white">
              <Image src="/image.png" alt="AuPair Logo" fill unoptimized className="object-cover transition-transform duration-500 group-hover:scale-110" />
            </div>
            <span className="font-sans font-black text-lg tracking-tight uppercase" style={{ color: BRAND.RED }}>
              {t("logo")}
            </span>
          </Link>

          <div className="flex items-center gap-1 bg-current/5 p-1 rounded-full mx-2 relative">
            {desktopNav.map((item) => {
              const isActive = pathname === item.href || (item.hasDropdown && pathname.startsWith(item.href));

              return (
                <div key={item.href} className="relative" onMouseEnter={() => item.hasDropdown && setHoveredNav(item.href)}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-1 px-3 py-2 rounded-full text-[10px] font-bold uppercase tracking-wide transition-[color,background-color,shadow] duration-300 whitespace-nowrap
                      ${isActive
                        ? (isDark ? "bg-[#00C896]/10 text-[#00C896] shadow-[0_0_15px_rgba(0,200,150,0.5)]" : "bg-white text-[#00C896] shadow-[0_0_15px_rgba(0,200,150,0.4)]")
                        : "opacity-80 hover:opacity-100 hover:text-[#00C896] hover:bg-[#00C896]/5 hover:shadow-[0_0_20px_rgba(0,200,150,0.6)]"}`
                    }
                  >
                    {item.name}
                    {item.hasDropdown && <ChevronDown size={10} className="mt-0.5" />}
                  </Link>

                  <AnimatePresence>
                    {item.hasDropdown && hoveredNav === item.href && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        style={{ WebkitBackdropFilter: "blur(16px)" }}
                        className={`transform-gpu absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[600px] p-4 rounded-3xl border shadow-xl z-[100] backdrop-blur-lg
                          ${isDark ? "bg-[#00101a]/95 border-white/10 text-slate-200" : "bg-white/95 border-emerald-50 text-slate-800"}`}
                      >
                        <div className="grid grid-cols-2 gap-3">
                          {AU_PAIR_COUNTRIES.map((country) => (
                            <Link
                              key={country.code}
                              href={country.href}
                              className={`group flex items-start gap-4 p-3 rounded-2xl transition-all border duration-300
                                  ${isDark ? "hover:bg-[#00C896]/10 border-transparent hover:border-[#00C896]/30 shadow-sm" : "hover:bg-[#00C896]/5 border-transparent hover:border-[#00C896]/30 shadow-sm"}`}
                            >
                              <span className="text-3xl shadow-sm rounded-md overflow-hidden">{country.flag}</span>
                              <div>
                                <div className="text-xs font-black uppercase tracking-wider mb-1 flex items-center gap-2 transition-colors group-hover:text-[var(--hover-color)]"
                                  style={{ '--hover-color': BRAND.GREEN } as React.CSSProperties}
                                >
                                  {country.name}
                                  <span className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all">→</span>
                                </div>
                                <p className="text-[10px] leading-relaxed opacity-60 font-medium">{country.desc}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <LanguageToggle />
            <div className="h-5 w-[1px] bg-current/10 mx-1" />
            <AuthActions lang={language}   BRAND={BRAND} CONTENT={content}  isMobile={false} />
          </div>
        </nav>
      </motion.header>

      <div className="lg:hidden fixed top-0 left-0 right-0 z-[100] px-5 py-4 flex justify-between items-center pointer-events-none">
        <Link href="/" className="pointer-events-auto">
          <div style={{ WebkitBackdropFilter: "blur(12px)" }} className={`transform-gpu flex items-center gap-2 p-1.5 pr-4 rounded-full backdrop-blur-md border shadow-2xl transition-all duration-500 ${isDark ? "bg-black/80 border-white/10" : "bg-white/90 border-slate-100"}`}>
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/50 bg-white">
              <Image src="/image.png" alt="Logo" fill unoptimized className="object-cover" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: BRAND.RED }}>AuPair</span>
          </div>
        </Link>

        <div className="flex items-center gap-2 pointer-events-auto min-w-[120px] justify-end">
          <LanguageToggle />
          <AuthActions lang={language}  BRAND={BRAND} CONTENT={content} isMobile={true} />
        </div>
      </div>

      <div className="lg:hidden fixed bottom-6 left-0 right-0 z-[100] px-2 flex justify-center">
        <nav style={{ WebkitBackdropFilter: isMobile ? "blur(8px)" : "blur(16px)" }} className={`transform-gpu grid grid-cols-5 items-end justify-between w-full max-w-[420px] px-1 py-3 pb-3 rounded-[2rem] border shadow-lg backdrop-blur-lg transition-all duration-700 ${isDark ? "bg-[#0F172A]/95 border-white/10 shadow-black text-slate-400" : "bg-white/95 border-slate-200 shadow-slate-200/50 text-slate-500"}`}>
          {mobileNav.map((item) => {
            const isActive = pathname === item.href;
            if (item.isMain) {
              return (
                <div key={item.id} className="relative -top-8 flex flex-col items-center justify-end h-full">
                  <Link href={item.href} className="flex flex-col items-center">
                    <motion.div whileTap={{ scale: 0.9 }} className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl relative z-10 text-white border-4 border-[#FDFBF7]" style={{ backgroundColor: BRAND.RED }}>
                      <item.icon size={24} strokeWidth={2.5} />
                    </motion.div>
                    <span className={`mt-2 text-[9px] font-bold uppercase tracking-wide transition-colors duration-300 ${isActive ? "text-[#E31B23]" : "opacity-80"}`} style={{ color: isActive ? BRAND.RED : undefined }}>{item.label}</span>
                  </Link>
                </div>
              );
            }
            return (
              <Link key={item.id} href={item.href} className="flex flex-col items-center justify-center gap-1 relative group p-1">
                <div className={`transition-[transform,color,opacity] duration-300 ${isActive ? "-translate-y-1" : "opacity-70"}`} style={{ color: isActive ? BRAND.GREEN : "currentColor" }}><item.icon size={20} strokeWidth={isActive ? 2.5 : 2} /></div>
                <span className={`text-[9px] font-bold leading-none tracking-wide transition-[color,opacity] duration-300 ${isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"}`} style={{ color: isActive ? BRAND.GREEN : "currentColor" }}>{item.label}</span>
                {isActive && <motion.div layoutId="activeDot" className="absolute -top-1 w-1 h-1 rounded-full" style={{ backgroundColor: BRAND.GREEN }} />}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}