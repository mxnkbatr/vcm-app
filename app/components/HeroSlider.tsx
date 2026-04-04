"use client";

import { useState, useEffect, useRef } from "react";
import { Link } from "@/navigation";
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
import { useTranslations, useLocale } from "next-intl";

const CloudinaryPlayer = dynamic(() => import("./CloudinaryPlayer"), { ssr: false });

/* ────────────────────── Configuration ────────────────────── */
const AUTOPLAY_DURATION = 8000; // 8 Seconds per slide

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
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};

/* ────────────────────── Main Component ────────────────────── */
const HeroSlider = () => {
  const t = useTranslations("HeroSlider");
  const locale = useLocale();
  const [slideIndex, setSlideIndex] = useState(0);
  const containerRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [mounted, setMounted] = useState(false);

  const slides = [
    {
      id: 1,
      title: t("slide1_title"),
      desc: t("slide1_desc"),
      location: t("slide1_location"),
      path: "/",
      duration: t("slide1_duration"),
      tag: t("slide1_tag"),
      btn: t("slide1_btn")
    },
    {
      id: 2,
      title: t("slide2_title"),
      desc: t("slide2_desc"),
      location: t("slide2_location"),
      path: "/",
      duration: t("slide2_duration"),
      tag: t("slide2_tag"),
      btn: t("slide2_btn")
    },
    {
      id: 3,
      title: t("slide3_title"),
      desc: t("slide3_desc"),
      location: t("slide3_location"),
      path: "/",
      duration: t("slide3_duration"),
      tag: t("slide3_tag"),
      btn: t("slide3_btn")
    }
  ];

  // Auto-play logic
  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length);
    }, AUTOPLAY_DURATION);
    return () => clearInterval(timer);
  }, [slides.length]);

  const activeSlide = slides[slideIndex];

  useEffect(() => {
    // Intersection Observer to lazy load video
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section ref={containerRef} className="relative h-[100dvh] min-h-[700px] w-full bg-slate-50 text-slate-900 flex items-center justify-center overflow-hidden selection:bg-sky-500 selection:text-white">

      {/* ─── 1. Background (Video/Image) ─── */}
      <div className="absolute inset-0 z-0">
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="https://res.cloudinary.com/dc127wztz/image/upload/q_auto/f_auto/v1775323713/volunteering_zd97wi.png"
            alt="Hero Background"
            fill
            className="object-cover opacity-90 transition-transform duration-700 will-change-transform"
            priority
            loading="eager"
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
            sizes="100vw"
            style={{ transform: 'scale(1.05)' }}
          />
        </div>

        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent" />
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
                <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/40 backdrop-blur-md border border-slate-200 text-xs font-bold uppercase tracking-widest text-slate-800 shadow-md">
                  <FaGlobeEurope className="text-sky-500" size={14} />
                  {activeSlide.location}
                </span>

                {/* Verified Badge */}
                <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 backdrop-blur-md border border-sky-500/20 text-xs font-bold uppercase tracking-widest text-sky-600 shadow-md">
                  <FaUserCheck size={14} />
                  {activeSlide.tag}
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                variants={textVariants}
                className="text-5xl md:text-7xl font-black leading-[1.1] mb-8 tracking-tight drop-shadow-sm text-slate-900"
              >
                {activeSlide.title.split(" ").map((word: string, i: number) => (
                  <span key={i} className="inline-block mr-3">
                    {i === 0 ? (
                      <span className="text-transparent bg-clip-text bg-gradient-to-br from-sky-400 to-sky-600">
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
                <div className="w-1 rounded-full bg-gradient-to-b from-sky-500 to-transparent h-auto min-h-[60px]" />
                <p className="text-lg md:text-xl text-slate-600 max-w-xl leading-relaxed font-medium">
                  {activeSlide.desc}
                </p>
              </motion.div>

              {/* Metadata Stats */}
              <motion.div variants={textVariants} className="flex items-center gap-8 mb-10 text-sm font-bold text-slate-700">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-sky-500">
                    <FaClock />
                  </div>
                  <span>{activeSlide.duration}</span>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800">
                    <FaMapMarkerAlt />
                  </div>
                  <span>{activeSlide.location}</span>
                </div>
              </motion.div>

            <motion.div variants={textVariants}>
                <Link href={activeSlide.path}>
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: "0 20px 40px -10px rgba(14, 165, 233, 0.4)" }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative inline-flex items-center gap-4 px-8 py-4 bg-sky-500 text-white rounded-full font-bold text-lg overflow-hidden transition-all duration-300"
                  >
                    <span className="relative z-10">{activeSlide.btn}</span>
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
            {slides.map((item, index) => {
              const isActive = index === slideIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => setSlideIndex(index)}
                  className="group relative w-72 flex items-center justify-end gap-6 outline-none"
                >
                  <div className={`text-right transition-all duration-500 ${isActive ? "opacity-100 translate-x-0" : "opacity-40 translate-x-4 group-hover:opacity-70"}`}>
                    <p className="text-xs font-bold uppercase tracking-widest text-sky-500 mb-1">
                      0{index + 1}
                    </p>
                    <h2 className="text-lg font-bold text-slate-900">
                      {item.location}
                    </h2>
                  </div>

                  {/* Vertical Progress Bar */}
                  <div className="relative w-[6px] h-[80px] rounded-full overflow-hidden transition-all duration-500 bg-slate-200 shrink-0">
                    {isActive && (
                      <motion.div
                        layoutId="activeGlow"
                        className="absolute top-0 left-0 w-full bg-gradient-to-b from-sky-400 to-sky-600"
                        initial={{ height: "0%" }}
                        animate={{ height: "100%" }}
                        transition={{ duration: AUTOPLAY_DURATION / 1000, ease: "linear" }}
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

export default HeroSlider;