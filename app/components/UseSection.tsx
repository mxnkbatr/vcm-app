"use client";

import { useRef } from "react";
import Link from "next/link";
import { useScroll, useTransform, Variants, useSpring } from "framer-motion";
import { useIsMobile, Motion as motion } from "./MotionProxy";
import CountUp from "react-countup";
import Image from "next/image";
import { TypeAnimation } from "react-type-animation";
import {
  FaUserGraduate,
  FaGlobeEurope,
  FaAward,
  FaHourglassHalf,
  FaArrowRight,
  FaQuoteRight,
  FaCheckCircle,
  FaHandsHelping,
  FaGlobe,
  FaUsers,
  FaHeart
} from "react-icons/fa";
import { useTranslations, useLocale } from "next-intl";

/* ────────────────────── Design System ────────────────────── */
const COLORS = {
  RED: "#E31B23",
  GREEN: "#00C896",
  DARK: "#0F172A",
  SLATE: "#64748B",
};

const ParallaxBackground = ({ containerRef, isAppView }: { containerRef: React.RefObject<any>, isAppView: boolean }) => {
  const { scrollYProgress } = useScroll({
    target: isAppView ? undefined : containerRef,
    offset: ["start end", "end start"]
  });
  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const yBackground = useSpring(useTransform(scrollYProgress, [0, 1], [0, 150]), springConfig);

  return (
    <motion.div
      style={{ y: yBackground }}
      className="absolute -top-[20%] -right-[10%] w-[1000px] h-[1000px] bg-gradient-to-b from-sky-100/50 via-sky-50/20 to-transparent rounded-full blur-[100px] mix-blend-multiply"
    />
  );
};

