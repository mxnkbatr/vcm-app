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
  ShoppingBag,
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
  RED: "#38bdf8", // Using Sky-400 as primary
  GREEN: "#0ea5e9", // Using Sky-500 as secondary
  WHITE: "#FFFFFF",
};

export default function Navbar() {
  const t = useTranslations("navbar");
  const locale = useLocale();
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const isMobile = useIsMobile();



  useMotionValueEvent(scrollY, "change", (latest) => {
    const shouldBeScrolled = latest > 50;
    if (shouldBeScrolled !== isScrolled) {
      setIsScrolled(shouldBeScrolled);
    }
  });



  const desktopNav = [
    { name: t("home"), href: "/" },
    { name: t("about"), href: "/about" },
    { name: t("program"), href: "/programs", hasDropdown: true },
    { name: t("events"), href: "/events" },
    { name: t("lessons"), href: "/lessons" },
    { name: t("shop"), href: "/shop" },
    { name: t("news"), href: "/news" },
  ];

  const mobileNav = [
    { id: "home", icon: Home, href: "/", label: t("home") },
    { id: "programs", icon: Plane, href: "/programs", label: t("program") },
    { id: "booking", icon: ShoppingBag, href: "/shop", label: t("shop"), isMain: true },
    { id: "events", icon: Ticket, href: "/events", label: t("events") },
    { id: "news", icon: BookOpen, href: "/news", label: t("news") },
  ];

  const VCM_PROGRAMS = [
    { code: "AND", name: t("prog_and"), desc: t("prog_and_desc"), href: "/programs/and", flag: "🤝" },
    { code: "EDU", name: t("prog_edu"), desc: t("prog_edu_desc"), href: "/programs/edu", flag: "📚" },
    { code: "VCLUB", name: t("prog_vclub"), desc: t("prog_vclub_desc"), href: "/programs/vclub", flag: "🌍" },
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
          w-[98%] xl:w-[1250px] py-3 px-6 rounded-full border backdrop-blur-xl text-slate-800 drop-shadow-sm
          ${isScrolled
              ? "bg-white/95 border-sky-500/20 shadow-[0_20px_40px_-15px_rgba(14,165,233,0.2)]"
              : "bg-white/60 border-white/50 shadow-xl"}
        `}>
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="relative w-10 h-10 overflow-hidden rounded-full border-2 border-white/50 shadow-md bg-white">
              <Image
                src="/image.png"
                alt="AuPair Logo"
                fill
                priority
                sizes="40px"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                quality={75}
              />
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
                    className={`flex items-center gap-1 px-4 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 whitespace-nowrap
                      ${isActive
                        ? "bg-sky-500 text-white shadow-lg shadow-sky-500/30"
                        : "text-slate-800 opacity-80 hover:opacity-100 hover:text-sky-600 hover:bg-sky-50 shadow-none"}`
                    }
                  >
                    {item.name}
                    {item.hasDropdown && <ChevronDown size={10} className="mt-0.5" />}
                  </Link>

                  <AnimatePresence>
                    {item.hasDropdown && hoveredNav === item.href && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, x: "-50%", scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
                        exit={{ opacity: 0, y: 10, x: "-50%", scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        style={{ WebkitBackdropFilter: "blur(16px)" }}
                        className="absolute top-full left-1/2 mt-4 w-[340px] p-3 rounded-3xl border shadow-2xl z-[100] backdrop-blur-2xl bg-white/95 border-sky-100 text-slate-800 origin-top"
                      >
                        <div className="flex flex-col gap-1">
                          {VCM_PROGRAMS.map((program) => (
                            <Link
                              key={program.code}
                              href={program.href}
                              className="group flex items-start gap-4 p-3 rounded-2xl transition-all border duration-300 shadow-sm border-transparent hover:bg-sky-50 hover:border-sky-100"
                            >
                              <span className="text-3xl shadow-sm rounded-md overflow-hidden">{program.flag}</span>
                              <div>
                                <div className="text-xs font-black uppercase tracking-wider mb-1 flex items-center gap-2 transition-colors group-hover:text-[var(--hover-color)]"
                                  style={{ '--hover-color': BRAND.GREEN } as React.CSSProperties}
                                >
                                  {program.name}
                                  <span className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all">→</span>
                                </div>
                                <p className="text-[10px] leading-relaxed opacity-60 font-medium">{program.desc}</p>
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
            <AuthActions BRAND={BRAND} isMobile={false} />
          </div>
        </nav>
      </motion.header>

      <div className="lg:hidden fixed top-0 left-0 right-0 z-[100] px-5 py-4 flex justify-between items-center pointer-events-none">
        <Link href="/" className="pointer-events-auto">
          <div style={{ WebkitBackdropFilter: "blur(16px)" }} className="transform-gpu flex items-center gap-2 p-1.5 pr-4 rounded-full backdrop-blur-xl border shadow-xl transition-all duration-500 bg-white/80 border-white/50 text-slate-800 drop-shadow-sm">
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/50 bg-white">
              <Image
                src="/image.png"
                alt="Logo"
                fill
                priority
                sizes="32px"
                className="object-cover"
                quality={75}
              />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-800 font-sans">{t("logo")}</span>
          </div>
        </Link>

        <div className="flex items-center gap-2 pointer-events-auto min-w-[120px] justify-end">
          <LanguageToggle />
          <AuthActions BRAND={BRAND} isMobile={true} />
        </div>
      </div>

      <div className="lg:hidden fixed bottom-6 left-0 right-0 z-[100] px-2 flex justify-center">
        <nav style={{ WebkitBackdropFilter: isMobile ? "blur(12px)" : "blur(20px)" }} className="transform-gpu grid grid-cols-5 items-end justify-between w-full max-w-[420px] px-1 py-3 pb-3 rounded-[2rem] border shadow-2xl backdrop-blur-2xl transition-all duration-700 bg-white/90 border-slate-200 text-slate-500 drop-shadow-xl">
          {mobileNav.map((item) => {
            const isActive = pathname === item.href;
            if (item.isMain) {
              return (
                <div key={item.id} className="relative -top-8 flex flex-col items-center justify-end h-full">
                  <Link href={item.href} className="flex flex-col items-center">
                    <motion.div whileTap={{ scale: 0.9 }} className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl relative z-10 text-white border-4 border-white" style={{ backgroundColor: BRAND.RED }}>
                      <item.icon size={24} strokeWidth={2.5} />
                    </motion.div>
                    <span className={`mt-2 text-[9px] font-bold uppercase tracking-wide transition-colors duration-300 ${isActive ? "text-sky-400" : "opacity-80"}`} style={{ color: isActive ? BRAND.RED : undefined }}>{item.label}</span>
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