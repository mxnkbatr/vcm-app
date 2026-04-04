"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Link } from "@/navigation";
import {
   Search,
   ArrowRight,
   Mail,
   Clock,
   User,
   Loader2,
   Newspaper
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";

// --- TYPES ---
interface Post {
   _id: string;
   title: { [key: string]: string };
   excerpt: { [key: string]: string };
   author: string;
   date: string;
   image: string;
   category: string;
   slug: string;
}

export default function NewsClient() {
   const t = useTranslations("NewsPage");
   const locale = useLocale();

   const [posts, setPosts] = useState<Post[]>([]);
   const [loading, setLoading] = useState(true);
   const [searchQuery, setSearchQuery] = useState("");

   // FETCH BLOG POSTS
   useEffect(() => {
      fetch('/api/posts')
         .then(res => res.json())
         .then(data => {
            if (Array.isArray(data)) setPosts(data);
         })
         .catch(err => console.error(err))
         .finally(() => setLoading(false));
   }, []);

   const filteredPosts = posts.filter(post => {
      const title = post.title[locale] || post.title["en"] || "";
      return title.toLowerCase().includes(searchQuery.toLowerCase());
   });

   const featuredPost = filteredPosts[0];
   const remainingPosts = filteredPosts.slice(1);

   if (loading) {
      return (
         <div className="min-h-screen flex items-center justify-center bg-white">
            <Loader2 className="animate-spin text-sky-500" size={40} />
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-sky-100 selection:text-sky-900 pb-20">

         {/* ─── 1. HERO / FEATURED ─── */}
         <section className="relative pt-28 pb-14 px-6 overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 pointer-events-none">
               <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-sky-50 rounded-full blur-[120px] opacity-50" />
               <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-blue-50 rounded-full blur-[120px] opacity-40" />
               <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:28px_28px] opacity-25" />
            </div>

            <div className="max-w-5xl mx-auto relative z-10">
               <div className="text-center mb-12">
                  <motion.div
                     initial={{ opacity: 0, y: 14 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 border border-sky-100 text-sky-600 shadow-sm mb-5"
                  >
                     <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                     <span className="text-[10px] font-bold uppercase tracking-widest">{t("badge")}</span>
                  </motion.div>
                  <motion.h1
                     initial={{ opacity: 0, y: 14 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.1 }}
                     className="text-3xl sm:text-4xl md:text-[3rem] font-extrabold text-slate-900 tracking-tight leading-tight"
                  >
                     {t("heroTitle")}{" "}
                     <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-sky-600">
                        {t("heroTitleHighlight")}
                     </span>
                  </motion.h1>
               </div>

               {featuredPost && (
                  <motion.div
                     initial={{ opacity: 0, y: 16 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.2 }}
                     className="relative aspect-[21/9] rounded-2xl overflow-hidden group shadow-lg"
                  >
                     <Image
                        src={featuredPost.image}
                        alt={featuredPost.title[locale] || featuredPost.title["en"]}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                     <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full md:w-2/3">
                        <span className="inline-block px-3 py-1 rounded-full bg-sky-500 text-white text-[10px] font-bold uppercase tracking-wider mb-3">
                           {featuredPost.category}
                        </span>
                        <h2 className="text-xl md:text-3xl font-bold text-white mb-4 leading-snug">
                           {featuredPost.title[locale] || featuredPost.title["en"]}
                        </h2>
                        <Link
                           href={`/news/${featuredPost.slug}`}
                           className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-sm hover:bg-sky-500 hover:text-white transition-all"
                        >
                           {t("featured")} <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                        </Link>
                     </div>
                  </motion.div>
               )}
            </div>
         </section>

         {/* ─── 2. SEARCH & FEED ─── */}
         <section className="py-12 px-6">
            <div className="max-w-5xl mx-auto">

               <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
                  <h3 className="text-xl font-bold text-slate-900">{t("searchTitle")}</h3>
                  <div className="w-full md:w-80 relative group">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" size={16} />
                     <input
                        type="text"
                        placeholder={t("searchPlaceholder")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-5 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-300 transition-all text-sm font-medium"
                     />
                  </div>
               </div>

               <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence>
                     {remainingPosts.map((post, idx) => {
                        const titleText = post.title[locale] || post.title["en"];
                        const excerptText = post.excerpt[locale] || post.excerpt["en"];
                        return (
                           <motion.article
                              key={post._id}
                              initial={{ opacity: 0, y: 16 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.08 }}
                              className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-sky-200 hover:shadow-lg hover:shadow-sky-50 transition-all flex flex-col"
                           >
                              <div className="relative aspect-[4/3] overflow-hidden">
                                 <Image
                                    src={post.image}
                                    alt={titleText}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                 />
                                 <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-sky-600 text-[10px] font-bold uppercase tracking-wider shadow-sm">
                                    {post.category}
                                 </span>
                              </div>
                              <div className="p-5 flex-1 flex flex-col">
                                 <div className="flex items-center gap-3 text-xs font-medium text-slate-400 mb-3">
                                    <span className="flex items-center gap-1"><Clock size={12} /> {new Date(post.date).toLocaleDateString(locale)}</span>
                                    <span className="flex items-center gap-1"><User size={12} /> {post.author}</span>
                                 </div>
                                 <h4 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-sky-600 transition-colors leading-snug line-clamp-2">
                                    {titleText}
                                 </h4>
                                 <p className="text-slate-500 text-sm mb-4 line-clamp-2 leading-relaxed">
                                    {excerptText}
                                 </p>
                                 <Link
                                    href={`/news/${post.slug}`}
                                    className="mt-auto inline-flex items-center gap-1.5 text-sky-500 font-bold uppercase tracking-wider text-[11px] hover:gap-2.5 transition-all"
                                 >
                                    {t("readMore")} <ArrowRight size={12} />
                                 </Link>
                              </div>
                           </motion.article>
                        );
                     })}
                  </AnimatePresence>
               </div>

               {filteredPosts.length === 0 && (
                  <div className="text-center py-20 bg-sky-50/50 rounded-2xl border border-dashed border-sky-200">
                     <div className="w-14 h-14 bg-sky-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Newspaper size={24} className="text-sky-400" />
                     </div>
                     <p className="text-slate-500 font-medium text-sm">{locale === 'mn' ? 'Мэдээлэл олдсонгүй' : 'No posts found'}</p>
                  </div>
               )}
            </div>
         </section>

         {/* ─── 3. NEWSLETTER CTA ─── */}
         <section className="py-16 px-6">
            <div className="max-w-3xl mx-auto">
               <div className="relative rounded-2xl bg-gradient-to-br from-sky-50 via-white to-sky-50 p-8 md:p-12 overflow-hidden shadow-sm border border-sky-100">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-sky-100/40 rounded-bl-full" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-sky-100/30 rounded-tr-full" />

                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                     <div className="text-center md:text-left space-y-2">
                        <h2 className="text-xl md:text-2xl font-bold text-slate-800">{t("newsletterTitle")}</h2>
                        <p className="text-slate-500 text-sm font-medium max-w-sm">
                           {t("newsletterDesc")}
                        </p>
                     </div>
                     <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2.5">
                        <div className="relative">
                           <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                           <input
                              type="email"
                              placeholder={t("emailPlaceholder")}
                              className="w-full sm:w-72 pl-11 pr-5 py-3 rounded-xl bg-white border border-slate-200 text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-300"
                           />
                        </div>
                        <button className="px-6 py-3 rounded-xl bg-sky-500 text-white font-bold text-xs uppercase tracking-wider hover:bg-sky-600 transition-all shadow-md shadow-sky-200 active:scale-95">
                           {t("register")}
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         </section>

      </div>
   );
}