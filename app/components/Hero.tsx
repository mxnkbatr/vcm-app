"use client";

import { useState, useEffect } from "react";
import { Link } from "@/navigation";
import { AnimatePresence, Variants } from "framer-motion";
import { Motion as motion } from "./MotionProxy";
import Image from "next/image";
import {
  FaArrowRight,
  FaPlayCircle,
  FaGlobeEurope,
  FaChevronRight,
  FaChevronLeft,
  FaCheckCircle
} from "react-icons/fa";
import { useTranslations, useLocale } from "next-intl";

/* ────────────────────── Config & Data ────────────────────── */
const PROGRAM_DATA = [
  {
    id: "edu_volunteer",
    key: "edu_volunteer",
    colors: {
      primary: "#0EA5E9",       // Sky Blue
      secondary: "#F0F9FF",     // Ice white
      accent: "#0369A1",
      gradient: "from-sky-400 to-sky-600"
    },
    flag: "📚",
    iso: "EDU",
    img: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=30&w=400",
    stat: "6 Months",
    link: "/programs/edu"
  },
  {
    id: "and_program",
    key: "and_program",
    colors: {
      primary: "#F59E0B",       // Yellow
      secondary: "#FFFBEB",     // Warm white
      accent: "#B45309",
      gradient: "from-amber-400 to-yellow-500"
    },
    flag: "🤝",
    iso: "AND",
    img: "https://res.cloudinary.com/dc127wztz/image/upload/q_auto/f_auto/v1775323713/volunteering_zd97wi.png",
    stat: "3 Months",
    link: "/programs/and"
  },
  {
    id: "v_club",
    key: "v_club",
    colors: {
      primary: "#475569",       // Slate 600
      secondary: "#F8FAFC",     // Light pure slate for the page background
      accent: "#0F172A",        // Slate 900 for text accents
      gradient: "from-slate-700 to-slate-900" // Dark gradient for white text buttons
    },
    flag: "🌍",
    iso: "VCM",
    img: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&q=30&w=400",
    stat: "Ongoing",
    link: "/programs/vclub"
  }
];

