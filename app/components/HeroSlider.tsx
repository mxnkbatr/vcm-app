"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, Variants } from "framer-motion";
import { Motion as motion } from "./MotionProxy";
import {
  FaMapMarkerAlt,
  FaClock,
  FaArrowRight,
  FaGlobeEurope,
  FaUserCheck,
} from "react-icons/fa";
import dynamic from "next/dynamic";
const CloudinaryPlayer = dynamic(() => import("./CloudinaryPlayer"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-900 animate-pulse" />
});
// Assuming you have a language context, otherwise use the fallback below
// import { useLanguage } from "../context/LanguageContext";

/* ────────────────────── Configuration ────────────────────── */
const BRAND = {
  RED: "#E31B23",      // Primary Action Color
  GREEN: "#00C896",    // Success/Accent Color
  WHITE: "#FFFFFF",
};

const AUTOPLAY_DURATION = 8000; // 8 Seconds per slide

// STATIC DATA based on your request
const HERO_SLIDES = [
  {
    id: 1,
    title: { mn: "ГЕРМАН УЛСАД Au Pair ХИЙХ", en: "Au Pair in Germany" },
    desc: {
      mn: "Au-Pair хөтөлбөр нь Монгол залууст гадаадад амьдарч, шинэ соёл, хэл сурах, туршлага хуримтлуулах боломж олгодог тусгай хөтөлбөр юм.",
      en: "The Au-Pair program is a special opportunity for Mongolian youth to live abroad, learn new cultures and languages, and gain experience."
    },
    location: { mn: "Герман", en: "Germany" },
    author: "Mongolian AuPair",
    path: "/aupair/germany",
    duration: "12 Months"
  },
  {
    id: 2,
    title: { mn: "АВСТРИ УЛСАД Au Pair ХИЙХ", en: "Au Pair in Austria" },
    desc: {
      mn: "Au-Pair хөтөлбөр нь Монгол залууст гадаадад амьдарч, шинэ соёл, хэл сурах, туршлага хуримтлуулах боломж олгодог тусгай хөтөлбөр юм.",
      en: "The Au-Pair program is a special opportunity for Mongolian youth to live abroad, learn new cultures and languages, and gain experience."
    },
    location: { mn: "Австри", en: "Austria" },
    author: "Mongolian AuPair",
    path: "/aupair/austria",
    duration: "12 Months"
  }
];

/* ────────────────────── Animation Variants ────────────────────── */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
  exit: { opacity: 0, transition: { duration: 0.5 } },
};

const textVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }, // Custom cubic-bezier for "luxurious" feel
};