const UsSection = ({ isAppView = false }: { isAppView?: boolean }) => {
  const t = useTranslations("UsSection");
  const locale = useLocale();
  const containerRef = useRef(null);
  const isMobile = useIsMobile();

  const { scrollYProgress } = useScroll({
    target: isAppView ? undefined : containerRef,
    offset: ["start end", "end start"]
  });

  const rotateImage = useTransform(scrollYProgress, [0, 1], [-2, 5]);
  const yImage = useTransform(scrollYProgress, [0, 1], [0, -50]);

  const containerVar: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.1, delayChildren: 0.3 } 
    }
  };

  const textVar: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } 
    }
  };

  const cardVar: Variants = {
    hidden: { opacity: 0, scale: 0.9, y: 30 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: "easeOut" } 
    }
  };

  const stats = [
    { id: 1, label: t("stat_exp"), val: 17, suffix: `+ ${t("years")}`, icon: FaHourglassHalf },
    { id: 2, label: t("stat_participants"), val: 25000, suffix: "+", icon: FaUsers },
    { id: 3, label: t("stat_global"), val: 50, suffix: "+", icon: FaGlobeEurope },
    { id: 4, label: t("stat_reliable"), val: 100, suffix: "%", icon: FaCheckCircle },
  ];

  if (isAppView) {
    return (
      <div ref={containerRef} className="space-y-6">
        <div className="relative aspect-[16/9] rounded-[2rem] overflow-hidden shadow-lg">
          <Image 
            src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80" 
            alt="About VCM"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
            <p className="text-white text-sm font-medium leading-relaxed">
              {t("hero_desc")}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {stats.slice(0, 4).map((stat) => (
            <div key={stat.id} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
              <div className="w-10 h-10 bg-sky-50 rounded-2xl flex items-center justify-center mb-3">
                <stat.icon className="text-sky-500 w-5 h-5" />
              </div>
              <div className="text-xl font-black text-slate-900">
                <CountUp end={stat.val} duration={2.5} separator="," />
                <span className="text-sky-500 ml-0.5">{stat.suffix}</span>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section ref={containerRef} className="relative w-full py-16 sm:py-24 lg:py-32 overflow-hidden bg-slate-50 selection:bg-red-100 selection:text-red-900">

      {/* ────────────────── 1. AMBIENT BACKGROUND ────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft Noise Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40 mix-blend-soft-light" />

        {/* Parallax Background - Only Desktop */}
        {!isMobile && <ParallaxBackground containerRef={containerRef} isAppView={isAppView} />}

        {/* Static Orb for Mobile */}
        {isMobile && (
          <div className="absolute -top-[10%] -right-[10%] w-[600px] h-[600px] bg-sky-100/40 rounded-full blur-[80px]" />
        )}
      </div>

      <div className="container mx-auto px-5 sm:px-6 lg:px-12 relative z-10">

        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* ────────────────── 2. LEFT: NARRATIVE CONTENT ────────────────── */}
          <motion.div
            variants={containerVar}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="flex flex-col relative"
          >
            {/* Badge */}
            <motion.div variants={textVar} className="mb-8 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-sky-100 text-sky-500">
                <FaAward size={14} />
              </span>
              <span className="text-sm font-bold uppercase tracking-widest text-sky-500 font-sans">
                {t("badge")}
              </span>
            </motion.div>

            {/* Static Headline */}
            <motion.h2 variants={textVar} className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-[1.1] mb-4 sm:mb-6">
              {t("sectionTitle")}
            </motion.h2>

            {/* Paragraphs */}
            <div className="space-y-4 sm:space-y-6 text-sm sm:text-lg text-slate-600 leading-relaxed font-medium mb-8 sm:mb-12">
              <motion.p variants={textVar} className="border-l-2 border-transparent hover:border-slate-300 pl-0 hover:pl-6 transition-all duration-300">
                {t("content")}
              </motion.p>
            </div>

            {/* Core Values Section */}
            <motion.div variants={textVar} className="mt-4">
              <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="w-8 h-1 bg-sky-500 rounded-full inline-block"></span>
                {t("valuesTitle")}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Value 1 */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-500 mb-3 sm:mb-4 group-hover:bg-sky-500 group-hover:text-white transition-all duration-300">
                    <FaHandsHelping size={16} />
                  </div>
                  <h4 className="font-bold text-slate-900 mb-2">{t("val1_title")}</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">{t("val1_desc")}</p>
                </div>

                {/* Value 2 */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-500 mb-3 sm:mb-4 group-hover:bg-sky-500 group-hover:text-white transition-all duration-300">
                    <FaGlobe size={16} />
                  </div>
                  <h4 className="font-bold text-slate-900 mb-2">{t("val2_title")}</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">{t("val2_desc")}</p>
                </div>

                {/* Value 3 */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-500 mb-3 sm:mb-4 group-hover:bg-sky-500 group-hover:text-white transition-all duration-300">
                    <FaUsers size={16} />
                  </div>
                  <h4 className="font-bold text-slate-900 mb-2">{t("val3_title")}</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">{t("val3_desc")}</p>
                </div>

                {/* Value 4 */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-500 mb-3 sm:mb-4 group-hover:bg-sky-500 group-hover:text-white transition-all duration-300">
                    <FaHeart size={16} />
                  </div>
                  <h4 className="font-bold text-slate-900 mb-2">{t("val4_title")}</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">{t("val4_desc")}</p>
                </div>
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.div variants={textVar} className="mt-12">
              <Link href="/contact" className="inline-block group">
                <div className="relative overflow-hidden rounded-full px-10 py-4 bg-sky-500 text-white font-bold text-lg shadow-xl shadow-sky-500/30 hover:shadow-2xl hover:shadow-sky-500/40 transition-all duration-300 transform hover:-translate-y-1">
                  <span className="relative z-10 flex items-center gap-3">
                    {t("cta")}
                    <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 ease-in-out" />
                </div>
              </Link>
            </motion.div>
          </motion.div>

          {/* ────────────────── 3. RIGHT: VISUAL COMPOSITION ────────────────── */}
          <div className="relative h-full flex items-center justify-center lg:pt-12 perspective-[1000px]">

            {/* Main Image Layer */}
            <motion.div
              style={isMobile ? {} : { rotate: rotateImage, y: yImage }}
              initial={{ opacity: 0, y: 50, rotate: -2 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative z-10 w-full max-w-md mx-auto"
            >
              {/* Image Frame */}
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-900/20 border-[8px] border-white bg-white">
                <div className="aspect-[3/4] relative group">
                  {/* Using a professional business image from Unsplash */}
                  <Image
                    src="https://res.cloudinary.com/dc127wztz/image/upload/q_auto/f_auto/v1775390121/tsevlee_mnzwhq.jpg"
                    alt="Agency Founder"
                    fill
                    className="object-cover transform scale-100 group-hover:scale-105 transition-transform duration-700 ease-in-out"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 500px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-80" />

                  {/* Name Tag on Image */}
                  <div className="absolute bottom-6 left-6 text-white">
                    <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">{t("sectionTitle")}</p>
                    <p className="text-2xl font-bold">Volunteer Center Mongolia</p>
                  </div>
                </div>
              </div>

              {/* Floating Glass Element - Stats/Experience */}
              <motion.div
                animate={isMobile ? {} : { y: [0, -15, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-8 -right-8 md:-right-12 bg-white/90 backdrop-blur-md p-6 rounded-[1.5rem] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] border border-white/60 max-w-[240px]"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-sky-100 text-sky-500 p-2.5 rounded-xl">
                    <FaCheckCircle className="text-xl" />
                  </div>
                  <span className="text-xs font-bold text-slate-500 uppercase leading-tight">Verified</span>
                </div>
                <p className="text-sm text-slate-600 font-semibold leading-snug">
                  Recognized by international volunteering associations for safety & quality.
                </p>
              </motion.div>



            </motion.div>
          </div>
        </div>

        {/* ────────────────── 4. STATS BAR ────────────────── */}
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: isMobile ? 0.05 : 0.1, delayChildren: 0.2 } }
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="mt-12 sm:mt-24 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6"
        >
          {stats.map((stat: any, idx: number) => (
            <motion.div
              key={stat.id}
              variants={cardVar}
              whileHover={!isMobile ? { y: -8 } : {}}
              className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-slate-100 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] transition-all duration-300 group cursor-default text-center relative overflow-hidden"
            >
              <div className="w-10 h-10 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-6 rounded-xl sm:rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center group-hover:bg-sky-500 group-hover:text-white transition-all duration-300">
                <stat.icon className="text-xl sm:text-3xl" />
              </div>

              <div className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-800 tracking-tight mb-1 sm:mb-2">
                <CountUp end={stat.val} duration={2.5} enableScrollSpy scrollSpyOnce />
                <span className="text-lg sm:text-2xl ml-0.5 text-sky-500">
                  {stat.suffix}
                </span>
              </div>
              <p className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-widest group-hover:text-slate-800 transition-colors">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export default UsSection;