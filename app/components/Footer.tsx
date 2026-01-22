"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowUp,
  Mail,
  MapPin,
  Send,
  Phone,
  LucideIcon
} from "lucide-react";
import { useTheme } from "next-themes";
import { useLanguage } from "../context/LanguageContext";

// --- TYPES ---
type LanguageKey = 'en' | 'mn';

interface LinkItem {
  label: Record<LanguageKey, string>;
  href: string;
}

interface Links {
  about: LinkItem[];
  action: LinkItem[];
}

// --- CONFIG ---
const BRAND = {
  RED: "#E31B23",    // Your vibrant red
  GREEN: "#00C896",  // Your emerald green
  PURPLE: "#8B5CF6",
};

const LINKS: Links = {
  about: [
    { label: { en: "About Us", mn: "Бидний тухай" }, href: "/about" },
    { label: { en: "Au Pair Program", mn: "Au pair хөтөлбөр" }, href: "/program" },
    { label: { en: "Success Stories", mn: "Амжилтын түүх" }, href: "/stories" },
  ],
  action: [
    { label: { en: "Apply Now", mn: "Бүртгүүлэх" }, href: "/apply" },
    { label: { en: "Find Family", mn: "Айл хайх" }, href: "/find" },
    { label: { en: "FAQ", mn: "Түгээмэл асуулт" }, href: "/faq" },
  ],
};