/* ────────────────────── Main Component ────────────────────── */
const Hero = () => {
  // Mock Language hook (Replace with your actual context)
  const language = "mn"; // Change to "en" to test English
  const [slideIndex, setSlideIndex] = useState(0);

  // Helper for translations
  const t = useCallback(
    (input: any) => {
      if (!input) return "";
      if (typeof input === "object") {
        return input[language as "mn" | "en"] || input.mn || "";
      }
      return input;
    },
    [language]
  );

  // Auto-play logic
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, AUTOPLAY_DURATION);
    return () => clearInterval(timer);
  }, []);

  const activeSlide = HERO_SLIDES[slideIndex];

  return (
    <section className="relative h-[100dvh] min-h-[700px] w-full bg-slate-900 text-white flex items-center justify-center overflow-hidden selection:bg-red-500 selection:text-white">

      {/* ─── 1. Background (Video/Image) ─── */}
      <div className="absolute inset-0 z-0">
        {/* Placeholder for Video - Replace src with your actual video file */}
        {/* Desktop Video Background */}
        <div className="hidden md:block absolute inset-0 w-full h-full">
          <CloudinaryPlayer
            publicId="A_cinematic_highquality_202601201908_j5s2n_kkoosh"
            cloudName="dxoxdiuwr"
            className="w-full h-full object-cover opacity-50 scale-105 pointer-events-none"
          />
        </div>

        {/* Mobile Static Image Background */}
        <div className="block md:hidden absolute inset-0 w-full h-full">
          <Image
            src="https://res.cloudinary.com/dxoxdiuwr/video/upload/f_auto,q_auto,so_0/v1/A_cinematic_highquality_202601201908_j5s2n_kkoosh.jpg"
            alt="Hero Background"
            fill
            className="object-cover opacity-50 scale-105"
            priority
            fetchPriority="high"
            sizes="100vw"
          />
        </div>

        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
      </div>

      {/* ─── 2. Main Content ─── */}
      <div className="relative z-10 container mx-auto px-6 max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 items-center h-full">

        {/* LEFT COLUMN: Text Content */}
        <div className="lg:col-span-8 pt-20 lg:pt-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide.id}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="max-w-4xl text-left"
            >
              {/* Floating Badges */}
              <motion.div variants={textVariants} className="flex flex-wrap items-center gap-3 mb-8">
                {/* Location Badge */}
                <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold uppercase tracking-widest text-white shadow-lg">
                  <FaGlobeEurope className="text-[#00C896]" size={14} />
                  {t(activeSlide.location)}
                </span>

                {/* Verified Badge */}
                <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00C896]/10 backdrop-blur-md border border-[#00C896]/20 text-xs font-bold uppercase tracking-widest text-[#00C896] shadow-lg">
                  <FaUserCheck size={14} />
                  Verified Program
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                variants={textVariants}
                className="text-5xl md:text-7xl font-black leading-[1.1] mb-8 tracking-tight drop-shadow-2xl"
              >
                {t(activeSlide.title).split(" ").map((word: string, i: number) => (
                  <span key={i} className="inline-block mr-3">
                    {/* Highlight "Au Pair" or key words if needed */}
                    {word === "Au" || word === "Pair" ? (
                      <span className="text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400">
                        {word}
                      </span>
                    ) : (
                      word
                    )}
                  </span>
                ))}
              </motion.h1>

              {/* Description with Vertical Accent Line */}
              <motion.div variants={textVariants} className="flex gap-6 mb-10 pl-2">
                <div className="w-1 rounded-full bg-gradient-to-b from-[#E31B23] to-transparent h-auto min-h-[60px]" />
                <p className="text-lg md:text-xl text-slate-300 max-w-xl leading-relaxed font-medium">
                  {t(activeSlide.desc)}
                </p>
              </motion.div>

              {/* Metadata Stats */}
              <motion.div variants={textVariants} className="flex items-center gap-8 mb-10 text-sm font-bold text-slate-300">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-[#E31B23]">
                    <FaClock />
                  </div>
                  <span>{activeSlide.duration}</span>
                </div>
                <div className="w-px h-8 bg-slate-700" />
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-[#00C896]">
                    <FaMapMarkerAlt />
                  </div>
                  <span>{t(activeSlide.location)}</span>
                </div>
              </motion.div>

              {/* CTA Button */}
              <motion.div variants={textVariants}>
                <Link href={activeSlide.path}>
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: "0 20px 40px -10px rgba(227, 27, 35, 0.4)" }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative inline-flex items-center gap-4 px-8 py-4 bg-[#E31B23] text-white rounded-full font-bold text-lg overflow-hidden transition-all duration-300"
                  >
                    <span className="relative z-10">{language === 'mn' ? 'Дэлгэрэнгүй' : 'Learn More'}</span>
                    <span className="relative z-10 p-1 bg-white/20 rounded-full group-hover:rotate-45 transition-transform duration-300">
                      <FaArrowRight size={12} />
                    </span>

                    {/* Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                  </motion.button>
                </Link>
              </motion.div>

            </motion.div>
          </AnimatePresence>
        </div>

        {/* RIGHT COLUMN: Cinematic Pagination */}
        <div className="hidden lg:flex lg:col-span-4 h-full flex-col justify-center items-end pl-12">
          <div className="flex flex-col gap-6">
            {HERO_SLIDES.map((item, index) => {
              const isActive = index === slideIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => setSlideIndex(index)}
                  className="group relative w-72 flex items-center justify-end gap-6 outline-none"
                >
                  <div className={`text-right transition-all duration-500 ${isActive ? "opacity-100 translate-x-0" : "opacity-40 translate-x-4 group-hover:opacity-70"}`}>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#E31B23] mb-1">
                      0{index + 1}
                    </p>
                    <h2 className="text-lg font-bold text-white">
                      {t(item.location)}
                    </h2>
                  </div>

                  {/* Vertical Progress Bar */}
                  <div className={`relative w-1.5 h-20 rounded-full overflow-hidden transition-all duration-500 bg-slate-800 ${isActive ? "scale-y-110" : "scale-y-90"}`}>
                    {isActive && (
                      <motion.div
                        layoutId="activeGlow"
                        className="absolute top-0 left-0 w-full bg-gradient-to-b from-[#00C896] to-[#E31B23]"
                        initial={{ height: "0%" }}
                        animate={{ height: "100%" }}
                        transition={{ duration: AUTOPLAY_DURATION / 1000, ease: "linear" }}
                        // Force re-render on index change
                        key={slideIndex}
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;