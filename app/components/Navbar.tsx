"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useLanguage } from "../context/LanguageContext";

// --- COLOR PALETTE CONFIGURATION ---
const BRAND = {
  RED: "#E31B23",        // Primary: Logo, Buttons, CTA
  GREEN: "#00C896",      // Secondary: Active Links, Highlights (Crystal Green)
  WHITE: "#FFFFFF",      // Backgrounds, Text on Red
};


const CONTENT = {
  logo: { mn: "MONGOLIAN AUPAIR", en: "MONGOLIAN AUPAIR" },
  login: { mn: "Нэвтрэх", en: "Sign In" },
  register: { mn: "Бүртгүүлэх", en: "Register" },
  dashboard: { mn: "Миний булан", en: "My Dashboard" },
};

// DATA: AU PAIR COUNTRIES
const AU_PAIR_COUNTRIES = [
  { 
    code: "DE", 
    name: { mn: "Герман", en: "Germany" }, 
    desc: { mn: "Герман улсад үнэ төлбөргүй хэлээ сурцгаая", en: "Learn language for free in Germany" },
    href: "/aupair/germany", 
    flag: "🇩🇪" 
  },
  { 
    code: "AT", 
    name: { mn: "Австри", en: "Austria" }, 
    desc: { mn: "Австри улсад үнэ төлбөргүй хэлээ сурцгаая", en: "Learn language for free in Austria" },
    href: "/aupair/austria", 
    flag: "🇦🇹" 
  },
  { 
    code: "CH", 
    name: { mn: "Швейцарь", en: "Switzerland" }, 
    desc: { mn: "Швейцарь улсад үнэ төлбөргүй хэлээ сурцгаая", en: "Learn language for free in Switzerland" },
    href: "/aupair/switzerland", 
    flag: "🇨🇭" 
  },
  { 
    code: "BE", 
    name: { mn: "Бельги", en: "Belgium" }, 
    desc: { mn: "Бельги улсад үнэ төлбөргүй хэлээ сурцгаая", en: "Learn language for free in Belgium" },
    href: "/aupair/belgium", 
    flag: "🇧🇪" 
  },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const pathname = usePathname();
  const { language: lang, setLanguage } = useLanguage();
  const { resolvedTheme, setTheme } = useTheme();
  const { scrollY } = useScroll();

  useEffect(() => setMounted(true), []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";
  const toggleLanguage = () => setLanguage(lang === "mn" ? "en" : "mn");
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  const desktopNav = [
    { name: { mn: "Нүүр", en: "Home" }, href: "/" },
    { name: { mn: "Бидний тухай", en: "About" }, href: "/about" },
    { name: { mn: "Au Pair хөтөлбөр", en: "Au Pair Program" }, href: "/aupair", hasDropdown: true }, 
    { name: { mn: "Эвент", en: "Events" }, href: "/events" },
    { name: { mn: "Цаг авах", en: "Booking" }, href: "/booking" },
    { name: { mn: "Мэдээ", en: "News" }, href: "/news" },
  ];

  const mobileNav = [
    { id: "home", icon: Home, href: "/", label: { mn: "Нүүр", en: "Home" } },
    { id: "aupair", icon: Plane, href: "/aupair", label: { mn: "Au Pair", en: "Au Pair" } },
    { id: "booking", icon: CalendarClock, href: "/booking", label: { mn: "Цаг авах", en: "Book" }, isMain: true }, 
    { id: "events", icon: Ticket, href: "/events", label: { mn: "Эвент", en: "Event" } },
  ];

  return (
    <>
      {/* ========================================================= */}
      {/* 1. DESKTOP HEADER                                         */}
      {/* ========================================================= */}
      <motion.header 
        className="fixed z-50 left-0 right-0 hidden lg:flex justify-center pointer-events-none"
        animate={{ y: 20 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
      >
        <nav 
          onMouseLeave={() => setHoveredNav(null)}
          className={`
          pointer-events-auto flex items-center justify-between transition-all duration-700 relative
          w-[98%] xl:w-[1250px] py-3 px-6 rounded-full border backdrop-blur-2xl shadow-2xl
          ${isScrolled 
            ? (isDark ? "bg-[#00101a]/95 border-red-900/40 shadow-black" : "bg-white/95 border-emerald-100 shadow-emerald-100/50")
            : (isDark ? "bg-[#00101a]/40 border-white/5" : "bg-white/40 border-white/20 shadow-none")}
          ${isDark ? "text-slate-100" : "text-[#001829]"}
        `}>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
             <div className="relative w-10 h-10 overflow-hidden rounded-full border-2 border-white/50 shadow-md bg-white">
                <Image src="/image.png" alt="AuPair Logo" fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
             </div>
             <span className="font-sans font-black text-lg tracking-tight uppercase" style={{ color: BRAND.RED }}>
                {CONTENT.logo[lang]}
             </span>
          </Link>

          {/* Links Container */}
          <div className="flex items-center gap-1 bg-current/5 p-1 rounded-full mx-2 relative">
            {desktopNav.map((item) => {
              const isActive = pathname === item.href || (item.hasDropdown && pathname.startsWith(item.href));
              
              return (
                <div 
                  key={item.href}
                  className="relative"
                  onMouseEnter={() => item.hasDropdown && setHoveredNav(item.href)}
                >
                  <Link 
                    href={item.href} 
                    // COLOR & GLOW LOGIC:
                    // 1. If Active: Permanent Crystal Green Glow + Green Text
                    // 2. If Hover: Green Glow + Green Text
                    className={`flex items-center gap-1 px-3 py-2 rounded-full text-[10px] font-bold uppercase tracking-wide transition-all duration-300 whitespace-nowrap
                      ${isActive 
                        ? (isDark 
                            ? "bg-[#00C896]/10 text-[#00C896] shadow-[0_0_15px_rgba(0,200,150,0.5)]" 
                            : "bg-white text-[#00C896] shadow-[0_0_15px_rgba(0,200,150,0.4)]") 
                        : "opacity-60 hover:opacity-100 hover:text-[#00C896] hover:bg-[#00C896]/5 hover:shadow-[0_0_20px_rgba(0,200,150,0.6)]"}`
                    }
                  >
                    {item.name[lang]}
                    {item.hasDropdown && <ChevronDown size={10} className="mt-0.5" />}
                  </Link>
                  
                  {/* DROPDOWN MENU */}
                  <AnimatePresence>
                    {item.hasDropdown && hoveredNav === item.href && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className={`absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[600px] p-4 rounded-3xl border shadow-xl z-50 backdrop-blur-3xl
                          ${isDark 
                            ? "bg-[#00101a]/95 border-white/10 text-slate-200" 
                            : "bg-white/95 border-emerald-50 text-slate-800"}`}
                      >
                         <div className="grid grid-cols-2 gap-3">
                            {AU_PAIR_COUNTRIES.map((country) => (
                              <Link 
                                key={country.code} 
                                href={country.href}
                                // DROPDOWN HOVER: Crystal Green Glow + Green Border
                                className={`group flex items-start gap-4 p-3 rounded-2xl transition-all border duration-300
                                  ${isDark 
                                    ? "hover:bg-[#00C896]/10 border-transparent hover:border-[#00C896]/30 hover:shadow-[0_0_15px_rgba(0,200,150,0.3)]" 
                                    : "hover:bg-[#00C896]/5 border-transparent hover:border-[#00C896]/30 hover:shadow-[0_0_15px_rgba(0,200,150,0.3)]"}`
                                }
                              >
                                 <span className="text-3xl shadow-sm rounded-md overflow-hidden">{country.flag}</span>
                                 <div>
                                    <h4 className="text-xs font-black uppercase tracking-wider mb-1 flex items-center gap-2 transition-colors group-hover:text-[var(--hover-color)]"
                                        style={{ '--hover-color': BRAND.GREEN } as React.CSSProperties}
                                    >
                                      {country.name[lang]} 
                                      <span className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all">→</span>
                                    </h4>
                                    <p className="text-[10px] leading-relaxed opacity-60 font-medium">
                                      {country.desc[lang]}
                                    </p>
                                 </div>
                              </Link>
                            ))}
                         </div>
                         <div className={`absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 border-t border-l
                            ${isDark ? "bg-[#00101a] border-white/10" : "bg-white border-emerald-50"}`} 
                         />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Desktop Actions */}
          <div className="flex items-center gap-2 shrink-0">
             <button onClick={toggleLanguage} className="w-9 h-9 rounded-full border flex items-center justify-center border-current/10 hover:bg-current/10 transition-all active:scale-90">
                <Globe size={15}/>
             </button>

            
           
             <div className="h-5 w-[1px] bg-current/10 mx-1" />

             <SignedIn>
                <div className="flex items-center gap-3">
                    <Link 
                        href="/dashboard" 
                        className="text-[9px] font-black uppercase tracking-widest opacity-70 hover:opacity-100 border-b-2 hidden xl:block"
                        style={{ borderColor: BRAND.RED }}
                    >
                        {CONTENT.dashboard[lang]}
                    </Link>
                    <div className="scale-100"><UserButton /></div>
                </div>
             </SignedIn>
             
             <SignedOut>
               <Link href="/sign-in">
                  {/* Button: Brand Red */}
                  <button 
                    className="px-5 py-2 rounded-full text-white text-[9px] font-black uppercase tracking-widest shadow-xl shadow-red-900/20 transition-all active:scale-95 hover:brightness-110"
                    style={{ backgroundColor: BRAND.RED }}
                  >
                    {CONTENT.login[lang]}
                  </button>
               </Link>
             </SignedOut>
          </div>
        </nav>
      </motion.header>


      {/* ========================================================= */}
      {/* 2. MOBILE TOP BAR                                         */}
      {/* ========================================================= */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 px-5 py-4 flex justify-between items-center pointer-events-none">
        <Link href="/" className="pointer-events-auto">
           <div className={`p-1 rounded-full backdrop-blur-xl border shadow-2xl transition-all ${
             isDark ? "bg-white/10 border-white/30" : "bg-white/80 border-slate-100"
           }`}>
              <Image src="/logo.jpg" alt="Logo" width={34} height={34} className="rounded-full bg-white object-cover" />
           </div>
        </Link>

        <div className="flex items-center gap-2 pointer-events-auto">
            <SignedOut>
                <Link href="/sign-in">
                    <motion.button 
                      whileTap={{ scale: 0.9 }}
                      className="px-4 h-9 rounded-full text-white text-[9px] font-black tracking-widest uppercase shadow-lg shadow-red-900/30 border border-white/20"
                      style={{ backgroundColor: BRAND.RED }}
                    >
                        {CONTENT.login[lang]}
                    </motion.button>
                </Link>
            </SignedOut>

            <div className={`flex gap-1 p-1 rounded-full backdrop-blur-md border transition-all ${
              isDark ? "bg-black/5 border-white/10" : "bg-white/80 border-slate-100 shadow-sm"
            }`}>
                <button onClick={toggleLanguage} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                    <span className="text-[8px] font-black">{lang === 'mn' ? 'EN' : 'MN'}</span>
                </button>
             
            </div>

            <SignedIn>
                <div className="ml-1 scale-105 drop-shadow-lg"><UserButton /></div>
            </SignedIn>
        </div>
      </div>


      {/* ========================================================= */}
      {/* 3. MOBILE BOTTOM DOCK                                     */}
      {/* ========================================================= */}
      <div className="lg:hidden fixed bottom-6 left-0 right-0 z-50 px-4 flex justify-center">
        <nav className={`
          flex items-center justify-between w-full max-w-[460px] px-2 py-3 rounded-full border shadow-[0_-15px_50px_rgba(0,0,0,0.2)] backdrop-blur-3xl transition-all duration-700
          ${isDark ? "bg-[#00101a]/95 border-red-900/50 shadow-black text-slate-100" : "bg-white/95 border-slate-100 shadow-slate-200/50 text-[#001829]"}
        `}>
          {mobileNav.map((item) => {
            const isActive = pathname === item.href;
            
            // Central Services Button (Booking) - RED for emphasis
            if (item.isMain) {
              return (
                <Link key={item.id} href={item.href} className="relative -top-8 flex flex-col items-center">
                  <motion.div 
                    whileTap={{ scale: 0.85 }}
                    className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl relative z-10 text-white`}
                    style={{ backgroundColor: BRAND.RED }}
                  >
                    <item.icon size={24} strokeWidth={2.5} />
                    <motion.div 
                      animate={{ scale: [1, 1.4], opacity: [0.4, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                      className="absolute inset-0 rounded-full"
                      style={{ backgroundColor: BRAND.RED }}
                    />
                  </motion.div>
                  <span 
                    className="mt-2 text-[8px] font-black uppercase tracking-widest transition-colors"
                    style={{ color: isActive ? BRAND.RED : "gray" }}
                  >
                    {item.label[lang]}
                  </span>
                </Link>
              );
            }

            return (
              <Link key={item.id} href={item.href} className="flex-1 flex flex-col items-center justify-center py-2 relative group">
                <AnimatePresence>
                  {isActive && (
                    <motion.div 
                        layoutId="activePill" 
                        className={`absolute inset-x-1 inset-y-1 rounded-full -z-10 ${isDark ? "bg-emerald-900/20" : "bg-emerald-50"}`} 
                    />
                  )}
                </AnimatePresence>

                {/* Mobile Icons: Active -> Crystal Green */}
                <div 
                  className={`transition-all duration-300 mb-1 ${isActive ? "scale-110" : "opacity-60"}`}
                  style={{ color: isActive ? BRAND.GREEN : "currentColor" }}
                >
                   <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                
                <span 
                   className={`text-[8px] font-bold uppercase tracking-tight transition-all ${isActive ? "opacity-100" : "opacity-60"}`}
                   style={{ color: isActive ? BRAND.GREEN : "currentColor" }}
                >
                   {item.label[lang]}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}