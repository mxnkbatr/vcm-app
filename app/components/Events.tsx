"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  ArrowUpRight, 
  Clock, 
  MapPin, 
  Loader2,
  ChevronRight,
  BookOpen,
  User,
  PlayCircle
} from "lucide-react";
import { 
  motion, 
  useMotionValue, 
  useSpring, 
  useTransform, 
  AnimatePresence 
} from "framer-motion";
import { useTheme } from "next-themes";
// Mock context if not available
// import { useLanguage } from "../context/LanguageContext";
const useLanguage = () => ({ language: "mn" as "mn" | "en" });

// --- CONFIG & BRAND ---
const BRAND = {
  RED: "#E31B23",
  RED_SOFT: "rgba(227, 27, 35, 0.2)",
  GREEN: "#00C896",
  GREEN_SOFT: "rgba(0, 200, 150, 0.2)",
  DARK: "#0F172A", // Slate 900
};

const TABS = [
  { id: 'blogs', en: 'News & Blogs', mn: 'Мэдээлэл' },
  { id: 'events', en: 'Events', mn: 'Арга Хэмжээ' },
];

const EVENT_CATEGORIES = [
  { id: 'all', en: 'All Events', mn: 'Бүгд' },
  { id: 'campaign', en: 'Campaigns', mn: 'Аяны Ажил' },
  { id: 'workshop', en: 'Workshops', mn: 'Сургалт' },
  { id: 'fundraiser', en: 'Fundraisers', mn: 'Хандив' },
];

const BLOG_CATEGORIES = [
  { id: 'all', en: 'All Posts', mn: 'Бүгд' },
  { id: 'tips', en: 'Guides & Tips', mn: 'Зөвлөгөө' },
  { id: 'vlog', en: 'Vlogs', mn: 'Влог' },
  { id: 'news', en: 'Company News', mn: 'Мэдээ' },
];

// --- SUB-COMPONENT: BRANDED CARD ---
const ContentCard = ({ item, lang, isDark, isMobile, type }: any) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 15 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return;
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleMouseLeave = () => { x.set(0); y.set(0); };

  // Calculate date client-side to avoid hydration mismatch
  const [dateObj, setDateObj] = useState({ day: "00", month: "..." });

  useEffect(() => {
     if (item.date) {
        const d = new Date(item.date);
        setDateObj({
           day: d.getDate().toString().padStart(2, '0'),
           month: d.toLocaleDateString(lang === 'mn' ? 'mn-MN' : 'en-US', { month: 'short' }).toUpperCase()
        });
     }
  }, [item.date, lang]);

  const isBlog = type === 'blogs';
  const authorName = typeof item.author === 'string' ? item.author : (item.author?.[lang] || item.author?.en);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      style={{ 
        rotateX: isMobile ? 0 : rotateX, 
        rotateY: isMobile ? 0 : rotateY, 
        transformStyle: "preserve-3d" 
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`
        relative group rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden cursor-pointer h-full min-h-[400px] border transition-all duration-500
        ${isDark 
          ? "bg-slate-900/50 border-white/5 shadow-none hover:bg-slate-800" 
          : "bg-white border-slate-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_25px_50px_-12px_rgba(227,27,35,0.15)]"
        }
      `}
    >
      {/* --- IMAGE SECTION --- */}
      <div className="absolute inset-0 h-full w-full pointer-events-none">
        <Image 
          src={item.image || "/logo.jpg"} 
          alt={item.title[lang] || "Content"} 
          fill 
          className="object-cover transition-transform duration-700 sm:group-hover:scale-110 opacity-100"
        />

        {/* Gradient Overlay - Stronger at bottom for text readability */}
        <div className={`absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-80 sm:group-hover:opacity-90 transition-opacity`} />
        
        {/* Play Button for Vlogs */}
        {item.category === 'vlog' && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 group-hover:scale-110 transition-transform duration-300">
             <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40 shadow-xl">
                 <PlayCircle className="w-8 h-8 text-white fill-white/20" />
             </div>
          </div>
        )}
      </div>

      {/* --- FLOATING DATE --- */}
      <div className="absolute top-6 left-6 z-20 flex flex-col items-center justify-center rounded-2xl w-14 h-16 bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg">
        <span className="text-xl font-black leading-none">{dateObj.day}</span>
        <span className="text-[9px] font-bold uppercase tracking-widest opacity-80">{dateObj.month}</span>
      </div>

      {/* --- CONTENT DETAILS --- */}
      <div className="absolute bottom-0 left-0 w-full p-8 z-20 flex flex-col justify-end h-full pointer-events-none">
        <div className="transform transition-transform duration-500 sm:group-hover:-translate-y-2 pointer-events-auto">
           
           {/* Tags / Metadata */}
           <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-white border border-white/20 backdrop-blur-md"
                style={{ backgroundColor: BRAND.GREEN_SOFT }}
              >
                {item.category}
              </span>

              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                 {isBlog ? (
                    <><User size={12} style={{ color: BRAND.RED }} /> {authorName}</>
                 ) : (
                    <><MapPin size={12} style={{ color: BRAND.RED }} /> {item.location?.[lang] || item.location?.en || 'Online'}</>
                 )}
              </span>
           </div>

           {/* Title */}
           <h3 className="text-2xl font-black leading-none tracking-tight mb-3 text-white line-clamp-2 group-hover:text-red-400 transition-colors">
             {item.title[lang] || item.title.en}
           </h3>
           
           {/* Time or Read Time */}
           <div className="text-xs font-bold flex items-center gap-2 mb-4 text-slate-400">
              {isBlog ? (
                <> <BookOpen size={14} style={{ color: BRAND.GREEN }} /> {item.readTime || "5 min read"} </>
              ) : (
                <> <Clock size={14} style={{ color: BRAND.GREEN }} /> {item.timeString} </>
              )}
           </div>
        </div>

        {/* Read More Button */}
        <div className="h-0 overflow-hidden sm:group-hover:h-auto sm:group-hover:pb-1 transition-all duration-500 opacity-0 sm:group-hover:opacity-100 pointer-events-auto">
           <div className="w-full h-[1px] bg-white/20 mb-4" />
           <Link href={`/${isBlog ? 'news' : 'events'}/${item._id}`} className="flex items-center gap-2 font-black uppercase tracking-widest text-[10px] text-white hover:gap-4 transition-all">
              {lang === 'mn' ? 'Дэлгэрэнгүй' : 'Read More'} 
              <span className="p-1.5 rounded-full text-white shadow-lg" style={{ backgroundColor: BRAND.RED }}>
                <ArrowUpRight size={10} />
              </span>
           </Link>
        </div>
      </div>
    </motion.div>
  );
};

