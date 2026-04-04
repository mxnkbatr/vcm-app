"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
   motion,
   useScroll,
   useTransform,
   Variants
} from "framer-motion";
import {
   FaHandsHelping,
   FaHeart,
   FaCheckCircle,
   FaPlaneDeparture,
   FaRegLightbulb,
   FaQuoteLeft
} from "react-icons/fa";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

const containerVar: Variants = {
   hidden: { opacity: 0 },
   visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVar: Variants = {
   hidden: { opacity: 0, y: 20 },
   visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
};

export default function AndClient() {
   const t = useTranslations("AndPage");
   const containerRef = useRef(null);
   const { scrollYProgress } = useScroll({ target: containerRef });
   const yHero = useTransform(scrollYProgress, [0, 1], [0, -100]);
   const { status } = useSession();
   const isSignedIn = status === "authenticated";

   const stats = [
      { label: t("info.stats.focus.label"), val: t("info.stats.focus.val") },
      { label: t("info.stats.type.label"), val: t("info.stats.type.val") },
      { label: t("info.stats.impact.label"), val: t("info.stats.impact.val") },
   ];

   return (
      <div ref={containerRef} className="min-h-[100dvh] bg-white text-slate-800 font-sans selection:bg-sky-100 selection:text-sky-900 overflow-hidden pb-20">
         
         {/* ─── 1. CLEAN ATMOSPHERIC BACKGROUND ─── */}
         <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute top-[-5%] right-[-5%] w-[600px] h-[600px] bg-sky-50 rounded-full blur-[100px] opacity-60" />
            <div className="absolute bottom-[-5%] left-[-5%] w-[500px] h-[500px] bg-blue-50 rounded-full blur-[100px] opacity-60" />
            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px] opacity-40" />
         </div>

         {/* ─── 2. HERO SECTION (PURE) ─── */}
         <section className="relative pt-24 pb-16 px-6 lg:px-12 z-10">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
               <motion.div initial="hidden" animate="visible" variants={containerVar} className="space-y-6 text-center lg:text-left">
                  <motion.div variants={itemVar} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-sky-100 shadow-sm text-sky-600">
                     <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                     <span className="text-[10px] font-black uppercase tracking-widest">{t("hero.tag")}</span>
                  </motion.div>

                  <motion.h1 variants={itemVar} className="text-5xl md:text-7xl font-black leading-[0.95] tracking-tight text-slate-900">
                     <span className="block">{t("hero.title")}</span>
                     <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600">
                        {t("hero.highlight")}
                     </span>
                  </motion.h1>

                  <motion.p variants={itemVar} className="text-lg text-slate-500 font-medium leading-relaxed max-w-lg mx-auto lg:mx-0">
                     {t("hero.sub")}
                  </motion.p>

                  <motion.div variants={itemVar} className="flex flex-wrap gap-3 justify-center lg:justify-start pt-2">
                     {!isSignedIn && (
                        <Link href="/register">
                           <button className="px-8 py-3.5 rounded-xl bg-sky-500 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-sky-500/20 hover:bg-sky-600 hover:-translate-y-0.5 transition-all flex items-center gap-2">
                              {t("hero.cta")} <FaPlaneDeparture />
                           </button>
                        </Link>
                     )}
                     <Link href="/about">
                        <button className="px-8 py-3.5 rounded-xl bg-white border border-slate-100 text-slate-600 font-bold text-xs uppercase tracking-widest hover:border-sky-400 hover:text-sky-600 transition-all">
                           {t("hero.about")}
                        </button>
                     </Link>
                  </motion.div>
               </motion.div>

               <div className="relative h-[550px] hidden lg:block">
                  <motion.div 
                     style={{ y: yHero }}
                     className="absolute inset-x-10 top-0 h-[450px] rounded-[2rem] bg-white p-3 shadow-xl border border-slate-100 z-10"
                  >
                     <div className="relative w-full h-full rounded-[1.5rem] overflow-hidden bg-slate-50">
                        <Image 
                           src="https://images.unsplash.com/photo-1593113580326-9ddf4d76f809?auto=format&fit=crop&w=1200&q=90" 
                           alt="AND Program" 
                           fill 
                           className="object-cover" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-white/10 via-transparent to-transparent" />
                     </div>
                  </motion.div>

                  <motion.div 
                     animate={{ y: [0, 20, 0] }}
                     transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                     className="absolute bottom-20 -left-10 p-8 rounded-3xl bg-white/90 backdrop-blur-xl border border-sky-100 shadow-2xl z-20 max-w-sm"
                  >
                     <FaQuoteLeft className="text-sky-500 mb-4 opacity-30" size={24} />
                     <p className="text-slate-600 font-medium italic mb-4">"Professional care meets heartfelt connection. A truly life-changing experience."</p>
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-sky-100" />
                        <p className="text-xs font-black uppercase text-slate-800 tracking-widest">Maria S. — Volunteer</p>
                     </div>
                  </motion.div>
               </div>
            </div>
         </section>

         {/* ─── 3. INFO SECTION (CLEAR) ─── */}
         <section className="py-16 px-6 bg-slate-50/50">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
               <motion.div 
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden"
               >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-bl-[4rem]" />
                  <div className="flex items-center gap-3 mb-6">
                     <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center text-2xl text-sky-500 shadow-sm">
                        <FaHandsHelping />
                     </div>
                     <h2 className="text-2xl font-black text-slate-900">{t("info.title")}</h2>
                  </div>
                  <p className="text-base text-slate-600 leading-relaxed mb-8 font-medium">
                     {t("info.desc")}
                  </p>
                  <div className="grid grid-cols-3 gap-6">
                     {stats.map((s, i) => (
                        <div key={i} className="bg-slate-50 p-4 rounded-2xl text-center border border-white">
                           <p className="text-[10px] font-black uppercase text-sky-500 mb-1">{s.label}</p>
                           <p className="text-lg font-black text-slate-800">{s.val}</p>
                        </div>
                     ))}
                  </div>
               </motion.div>

               <div className="space-y-10">
                  <h3 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
                     Professional <span className="text-sky-500">Support</span> <br />
                     Tailored for Impact
                  </h3>
                  <div className="grid gap-6">
                     {[
                        { icon: FaHeart, title: "Compassion First", desc: "Every interaction is driven by empathy and professional training." },
                        { icon: FaRegLightbulb, title: "Bright Future", desc: "Building sustainable paths for children and families to thrive." }
                     ].map((item, i) => (
                        <div key={i} className="flex gap-5 p-6 rounded-2xl hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-default">
                           <div className="w-12 h-12 shrink-0 rounded-xl bg-sky-50 flex items-center justify-center text-sky-500 text-xl font-black">
                              <item.icon />
                           </div>
                           <div>
                              <p className="font-black text-slate-900 mb-1">{item.title}</p>
                              <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </section>

         {/* ─── 4. BOTTOM ACTION ─── */}
         <section className="py-16 px-6">
            <div className="max-w-4xl mx-auto text-center bg-slate-900 rounded-[2rem] p-10 md:p-14 shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/10 rounded-bl-full" />
               <h2 className="text-3xl md:text-4xl font-black text-white mb-4 relative z-10">
                  Join the <span className="text-sky-400">Pure Heart</span> Mission
               </h2>
               <p className="text-sm text-slate-400 font-medium mb-8 max-w-md mx-auto relative z-10">
                  Take the first step toward a more inclusive and professional care model. Your journey starts here.
               </p>
               <Link href="/register" className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full bg-sky-500 text-white font-black text-xs uppercase tracking-widest hover:bg-sky-600 hover:-translate-y-0.5 transition-all shadow-lg shadow-sky-500/30 group relative z-10 font-sans">
                  Apply Today <FaPlaneDeparture className="group-hover:translate-x-1 transition-transform" />
               </Link>
            </div>
         </section>

      </div>
   );
}