const HeroSection = () => {
  const t = useTranslations("hero");
  const common = useTranslations("common");
  const locale = useLocale();

  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const active = PROGRAM_DATA[index];

  const changeSlide = (newDirection: number) => {
    setDirection(newDirection);
    if (newDirection === 1) {
      setIndex((curr) => (curr + 1) % PROGRAM_DATA.length);
    } else {
      setIndex((curr) => (curr === 0 ? PROGRAM_DATA.length - 1 : curr - 1));
    }
  };

  const textContainerVariant: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: isMobile ? 0.05 : 0.1, delayChildren: 0.1 }
    },
    exit: { opacity: 0 }
  };

  const textItemVariant: Variants = {
    hidden: { opacity: 0, x: isMobile ? -10 : -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: isMobile ? 0.3 : 0.5, ease: "easeOut" }
    },
    exit: { opacity: 0, x: isMobile ? 10 : 20 }
  };

  const cardVariants: Variants = {
    enter: (dir: number) => ({
      x: isMobile ? (dir > 0 ? 50 : -50) : (dir > 0 ? 200 : -200),
      opacity: 0,
      rotateY: isMobile ? 0 : (dir > 0 ? 45 : -45),
      scale: 0.8,
      zIndex: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      rotateY: 0,
      scale: 1,
      zIndex: 10,
      transition: {
        duration: isMobile ? 0.4 : 0.6,
        type: "spring",
        stiffness: 150,
        damping: 20
      }
    },
    exit: (dir: number) => ({
      x: isMobile ? (dir < 0 ? 50 : -50) : (dir < 0 ? 200 : -200),
      opacity: 0,
      rotateY: isMobile ? 0 : (dir < 0 ? 45 : -45),
      scale: 0.8,
      zIndex: 0,
      transition: { duration: 0.4 }
    })
  };

  return (
    <section className="relative w-full min-h-[95vh] flex items-center bg-slate-50 overflow-hidden py-24 lg:py-0">
      <div className="absolute inset-0 z-0">
        <motion.div
          animate={{ backgroundColor: active.colors.secondary }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        />
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 mix-blend-soft-light" />
        {mounted && !isMobile && (
          <>
            <motion.div
              animate={{
                backgroundColor: active.colors.primary,
                x: [0, 100, -100, 0],
                y: [0, -50, 50, 0],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full blur-[80px] opacity-20 mix-blend-multiply"
            />
            <motion.div
              animate={{ backgroundColor: active.colors.primary }}
              className="absolute -bottom-[20%] -left-[10%] w-[500px] h-[500px] rounded-full blur-[80px] opacity-15 mix-blend-multiply"
            />
          </>
        )}
      </div>

      <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-16 h-full items-center">
        <div className="flex flex-col justify-center order-2 lg:order-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              variants={textContainerVariant}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-8"
            >
              <motion.div variants={textItemVariant} className="flex items-center gap-3">
                <span
                  className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-white shadow-sm border border-slate-100 flex items-center gap-2"
                  style={{ color: active.colors.accent }}
                >
                  <FaGlobeEurope /> {active.stat}
                </span>
              </motion.div>

              <motion.div variants={textItemVariant} className="relative z-20">
                <h2 className="text-6xl md:text-7xl lg:text-8xl font-black text-slate-900 leading-[0.95] tracking-tight">
                  {common('explore')} <br />
                  <span className={`text-transparent bg-clip-text bg-gradient-to-r ${active.colors.gradient}`}>
                    {t(`${active.key}.title`)}
                  </span>
                </h2>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: isMobile ? 80 : 120 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="h-2 mt-4 rounded-full"
                  style={{ backgroundColor: active.colors.primary }}
                />
              </motion.div>

              <motion.div variants={textItemVariant} className="max-w-xl">
                <h3 className="text-xl font-bold text-slate-800 mb-2">{t(`${active.key}.subtitle`)}</h3>
                <p className="text-lg text-slate-600 leading-relaxed font-medium">
                  {t(`${active.key}.desc`)}
                </p>
              </motion.div>

              <motion.div variants={textItemVariant} className="flex flex-wrap items-center gap-4 pt-2">
                <Link href={active.link}>
                  <motion.button
                    whileHover={!isMobile ? { scale: 1.05, paddingRight: "2.5rem" } : {}}
                    whileTap={{ scale: 0.95 }}
                    className={`group relative px-8 py-4 rounded-full text-white font-bold text-lg shadow-xl overflow-hidden flex items-center transition-all bg-gradient-to-r ${active.colors.gradient}`}
                  >
                    <span className="relative z-10">{common('startJourney')}</span>
                    <FaArrowRight className="absolute right-6 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0" />
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 ease-in-out z-0" />
                  </motion.button>
                </Link>

                <button className="flex items-center gap-3 px-6 py-4 rounded-full bg-white border border-slate-200 shadow-sm hover:shadow-lg transition-all text-slate-600 font-bold group">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                    <FaPlayCircle size={14} />
                  </div>
                  <span>{common('howItWorks')}</span>
                </button>
              </motion.div>

              <motion.div variants={textItemVariant} className="flex items-center gap-4 pt-6 opacity-80">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white" />
                  <div className="w-8 h-8 rounded-full bg-slate-300 border-2 border-white" />
                  <div className="w-8 h-8 rounded-full bg-slate-600 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">500+</div>
                </div>
                <div className="text-xs font-semibold text-slate-500">
                  {common('trusted')}
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="relative order-1 lg:order-2 h-[500px] lg:h-[600px] flex items-center justify-center lg:justify-end perspective-[2000px]">
          <motion.div
            key={`iso-${active.iso}`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 0.1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.8 }}
            className="absolute top-1/2 left-1/2 lg:left-auto lg:right-0 transform -translate-x-1/2 lg:translate-x-1/4 -translate-y-1/2 text-[12rem] lg:text-[20rem] font-black text-slate-900 pointer-events-none select-none z-0 tracking-tighter"
            style={{ color: active.colors.primary }}
          >
            {active.iso}
          </motion.div>

          <div className="relative w-[320px] md:w-[380px] aspect-[3/4] z-20">
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.div
                key={index}
                custom={direction}
                variants={cardVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute inset-0 rounded-[2.5rem] overflow-hidden bg-white shadow-2xl"
                style={{ boxShadow: `0 30px 60px -12px ${active.colors.primary}60` }}
              >
                <div className="w-full h-full relative group">
                  <div className="relative w-full h-full">
                    <Image
                      src={active.img}
                      alt={t(`${active.key}.title`)}
                      fill
                      unoptimized
                      className="object-cover transform scale-105 group-hover:scale-110 transition-transform duration-700"
                      sizes="(max-width: 768px) 320px, 380px"
                      priority={index === 0}
                      quality={75}
                    />
                  </div>
                  <div className={`absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80`} />
                  <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-start">
                    <div className="w-14 h-14 rounded-2xl bg-white/90 backdrop-blur-sm flex items-center justify-center text-3xl shadow-lg">
                      {active.flag}
                    </div>
                    <div className="px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 text-white text-[10px] font-bold uppercase tracking-wide flex items-center gap-1">
                      <FaCheckCircle className="text-emerald-400" /> {common('verified')}
                    </div>
                  </div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-3xl text-white">
                      <h4 className="text-2xl font-bold mb-1">{t(`${active.key}.title`)}</h4>
                      
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex gap-4 z-30">
              <button
                onClick={() => changeSlide(-1)}
                aria-label="Previous slide"
                className="w-14 h-14 rounded-full bg-white text-slate-600 hover:text-slate-900 flex items-center justify-center transition-all shadow-lg hover:scale-110 active:scale-95"
              >
                <FaChevronLeft size={18} />
              </button>
              <button
                onClick={() => changeSlide(1)}
                aria-label="Next slide"
                className="w-14 h-14 rounded-full text-white flex items-center justify-center transition-all shadow-lg hover:scale-110 active:scale-95"
                style={{ backgroundColor: active.colors.primary }}
              >
                <FaChevronRight size={18} />
              </button>
            </div>
          </div>

          {mounted && !isMobile && (
            <motion.div
              animate={{
                rotate: [6, 8, 6],
                backgroundColor: active.colors.secondary
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-4 lg:right-4 w-[320px] md:w-[380px] h-full rounded-[2.5rem] opacity-60 -z-10 border-2 border-slate-100"
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;