// --- MAIN SECTION ---
export default function LatestUpdatesSection() {
  const { language: lang } = useLanguage();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'events' | 'blogs'>('blogs');
  const [filter, setFilter] = useState("all");
  
  const [events, setEvents] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  
  // Theme check
  const isDark = mounted && (theme === 'dark');

  // Fetch Events & Blogs
  useEffect(() => {
    async function fetchData() {
        try {
            const [eventsRes, blogsRes] = await Promise.all([
                fetch('/api/events'),
                fetch('/api/news')
            ]);
            
            if (eventsRes.ok) {
                const data = await eventsRes.json();
                setEvents(data);
            }
            if (blogsRes.ok) {
                const data = await blogsRes.json();
                // Map blog data to match component expectation
                const mappedBlogs = data.map((blog: any) => ({
                    ...blog,
                    date: blog.publishedDate,
                    category: blog.tags?.[0] || 'General',
                    readTime: "3 min read" // Placeholder as we don't have this in DB yet
                }));
                setBlogs(mappedBlogs);
            }
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    }
    fetchData();
  }, []);

  const displayedItems = activeTab === 'events' ? events : blogs;
  const categories = activeTab === 'events' ? EVENT_CATEGORIES : BLOG_CATEGORIES;
  const filteredItems = displayedItems.filter(item => filter === 'all' || item.category === filter);

  if (!mounted) return null;

  return (
    <section className={`relative py-24 px-6 overflow-hidden transition-colors duration-700 
      ${isDark ? "bg-slate-950" : "bg-slate-50"}`
    }>
      
      {/* --- BACKGROUND EFFECTS --- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
         {/* Noise Texture */}
         <div className="absolute inset-0 opacity-[0.04] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay z-0" />
         
         {/* Brand Red Blob */}
         <motion.div 
           animate={{ 
             scale: [1, 1.2, 1], 
             opacity: [0.1, 0.2, 0.1],
             x: [0, 50, 0]
           }}
           transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
           className="absolute -top-[10%] -right-[10%] w-[800px] h-[800px] rounded-full blur-[120px] mix-blend-multiply" 
           style={{ backgroundColor: isDark ? 'rgba(227, 27, 35, 0.1)' : 'rgba(227, 27, 35, 0.05)' }}
         />
         
         {/* Brand Green Blob */}
         <motion.div 
           animate={{ 
             scale: [1, 1.1, 1], 
             opacity: [0.1, 0.15, 0.1],
             x: [0, -30, 0]
            }}
           transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1 }}
           className="absolute -bottom-[10%] -left-[10%] w-[600px] h-[600px] rounded-full blur-[120px] mix-blend-multiply" 
           style={{ backgroundColor: isDark ? 'rgba(0, 200, 150, 0.1)' : 'rgba(0, 200, 150, 0.05)' }}
         />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10 mb-16">
           
           <div className="space-y-8">
              {/* Tabs */}
              <div className={`inline-flex p-1.5 rounded-full border backdrop-blur-md
                  ${isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-sm"}`}>
                  {TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id as any); setFilter('all'); }}
                        className={`relative px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all z-10
                          ${isActive 
                            ? "text-white"
                            : (isDark ? "text-slate-400 hover:text-white" : "text-slate-400 hover:text-slate-900")
                          }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeContentTab"
                            className="absolute inset-0 rounded-full -z-10 shadow-lg"
                            style={{ backgroundColor: BRAND.RED }} 
                          />
                        )}
                        {tab[lang]}
                      </button>
                    )
                  })}
              </div>

              {/* Title */}
              <div className="relative">
                <motion.h2 
                   key={activeTab} 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className={`text-4xl sm:text-6xl font-black tracking-tighter leading-[0.9]
                      ${isDark ? "text-white" : "text-slate-900"}`}
                >
                   {activeTab === 'events' 
                      ? (lang === 'mn' ? 'Арга Хэмжээ' : 'Upcoming Events')
                      : (lang === 'mn' ? 'Мэдээлэл' : 'Latest Insights')
                   }
                   <span style={{ color: BRAND.GREEN }}>.</span>
                </motion.h2>
              </div>
           </div>

           {/* --- CATEGORY FILTERS --- */}
           <motion.div 
              layout
              className={`flex overflow-x-auto pb-2 xl:pb-0 gap-2 scrollbar-hide`}
           >
              {categories.map((cat) => {
                const isActive = filter === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setFilter(cat.id)}
                    className={`
                       relative whitespace-nowrap px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all flex-shrink-0 border
                       ${isActive 
                         ? "text-white border-transparent" 
                         : (isDark ? "text-slate-400 border-white/10 hover:border-white/30" : "text-slate-500 border-slate-200 hover:border-slate-300 bg-white")}
                    `}
                    style={{ backgroundColor: isActive ? BRAND.GREEN : 'transparent' }}
                  >
                    {cat[lang]}
                  </button>
                )
              })}
           </motion.div>
        </div>

        {/* --- GRID CONTENT --- */}
        <div className="min-h-[400px]">
            {loading ? (
                <div className="h-60 flex items-center justify-center">
                   <Loader2 className="animate-spin text-red-500" size={40} />
                </div>
            ) : filteredItems.length > 0 ? (
                <motion.div 
                  layout
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                <AnimatePresence mode="popLayout">
                    {filteredItems.map((item) => (
                        <ContentCard 
                           key={item._id} 
                           item={item} 
                           lang={lang} 
                           isDark={isDark} 
                           isMobile={isMobile}
                           type={activeTab} 
                        />
                    ))}
                </AnimatePresence>
                </motion.div>
            ) : (
                <div className="flex flex-col items-center justify-center py-32 rounded-[3rem] border-2 border-dashed bg-slate-50/50" 
                     style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#CBD5E1' }}>
                    <div className="p-4 bg-slate-100 rounded-full mb-4">
                        <Clock size={32} className="text-slate-400" />
                    </div>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No items found.</p>
                </div>
            )}
        </div>

        {/* --- FOOTER CTA --- */}
        <motion.div 
           initial={{ opacity: 0 }}
           whileInView={{ opacity: 1 }}
           viewport={{ once: true }}
           className="mt-24 flex justify-center"
        >
           <Link href={activeTab === 'events' ? '/events' : '/news'} className="group relative inline-flex items-center gap-6">
              <span className={`text-xs font-black uppercase tracking-[0.25em] transition-colors
                 ${isDark ? "text-slate-400 group-hover:text-white" : "text-slate-500 group-hover:text-slate-900"}`}>
                  {activeTab === 'events' 
                    ? (lang === 'mn' ? 'Бүх арга хэмжээг харах' : 'View All Events')
                    : (lang === 'mn' ? 'Бүх нийтлэлийг унших' : 'View All Posts')
                  }
              </span>
              <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-[-45deg] text-white shadow-xl hover:shadow-2xl`}
                   style={{ backgroundColor: BRAND.RED }}>
                 <ArrowUpRight size={20} />
              </div>
           </Link>
        </motion.div>

      </div>
    </section>
  );
}