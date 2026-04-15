"use client";

import { useState, useEffect } from "react";
import { Link } from "@/navigation";
import { AnimatePresence, Variants } from "framer-motion";
import { Motion as motion } from "./MotionProxy";
import Image from "next/image";
import {
  FaArrowRight,
  FaPlayCircle,
  FaUsers,
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
    <section className="relative w-full min-h-[85vh] sm:min-h-[95vh] flex items-center overflow-hidden py-12" style={{ background: 'var(--bg)' }}>
      <div className="absolute inset-0 z-0">
        <motion.div
          animate={{ backgroundColor: active.colors.secondary }}
          transition={{ duration: 1 }}
          className="absolute inset-0 opacity-50"
        />
      </div>

      <div className="container mx-auto px-5 sm:px-6 relative z-10 grid lg:grid-cols-2 gap-8 sm:gap-16 items-center">
        <div className="flex flex-col justify-center order-2 lg:order-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              variants={textContainerVariant}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              <motion.div variants={textItemVariant}>
                <span
                  className="badge"
                  style={{ background: 'var(--blue-dim)', color: 'var(--blue)', padding: '6px 12px' }}
                >
                  {active.iso} · {active.stat}
                </span>
              </motion.div>

              <motion.div variants={textItemVariant}>
                <h2 className="t-large-title" style={{ fontSize: isMobile ? 42 : 64, lineHeight: 1.1 }}>
                  {common('explore')} <br />
                  <span style={{ color: 'var(--blue)' }}>
                    {t(`${active.key}.title`)}
                  </span>
                </h2>
              </motion.div>

              <motion.div variants={textItemVariant} className="space-y-3">
                <h3 className="t-headline">{t(`${active.key}.subtitle`)}</h3>
                <p className="t-subhead" style={{ color: 'var(--label2)' }}>
                  {t(`${active.key}.desc`)}
                </p>
              </motion.div>

              <motion.div variants={textItemVariant} className="flex flex-col sm:flex-row gap-3 pt-4">
                <Link href={active.link} className="btn btn-primary btn-full sm:btn-auto py-4">
                  {common('startJourney')}
                </Link>

                <button className="btn btn-ghost btn-full sm:btn-auto py-4">
                  {common('howItWorks')}
                </button>
              </motion.div>

              <motion.div variants={textItemVariant} className="flex items-center gap-4 pt-6">
                <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white" style={{ background: 'var(--fill2)' }} />
                  ))}
                  <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white" style={{ background: 'var(--label2)' }}>500+</div>
                </div>
                <div className="t-caption font-semibold">
                  {common('trusted')}
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="relative order-1 lg:order-2 h-[380px] sm:h-[500px] lg:h-[600px] flex items-center justify-center lg:justify-end">
          <div className="relative w-[260px] sm:w-[320px] md:w-[380px] aspect-[3/4] z-20">
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.div
                key={index}
                custom={direction}
                variants={cardVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute inset-0 card overflow-hidden"
              >
                <div className="w-full h-full relative group">
                  <Image
                    src={active.img}
                    alt={t(`${active.key}.title`)}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 320px, 380px"
                    priority={index === 0}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <div className="w-12 h-12 rounded-2xl frosted flex items-center justify-center text-2xl">
                      {active.flag}
                    </div>
                  </div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="frosted p-4 rounded-2xl">
                      <h4 className="t-headline text-white">{t(`${active.key}.title`)}</h4>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-30">
              <button
                onClick={() => changeSlide(-1)}
                className="icon-box frosted press"
              >
                <FaChevronLeft size={16} />
              </button>
              <button
                onClick={() => changeSlide(1)}
                className="icon-box press"
                style={{ background: 'var(--blue)', color: 'white' }}
              >
                <FaChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;