"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
   motion,
   useScroll,
   useTransform,
   useSpring,
   useMotionValue,
   useMotionTemplate,
   Variants
} from "framer-motion";
import {
   FaHandsHelping,
   FaLaptopCode,
   FaUsers,
   FaArrowRight,
   FaClock,
   FaMapMarkerAlt
} from "react-icons/fa";
import { useTranslations } from "next-intl";

// --- ANIMATION VARIANTS ---
const containerVar: Variants = {
   hidden: { opacity: 0 },
   visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
};

const fadeUp: Variants = {
   hidden: { opacity: 0, y: 40 },
   visible: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.4, duration: 0.8 } }
};

export default function ProgramsClient() {
   const t = useTranslations("HeroSlider");
   const containerRef = useRef<HTMLDivElement>(null);
   const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "end start"] });

   const yHero = useTransform(scrollYProgress, [0, 1], [0, -100]);

   const programs = [
      {
         id: 1,
         title: t("slide2_title"), 
         desc: t("slide2_desc"),
         location: t("slide2_location"),
         duration: t("slide2_duration"),
         tag: t("slide2_tag"),
         icon: FaLaptopCode,
         image: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80",
         color: "sky"
      },
      {
         id: 2,
         title: t("slide1_title"),
         desc: t("slide1_desc"),
         location: t("slide1_location"),
         duration: t("slide1_duration"),
         tag: t("slide1_tag"),
         icon: FaHandsHelping,
         image: "https://images.unsplash.com/photo-1593113580326-9ddf4d76f809?auto=format&fit=crop&w=800&q=80",
         color: "blue"
      },
      {
         id: 3,
         title: t("slide3_title"),
         desc: t("slide3_desc"),
         location: t("slide3_location"),
         duration: t("slide3_duration"),
         tag: t("slide3_tag"),
         icon: FaUsers,
         image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
         color: "indigo"
      }
   ];

   return (
      <div ref={containerRef} className="bg-white text-slate-800 font-sans selection:bg-sky-200 selection:text-sky-900 overflow-hidden">

         {/* ─── 1. ATMOSPHERIC BACKGROUND ─── */}
         <div className="fixed inset-0 pointer-events-none z-0">
            <motion.div
               animate={{ scale: [1, 1.2, 1], rotate: [0, 45, 0] }}
               transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
               className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-gradient-to-br from-sky-100/50 to-transparent rounded-full blur-[100px]"
            />
            <motion.div
               animate={{ scale: [1, 1.3, 1], x: [0, -50, 0] }}
               transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
               className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-blue-100/60 to-transparent rounded-full blur-[100px]"
            />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.2] mix-blend-overlay" />
         </div>

         {/* ─── 2. HEADER SECTION ─── */}
         <section className="relative z-10 pt-40 pb-20 px-6 text-center max-w-4xl mx-auto">
            <motion.div
               initial="hidden"
               animate="visible"
               variants={containerVar}
               className="space-y-8"
            >
               <motion.div variants={fadeUp} className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/90 border border-sky-100 shadow-sm backdrop-blur-md">
                  <span className="relative flex h-3 w-3">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                  </span>
                  <span className="text-xs font-black uppercase tracking-widest text-sky-500">Volunteer Center Mongolia</span>
               </motion.div>

               <motion.h1 variants={fadeUp} className="text-6xl md:text-8xl font-black leading-[1.05] tracking-tighter text-slate-900">
                  <span className="block">Our</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-500 to-sky-600">
                     Programs
                  </span>
               </motion.h1>

               <motion.p variants={fadeUp} className="text-xl text-slate-600 font-medium leading-relaxed">
                  Join a thriving community, expand your horizons, and make a genuine difference. Discover which flagship program aligns perfectly with your goals.
               </motion.p>
            </motion.div>
         </section>

         {/* ─── 3. PROGRAMS SHOWCASE ─── */}
         <section className="py-16 px-6 relative z-10">
            <div className="max-w-7xl mx-auto flex flex-col gap-24">
               {programs.map((prog, index) => {
                  const isEven = index % 2 === 0;
                  return (
                     <motion.div 
                        key={prog.id}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        className={`grid lg:grid-cols-2 gap-12 md:gap-16 items-center ${isEven ? "" : "lg:flex-row-reverse"}`}
                     >
                        {/* Text Side */}
                        <div className={`space-y-8 ${isEven ? 'order-2 lg:order-1' : 'order-2 lg:order-2'}`}>
                           <div className="inline-flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center text-sky-500 shadow-sm">
                                 <prog.icon size={24} />
                              </div>
                              <span className="font-bold text-sky-600 uppercase tracking-widest text-sm">
                                 {prog.tag}
                              </span>
                           </div>

                           <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
                              {prog.title}
                           </h2>
                           
                           <p className="text-lg text-slate-600 leading-relaxed font-medium">
                              {prog.desc}
                           </p>

                           <div className="flex gap-8 pt-4 border-t border-slate-100">
                              <div>
                                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-1">
                                    <FaClock /> Duration
                                 </p>
                                 <p className="font-bold text-slate-800">{prog.duration}</p>
                              </div>
                              <div>
                                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-1">
                                    <FaMapMarkerAlt /> Area
                                 </p>
                                 <p className="font-bold text-slate-800">{prog.location}</p>
                              </div>
                           </div>

                           <div className="pt-6">
                              <Link href={`/programs/${prog.id === 1 ? 'edu' : prog.id === 2 ? 'and' : 'vclub'}`} className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-slate-900 text-white font-bold text-sm uppercase tracking-widest hover:bg-sky-500 hover:shadow-xl hover:shadow-sky-500/30 transition-all">
                                 View Program Details <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                              </Link>
                           </div>
                        </div>

                        {/* Image Side */}
                        <div className={`relative h-[500px] w-full rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-900/10 border-[8px] border-white bg-white ${isEven ? 'order-1 lg:order-2' : 'order-1 lg:order-1'}`}>
                           <div className="w-full h-full relative group perspective-1000">
                              <Image 
                                 src={prog.image} 
                                 alt={prog.title} 
                                 fill 
                                 className="object-cover transition-transform duration-700 ease-out group-hover:scale-110" 
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-80" />
                              
                              <div className="absolute bottom-8 left-8 text-white max-w-sm">
                                 <p className="font-black text-2xl mb-2">{prog.location}</p>
                                 <p className="text-sm font-semibold opacity-90">{prog.tag}</p>
                              </div>
                           </div>
                        </div>

                     </motion.div>
                  )
               })}
            </div>
         </section>

         {/* ─── 4. BOTTOM CTA ─── */}
         <section className="py-24 px-6 relative z-10">
            <div className="max-w-4xl mx-auto text-center bg-sky-50 rounded-[3rem] p-12 md:p-20 border border-sky-100 shadow-xl overflow-hidden relative">
               <div className="absolute top-0 right-0 w-64 h-64 bg-sky-200 rounded-bl-full opacity-30" />
               <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-200 rounded-tr-full opacity-30" />
               
               <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight mb-6 relative z-10">
                  Ready to make <br/>
                  <span className="text-sky-500">Your Impact?</span>
               </h2>
               <p className="text-slate-600 font-medium mb-10 max-w-lg mx-auto relative z-10">
                  Join hundreds of volunteers who are shaping a better, brighter future. Start your journey with VCM today.
               </p>
               <Link href="/join" className="inline-flex relative z-10 items-center justify-center gap-3 px-10 py-5 rounded-full bg-sky-500 text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-sky-500/30 hover:bg-sky-600 hover:-translate-y-1 transition-all group">
                  Become a Volunteer <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
               </Link>
            </div>
         </section>

      </div>
   );
}