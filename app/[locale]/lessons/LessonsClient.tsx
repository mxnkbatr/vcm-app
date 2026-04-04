"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Link } from "@/navigation";
import {
   Play,
   Clock,
   BookOpen,
   ArrowRight,
   Loader2,
   Users,
   GraduationCap,
   Sparkles,
   Globe,
   TrendingUp
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";

// --- TYPES ---
interface Lesson {
   _id: string;
   title: { [key: string]: string };
   description: { [key: string]: string };
   image: string;
   videoLink: string;
   difficulty: "beginner" | "intermediate" | "advanced";
   category: string;
   duration: string;
   studentsJoined: number;
}

export default function LessonsClient() {
   const t = useTranslations("LessonsPage");
   const locale = useLocale();

   const [lessons, setLessons] = useState<Lesson[]>([]);
   const [loading, setLoading] = useState(true);

   // FETCH LESSONS
   useEffect(() => {
      fetch('/api/lessons')
         .then(res => res.json())
         .then(data => {
            if (Array.isArray(data)) setLessons(data);
         })
         .catch(err => console.error(err))
         .finally(() => setLoading(false));
   }, []);

   const getDifficultyColor = (level: string) => {
      switch (level) {
         case 'beginner': return "bg-sky-50 text-sky-600 border border-sky-100";
         case 'intermediate': return "bg-blue-50 text-blue-600 border border-blue-100";
         case 'advanced': return "bg-indigo-50 text-indigo-600 border border-indigo-100";
         default: return "bg-slate-50 text-slate-600 border border-slate-100";
      }
   };

   const getDifficultyIcon = (level: string) => {
      switch (level) {
         case 'beginner': return <Sparkles size={10} />;
         case 'intermediate': return <TrendingUp size={10} />;
         case 'advanced': return <GraduationCap size={10} />;
         default: return null;
      }
   };

   if (loading) {
      return (
         <div className="min-h-screen flex items-center justify-center bg-white">
            <Loader2 className="animate-spin text-sky-500" size={40} />
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-sky-100 selection:text-sky-900 pb-20">

         {/* ─── HERO SECTION ─── */}
         <section className="relative pt-28 pb-16 px-6 overflow-hidden">
            {/* Subtle background */}
            <div className="absolute inset-0 pointer-events-none">
               <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-sky-50 rounded-full blur-[120px] opacity-60" />
               <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-blue-50 rounded-full blur-[120px] opacity-40" />
               <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:28px_28px] opacity-25" />
            </div>

            <div className="max-w-4xl mx-auto relative z-10 text-center">
               <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 border border-sky-100 text-sky-600 shadow-sm mb-5"
               >
                  <BookOpen size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{t("badge")}</span>
               </motion.div>

               <motion.h1
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  className="text-3xl sm:text-4xl md:text-[3rem] font-extrabold text-slate-900 mb-4 tracking-tight leading-tight"
               >
                  {t("heroTitle")}{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-sky-600">
                     {t("heroTitleHighlight")}
                  </span>
               </motion.h1>

               <motion.p
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="text-base text-slate-500 max-w-lg mx-auto font-medium leading-relaxed"
               >
                  {t("heroDesc")}
               </motion.p>

               {/* Quick stats */}
               <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="flex flex-wrap justify-center gap-6 mt-8"
               >
                  {[
                     { icon: <BookOpen size={16} />, label: `${lessons.length} ${locale === 'mn' ? 'Хичээл' : 'Courses'}` },
                     { icon: <Globe size={16} />, label: locale === 'mn' ? 'Олон хэл' : 'Multi-language' },
                     { icon: <GraduationCap size={16} />, label: locale === 'mn' ? 'Гэрчилгээтэй' : 'Certified' },
                  ].map((stat, i) => (
                     <div key={i} className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                        <span className="text-sky-500">{stat.icon}</span>
                        {stat.label}
                     </div>
                  ))}
               </motion.div>
            </div>
         </section>

         {/* ─── LESSONS GRID ─── */}
         <section className="px-6 py-8">
            <div className="max-w-6xl mx-auto">
               {lessons.length > 0 ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                     {lessons.map((lesson, idx) => {
                        const titleText = lesson.title[locale] || lesson.title["en"];
                        const descText = lesson.description[locale] || lesson.description["en"];
                        return (
                           <motion.div
                              key={lesson._id}
                              initial={{ opacity: 0, y: 16 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.08 }}
                              className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-sky-200 hover:shadow-lg hover:shadow-sky-50 transition-all flex flex-col"
                           >
                              {/* Thumbnail */}
                              <div className="relative aspect-video overflow-hidden">
                                 <Image
                                    src={lesson.image}
                                    alt={titleText}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    unoptimized
                                 />
                                 <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/30 transition-colors flex items-center justify-center">
                                    <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-sky-500 shadow-lg scale-0 group-hover:scale-100 transition-transform duration-400">
                                       <Play fill="currentColor" size={20} />
                                    </div>
                                 </div>
                                 <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-slate-700 text-[10px] font-bold uppercase tracking-wider shadow-sm">
                                    {t(`category.${lesson.category}`)}
                                 </span>
                              </div>

                              {/* Content */}
                              <div className="p-5 flex-1 flex flex-col">
                                 <div className="flex items-center justify-between mb-3">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getDifficultyColor(lesson.difficulty)}`}>
                                       {getDifficultyIcon(lesson.difficulty)}
                                       {t(`difficulty.${lesson.difficulty}`)}
                                    </span>
                                    <span className="flex items-center gap-1 text-xs font-medium text-slate-400">
                                       <Clock size={12} /> {lesson.duration}
                                    </span>
                                 </div>

                                 <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-sky-600 transition-colors leading-snug">
                                    {titleText}
                                 </h3>
                                 <p className="text-slate-500 text-sm mb-5 line-clamp-2 leading-relaxed">
                                    {descText}
                                 </p>

                                 <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                       <div className="flex -space-x-1.5">
                                          {[1, 2, 3].map(i => (
                                             <div key={i} className="w-5 h-5 rounded-full border-2 border-white bg-sky-100" />
                                          ))}
                                       </div>
                                       <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                          <Users size={10} /> {lesson.studentsJoined} {t("joined")}
                                       </span>
                                    </div>
                                    <Link
                                       href={lesson.videoLink}
                                       target="_blank"
                                       className="flex items-center gap-1.5 text-sky-500 font-bold uppercase tracking-wider text-[11px] hover:gap-2.5 transition-all"
                                    >
                                       {t("joinClass")} <ArrowRight size={12} />
                                    </Link>
                                 </div>
                              </div>
                           </motion.div>
                        );
                     })}
                  </div>
               ) : (
                  /* Empty State */
                  <div className="text-center py-20 bg-sky-50/50 rounded-2xl border border-dashed border-sky-200">
                     <div className="w-16 h-16 bg-sky-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <BookOpen size={28} className="text-sky-400" />
                     </div>
                     <p className="text-slate-500 font-medium text-sm">{t("noLessons")}</p>
                     <p className="text-slate-400 text-xs mt-1">{locale === 'mn' ? 'Удахгүй нэмэгдэнэ' : 'Coming soon — stay tuned!'}</p>
                  </div>
               )}
            </div>
         </section>

      </div>
   );
}