export default function AestheticFooter() {
  const { language } = useLanguage();
  const lang = language as LanguageKey;
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && theme === "dark";

  return (
    <footer className={`relative w-full pt-16 pb-8 font-sans transition-all duration-700 overflow-hidden
      ${mounted ? "opacity-100" : "opacity-0"} 
      ${isDark ? "bg-[#050508]" : "bg-white"}`}>

      {/* ─── VIBRANT COLOR BLOBS (Restored) ─── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft Red Haze bottom-left */}
        <div className="absolute -bottom-[20%] -left-[10%] w-[800px] h-[800px] bg-gradient-to-t from-rose-100 via-red-50 to-transparent rounded-full blur-[100px] opacity-60" />
        {/* Soft Green Haze top-right */}
        <div className="absolute top-[0%] -right-[10%] w-[900px] h-[900px] bg-gradient-to-b from-emerald-100 via-teal-50 to-transparent rounded-full blur-[100px] opacity-60" />

        {/* Noise Texture */}
        <div className={`absolute inset-0 opacity-[0.3] bg-[url('/noise.svg')] mix-blend-overlay`} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">

        {/* ─── 1. NEWSLETTER CARD ─── */}
        <div className="relative mb-24">
          <div className={`relative overflow-hidden rounded-[2.5rem] shadow-2xl shadow-rose-200/50
             ${isDark ? "bg-slate-900 border border-slate-800" : "bg-white border border-slate-50"}`}>

            {/* Colorful Gradient Border Effect */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 via-rose-400 to-purple-400" />

            {/* Inner Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 via-transparent to-emerald-50/50 opacity-50" />

            <div className="relative p-8 md:p-12 lg:px-16 grid lg:grid-cols-2 gap-10 items-center">

              {/* Left Text */}
              <div className="space-y-4">
                <span className="inline-block px-4 py-1.5 rounded-full bg-rose-50 text-[#E31B23] text-xs font-bold uppercase tracking-widest ring-1 ring-rose-100">
                  {lang === 'mn' ? "Долоо хоногийн мэдээ" : "Weekly Updates"}
                </span>
                <h2 className={`text-4xl md:text-5xl font-black leading-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                  {lang === 'mn' ? "Боломжийг" : "Don't Miss"} <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E31B23] to-rose-400">
                    {lang === 'mn' ? "Бүү Алд" : "Your Chance"}
                  </span>
                </h2>
              </div>

              {/* Right Input */}
              <div className="relative w-full">
                <div className={`flex items-center p-2 rounded-2xl shadow-sm border focus-within:ring-4 focus-within:ring-rose-100 transition-all ${isDark ? "bg-black border-slate-800" : "bg-white border-slate-100"}`}>
                  <Mail className="ml-4 text-slate-400 shrink-0" size={20} />
                  <input
                    type="email"
                    placeholder={lang === 'mn' ? "И-мэйл хаягаа оруулна уу..." : "Enter your email..."}
                    className={`w-full bg-transparent px-4 py-3 text-sm font-semibold outline-none ${isDark ? "text-white placeholder:text-slate-600" : "text-slate-800 placeholder:text-slate-400"}`}
                  />
                  <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#E31B23] text-white font-bold text-xs uppercase tracking-widest hover:bg-rose-600 hover:scale-105 transition-all shadow-lg shadow-rose-500/30">
                    {lang === 'mn' ? "Илгээх" : "Send"} <Send size={14} className="-rotate-12 group-hover:rotate-0 transition-transform" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ─── 2. FOOTER COLUMNS ─── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 items-start mb-16">

          {/* LOGO AREA */}
          <div className="md:col-span-12 lg:col-span-4 space-y-6">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center text-white relative overflow-hidden">
                {/* Abstract Color inside Logo Box */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#00C896] to-teal-600 opacity-20" />
                <span className="font-bold text-xl relative z-10">M</span>
              </div>
              <div className="flex flex-col">
                <span className={`text-2xl font-black uppercase leading-none tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                  Mongolian
                </span>
                {/* Colorful Agency Text */}
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] bg-clip-text text-transparent bg-gradient-to-r from-[#00C896] to-teal-500">
                  Au Pair Agency
                </span>
              </div>
            </Link>
          </div>

          {/* LINKS AREA */}
          <div className="md:col-span-12 lg:col-span-5 grid grid-cols-2 gap-8">
            <div>
              <SectionHeader color={BRAND.GREEN} label={lang === 'mn' ? "Цэс" : "Explore"} />
              <ul className="space-y-3">
                {LINKS.about.map((l, i) => (
                  <SimpleLink key={i} href={l.href} text={l.label[lang]} isDark={isDark} color={BRAND.GREEN} />
                ))}
              </ul>
            </div>
            <div>
              <SectionHeader color={BRAND.RED} label={lang === 'mn' ? "Үйлдэл" : "Action"} />
              <ul className="space-y-3">
                {LINKS.action.map((l, i) => (
                  <SimpleLink key={i} href={l.href} text={l.label[lang]} isDark={isDark} color={BRAND.RED} />
                ))}
              </ul>
            </div>
          </div>

          {/* CONTACT AREA */}
          <div className="md:col-span-12 lg:col-span-3">
            <SectionHeader color={BRAND.PURPLE} label={lang === 'mn' ? "Холбоо барих" : "Contact"} />
            <div className="space-y-3 mt-4">
              <ContactItem
                icon={Phone}
                title="Phone"
                value="+976 7711 6906"
                isDark={isDark}
                // Keeping background subtle but text colored
                bgColor="bg-blue-50"
                textColor="text-blue-600"
              />
              <ContactItem
                icon={Mail}
                title="Email"
                value="info@mongolianaupair.com"
                isDark={isDark}
                bgColor="bg-rose-50"
                textColor="text-[#E31B23]"
              />
              <ContactItem
                icon={MapPin}
                title="Address"
                value="Ulaanbaatar, Mongolia"
                isDark={isDark}
                bgColor="bg-emerald-50"
                textColor="text-[#00C896]"
              />
            </div>
          </div>
        </div>

        {/* ─── 3. BOTTOM BAR ─── */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className={`text-xs font-bold uppercase tracking-widest opacity-60 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            © 2024 Mongolian Au Pair.
          </p>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Scroll to top"
            className={`p-3 rounded-full transition-colors hover:shadow-lg group
                ${isDark ? "bg-slate-800 text-white hover:bg-slate-700" : "bg-white text-slate-800 hover:bg-slate-50 border border-slate-100"}`}>
            <ArrowUp size={16} className="group-hover:text-[#E31B23] transition-colors" />
          </button>
        </div>

        {/* Giant Watermark (Colorful) */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-full text-center pointer-events-none select-none opacity-[0.05]">
          <span className="text-[12rem] font-black uppercase leading-none whitespace-nowrap text-transparent bg-clip-text bg-gradient-to-b from-slate-400 to-transparent">Au Pair</span>
        </div>

      </div>
    </footer>
  );
}

// ─── HELPER COMPONENTS ───

// ─── HELPER COMPONENTS ───

const SectionHeader = ({ color, label }: { color: string, label: string }) => (
  <div className="flex items-center gap-3 mb-4">
    <span
      className="w-2 h-2 rounded-full ring-2 ring-offset-1"
      style={{
        backgroundColor: color,
        // FIX: Use the Tailwind CSS variable for ring color
        '--tw-ring-color': color
      } as React.CSSProperties}
    />
    <h3 className="text-xs font-black uppercase tracking-[0.15em]" style={{ color }}>{label}</h3>
  </div>
);

// Added hover color prop (re-included for context)
const SimpleLink = ({ href, text, isDark, color }: { href: string, text: string, isDark: boolean, color: string }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <li>
      <Link
        href={href}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`text-sm font-bold transition-all duration-300 hover:translate-x-1 inline-block
          ${isDark ? "text-slate-400" : "text-slate-500"}`}
        // Valid standard CSS property 'color' works fine here
        style={{ color: hovered ? color : undefined }}
      >
        {text}
      </Link>
    </li>
  );
}

const ContactItem = ({ icon: Icon, title, value, isDark, bgColor, textColor }: { icon: LucideIcon, title: string, value: string, isDark: boolean, bgColor: string, textColor: string }) => (
  <div className={`group flex items-center gap-4 p-3 rounded-xl transition-all duration-300 hover:shadow-md cursor-pointer
    ${isDark ? "bg-slate-900 hover:bg-slate-800" : "bg-white border border-slate-100 hover:border-slate-200"}`}>
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${bgColor} ${textColor}`}>
      <Icon size={18} />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase opacity-70 mb-0.5">{title}</p>
      <p className={`text-sm font-bold truncate transition-colors duration-300 group-hover:${textColor} ${isDark ? "text-slate-200" : "text-slate-800"}`}>
        {value}
      </p>
    </div>
  </div>
);