"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
   motion,
   AnimatePresence
} from "framer-motion";
import {
   FaVideo,
   FaArrowRight,
   FaBullhorn,
   FaUserFriends,
   FaCalendarAlt
} from "react-icons/fa";
import { Clock, MapPin, Filter, Loader2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

// --- TYPES ---
interface EventItem {
   _id: string;
   title: { [key: string]: string };
   description: { [key: string]: string };
   date: string;
   timeString: string;
   location: { [key: string]: string };
   image: string;
   category: string;
   status: string;
   link?: string;
}

export default function EventsClient() {
   const t = useTranslations("EventsPage");
   const locale = useLocale();

   const [activeFilter, setActiveFilter] = useState("all");
   const containerRef = useRef(null);

   const [events, setEvents] = useState<EventItem[]>([]);
   const [loading, setLoading] = useState(true);

   // Categories for filtering
   const CATEGORIES = ["all", "campaign", "workshop", "meeting", "fundraiser"];

   useEffect(() => {
      const fetchEvents = async () => {
         try {
            const res = await fetch("/api/events");
            if (res.ok) {
               const data = await res.json();
               setEvents(data);
            }
         } catch (error) {
            console.error("Failed to fetch events", error);
         } finally {
            setLoading(false);
         }
      };
      fetchEvents();
   }, []);

   const getTagColor = (category: string) => {
      switch (category) {
         case "campaign": return "bg-sky-100 text-sky-600";
         case "meeting": return "bg-blue-100 text-blue-600";
         case "workshop": return "bg-indigo-100 text-indigo-600";
         default: return "bg-slate-100 text-slate-500";
      }
   };

   const filteredEvents = activeFilter === "all"
      ? events
      : events.filter(e => e.category === activeFilter);

   if (loading) {
      return (
         <div className="min-h-[100dvh] flex items-center justify-center bg-white">
            <Loader2 className="animate-spin text-sky-500" size={48} />
         </div>
      );
   }

   return (
      <div ref={containerRef} className="min-h-[100dvh] bg-white text-slate-800 font-sans selection:bg-sky-100 selection:text-sky-900 overflow-hidden pb-20">

         {/* ─── 1. HERO SECTION ─── */}
         <section className="relative pt-28 pb-14 px-6 overflow-hidden z-10 text-center">
            {/* Ambient Background */}
            <div className="absolute inset-0 pointer-events-none z-0">
               <div className="absolute top-[-5%] right-[-5%] w-[500px] h-[500px] bg-sky-50 rounded-full blur-[120px] opacity-50" />
               <div className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] bg-blue-50 rounded-full blur-[120px] opacity-50" />
               <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px] opacity-30" />
            </div>

            <div className="max-w-5xl mx-auto relative z-10">
               <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
               >
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 border border-sky-100 text-sky-600 shadow-sm mb-5">
                     <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                     <span className="text-[10px] font-bold uppercase tracking-widest">{t("upcoming")}</span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl md:text-[3.25rem] font-extrabold mb-4 leading-tight tracking-tight text-slate-900">
                     {t("heroTitle")}{" "}
                     <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-sky-600">{t("heroTitleHighlight")}</span>
                  </h1>
                  <p className="text-base text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
                     {t("heroDesc")}
                  </p>
               </motion.div>
            </div>
         </section>

         {/* ─── 2. FILTER & EVENTS GRID ─── */}
         <section className="py-10 px-6 relative z-10">
            <div className="max-w-6xl mx-auto">

               {/* Filters */}
               <div className="flex flex-wrap justify-center gap-2.5 mb-10">
                  {CATEGORIES.map((cat) => (
                     <button
                        key={cat}
                        onClick={() => setActiveFilter(cat)}
                        className={`px-5 py-2.5 rounded-full font-bold text-[11px] uppercase tracking-wider transition-all border ${activeFilter === cat
                           ? "bg-sky-500 border-sky-500 text-white shadow-md shadow-sky-200 scale-[1.03]"
                           : "bg-white border-slate-200 text-slate-500 hover:border-sky-300 hover:text-sky-600"
                           }`}
                     >
                        {t(`categories.${cat}`)}
                     </button>
                  ))}
               </div>

               {/* Grid */}
               <motion.div
                  layout
                  className="grid md:grid-cols-2 gap-6"
               >
                  <AnimatePresence mode="popLayout">
                     {filteredEvents.map((event) => {
                        const dateObj = new Date(typeof event.date === "string" ? event.date.replace(/-/g, "/") : event.date);
                        const month = dateObj.toLocaleDateString(locale, { month: "short" }).toUpperCase();
                        const day = dateObj.getDate();
                        const categoryLabel = t(`categories.${event.category}`);
                        const locationText = event.location[locale] || event.location["en"];
                        const titleText = event.title[locale] || event.title["en"];

                        const isOnline = locationText.toLowerCase().includes("online");
                        const isFull = event.status === "past" || event.status === "cancelled";

                        return (
                           <motion.div
                              key={event._id}
                              layout
                              initial={{ opacity: 0, y: 16 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:border-sky-200 hover:shadow-lg hover:shadow-sky-50 transition-all group"
                           >
                              <div className="flex flex-col sm:flex-row h-full gap-5">

                                 {/* Image & Date Badge */}
                                 <div className="w-full sm:w-48 h-48 sm:h-auto relative shrink-0 rounded-xl overflow-hidden">
                                    <div className="absolute top-3 left-3 z-20 bg-white/95 backdrop-blur-sm shadow-md rounded-xl px-3.5 py-2 text-center border border-sky-50">
                                       <span className="block text-[10px] font-bold text-sky-500 uppercase tracking-tight">{month}</span>
                                       <span className="block text-xl font-extrabold text-slate-800 leading-none">{day}</span>
                                    </div>
                                    <Image
                                       src={event.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80"}
                                       alt={titleText}
                                       fill
                                       className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                 </div>

                                 {/* Content */}
                                 <div className="flex-1 py-2 flex flex-col justify-between">
                                    <div className="space-y-3">
                                       <div className="flex items-center gap-2 flex-wrap">
                                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getTagColor(event.category)}`}>
                                             {categoryLabel}
                                          </span>
                                          {isOnline ? (
                                             <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                                                <FaVideo className="text-sky-500" size={10} /> {t("online")}
                                             </span>
                                          ) : (
                                             <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                                                <FaUserFriends className="text-sky-500" size={10} /> {t("inPerson")}
                                             </span>
                                          )}
                                       </div>
                                       <h3 className="text-lg font-bold text-slate-900 leading-snug group-hover:text-sky-600 transition-colors">
                                          {titleText}
                                       </h3>
                                       <div className="space-y-1.5">
                                          <p className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                                             <Clock size={14} className="text-sky-500" /> {event.timeString}
                                          </p>
                                          <p className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                                             <MapPin size={14} className="text-sky-500" /> {locationText}
                                          </p>
                                       </div>
                                    </div>

                                    <div className="mt-5 flex items-center justify-between pt-4 border-t border-slate-100">
                                       <span className={`text-[10px] font-bold uppercase tracking-wider ${isFull ? "text-slate-300" : "text-sky-500"}`}>
                                          {isFull ? t("regClosed") : t("regOpen")}
                                       </span>
                                       <a
                                          href={event.link || "#"}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${isFull
                                             ? "bg-slate-50 text-slate-300 cursor-not-allowed"
                                             : "bg-sky-500 text-white hover:bg-sky-600 hover:shadow-lg hover:shadow-sky-200"
                                             }`}
                                       >
                                          {isFull ? t("full") : t("register")} {!isFull && <FaArrowRight size={10} />}
                                       </a>
                                    </div>
                                 </div>
                              </div>
                           </motion.div>
                        );
                     })}
                  </AnimatePresence>
               </motion.div>
            </div>
         </section>

         {/* ─── 3. NEWSLETTER CTA ─── */}
         <section className="py-16 px-6">
            <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-sky-50 via-white to-sky-50 rounded-2xl p-8 md:p-12 shadow-sm border border-sky-100 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-48 h-48 bg-sky-100/40 rounded-bl-full" />
               <div className="absolute bottom-0 left-0 w-24 h-24 bg-sky-100/30 rounded-tr-full" />

               <div className="relative z-10 text-center space-y-4">
                  <div className="w-12 h-12 bg-sky-100 text-sky-500 rounded-xl flex items-center justify-center text-xl mx-auto mb-4">
                     <FaBullhorn />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-800 leading-snug">
                     {t("newsletterTitle")}{" "}
                     <span className="text-sky-500">{t("newsletterTitleHighlight")}</span>
                  </h2>
                  <p className="text-slate-500 text-sm font-medium max-w-sm mx-auto">
                     {t("newsletterDesc")}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto pt-4">
                     <input
                        type="email"
                        placeholder={t("emailPlaceholder")}
                        className="flex-1 px-5 py-3 rounded-xl text-sm text-slate-800 font-medium bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-300"
                     />
                     <button className="px-6 py-3 rounded-xl bg-sky-500 text-white font-bold text-xs uppercase tracking-wider hover:bg-sky-600 transition-all shadow-md shadow-sky-200 active:scale-95">
                        {t("joinBtn")}
                     </button>
                  </div>
               </div>
            </div>
         </section>

      </div>
   );
}