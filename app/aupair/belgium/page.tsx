"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  motion, 
  useScroll, 
  useSpring,
  Variants
} from "framer-motion";
import { 
  FaGlobeEurope, 
  FaGraduationCap, 
  FaBaby, 
  FaBroom, 
  FaMoneyBillWave, 
  FaClock,
  FaPlaneDeparture,
  FaGem,
  FaLandmark,
  FaUtensils,
  FaPalette,
  FaHandshake
} from "react-icons/fa";
import { Clock } from "lucide-react";

// --- DATA ---
const DATA = {
  hero: {
    title: "Бельги Улс",
    highlight: "Таны Дараагийн Гэр",
    sub: "Европын зүрхэнд, амтат шоколад, түүхэн соёлын дунд зочин гэр бүлтэйгээ нэгдээрэй.",
    cta: "Аяллаа Эхлүүлэх"
  },
  // FIXED: Grouped stats and description under belgiumInfo
  belgiumInfo: {
    title: "Бельги Улсын Тухай",
    desc: "Баруун Европын төвд оршдог, 11 сая хүн амтай, Франц, Голланд, Герман гэсэн 3 хэлтэй олон соёлт улс. Нийслэл Брюссель нь Европын Холбооны төв бөгөөд олон улсын байгууллагууд төвлөрсөн улс төр, эдийн засгийн зангилаа юм.",
    stats: [
        { label: "Нийслэл", val: "Брюссель", icon: FaLandmark, color: "text-blue-600 bg-blue-100" },
        { label: "Ажлын Цаг", val: "20 Цаг/7хоног", icon: FaClock, color: "text-yellow-600 bg-yellow-100" },
        { label: "Хэл", val: "3 Төрөл", icon: FaGlobeEurope, color: "text-red-600 bg-red-100" },
    ]
  },
  culture: [
    { name: "Европын Зүрх", desc: "EU Capital", icon: FaGlobeEurope, bg: "bg-blue-500" },
    { name: "Амттаны Диваажин", desc: "Waffles & Chocolate", icon: FaUtensils, bg: "bg-yellow-500" },
    { name: "Түүхэн Үнэт Зүйлс", desc: "Diamonds & Castles", icon: FaGem, bg: "bg-teal-500" },
    { name: "Урлагийн Өлгий", desc: "Art & Comics", icon: FaPalette, bg: "bg-pink-500" },
  ],
  duties: [
    { title: "Хүүхэд Харах", desc: "Тоглох, сургуульд хүргэх, хамтдаа суралцах", icon: FaBaby, color: "from-pink-400 to-rose-500" },
    { title: "Гэрийн Ажил", desc: "Хөнгөн цэвэрлэгээ, жижиг худалдан авалт", icon: FaBroom, color: "from-emerald-400 to-teal-500" },
  ],
  benefits: [
    { title: "20 Цаг Ажиллана", sub: "Европ дахь хамгийн бага цаг", icon: Clock, color: "text-yellow-600" },
    { title: "450€ Халаасны мөнгө", sub: "Сар бүрийн тогтмол орлого", icon: FaMoneyBillWave, color: "text-green-600" },
    { title: "1000€ Сургалтын Бэлэг", sub: "Хэлний курсийн төлбөр", icon: FaGraduationCap, color: "text-blue-600" },
  ],
  schedule: [
    { date: "2025/01/06", time: "10:00", type: "Элсэлт 01", status: "Бүүрнэ" },
    { date: "2025/02/10", time: "17:00", type: "Элсэлт 02", status: "Нээлттэй" },
    { date: "2025/03/15", time: "08:00", type: "Элсэлт 03", status: "Нээлттэй" },
  ]
};

// --- ANIMATIONS ---
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", bounce: 0.4, duration: 0.8 } 
  }
};

export default function BelgiumConnectedPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  
  // Spring physics for smooth scroll tracking
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div ref={containerRef} className="min-h-screen bg-[#FAFAFA] text-slate-800 font-sans overflow-hidden selection:bg-rose-400 selection:text-white">
      
      {/* ─── SCROLL PROGRESS BAR (The Connection Line) ─── */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-400 via-red-500 to-rose-500 origin-left z-50"
        style={{ scaleX }}
      />

      {/* ─── 1. HERO: CONNECTING WORLD ─── */}
      <section className="relative pt-32 pb-24 px-6 min-h-[90vh] flex items-center justify-center overflow-hidden">
         
         {/* Animated Background Blobs */}
         <div className="absolute inset-0 w-full h-full">
            <motion.div 
              animate={{ x: [0, 100, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-yellow-200 rounded-full blur-[100px] opacity-60 mix-blend-multiply" 
            />
            <motion.div 
              animate={{ x: [0, -80, 0], y: [0, 50, 0], scale: [1, 1.3, 1] }}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-rose-200 rounded-full blur-[100px] opacity-60 mix-blend-multiply" 
            />
            <motion.div 
              animate={{ x: [0, 50, 0], y: [0, 50, 0] }}
              transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[40%] left-[30%] w-[400px] h-[400px] bg-blue-200 rounded-full blur-[100px] opacity-60 mix-blend-multiply" 
            />
         </div>

         <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
            
            <motion.div 
              initial="hidden" 
              animate="visible" 
              variants={fadeInUp} 
              className="space-y-8 text-center lg:text-left"
            >
               <motion.div 
                 whileHover={{ scale: 1.05 }}
                 className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/80 backdrop-blur-md border border-white shadow-lg text-slate-600"
               >
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                  </span>
                  <span className="text-xs font-black uppercase tracking-widest">Live in Europe</span>
               </motion.div>

               <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[0.9]">
                  <span className="block text-slate-800">{DATA.hero.title}</span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-orange-500 to-rose-500">
                    {DATA.hero.highlight}
                  </span>
               </h1>
               
               <p className="text-xl text-slate-600 font-medium leading-relaxed max-w-lg mx-auto lg:mx-0">
                  {DATA.hero.sub}
               </p>

               <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                  <Link href="/register">
                    <motion.button 
                      whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(244, 63, 94, 0.4)" }}
                      whileTap={{ scale: 0.95 }}
                      className="px-12 py-5 rounded-[2rem] bg-gradient-to-r from-rose-500 to-orange-500 text-white font-black text-lg shadow-xl flex items-center gap-3 relative overflow-hidden group"
                    >
                       <span className="relative z-10">{DATA.hero.cta}</span>
                       <FaPlaneDeparture className="relative z-10 group-hover:translate-x-1 transition-transform" />
                       <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    </motion.button>
                  </Link>
               </div>
            </motion.div>

            {/* Hero Image Collage with Float Animation */}
            <div className="relative h-[600px] hidden lg:block">
               <motion.div 
                 animate={{ y: [0, -20, 0] }}
                 transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                 className="absolute right-0 top-0 w-[450px] h-[550px]"
               >
                  {/* Main Image */}
                  <div className="w-full h-full bg-white p-4 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/50 backdrop-blur-sm transform rotate-3">
                     <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden">
                        <Image src="https://images.unsplash.com/photo-1549144511-f099e773c147?auto=format&fit=crop&w=800&q=80" alt="Belgium" fill className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-800/40 to-transparent" />
                        <div className="absolute bottom-8 left-8 text-white">
                           <div className="flex items-center gap-2 mb-2">
                              <div className="bg-yellow-400 p-2 rounded-full text-slate-800"><FaHandshake size={14}/></div>
                              <span className="font-bold text-xs uppercase tracking-widest">Family & Friends</span>
                           </div>
                           <h2 className="text-3xl font-black text-white">Connection</h2>
                        </div>
                     </div>
                  </div>

                  {/* Floating Bubble 1: 20 Hours */}
                  <motion.div 
                    animate={{ y: [0, 15, 0], rotate: [0, 5, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute -left-12 top-20 bg-white p-5 rounded-[2rem] shadow-xl border-b-4 border-yellow-400 flex flex-col items-center justify-center w-32 h-32"
                  >
                     <Clock className="text-yellow-500 mb-1" size={24} />
                     <span className="text-3xl font-black text-slate-800">20</span>
                     <span className="text-[10px] font-bold uppercase text-slate-400">Hours/Week</span>
                  </motion.div>

                  {/* Floating Bubble 2: Education */}
                  <motion.div 
                    animate={{ y: [0, -15, 0], rotate: [0, -5, 0] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    className="absolute -right-8 bottom-32 bg-white p-5 rounded-[2rem] shadow-xl border-b-4 border-rose-500 flex items-center gap-3"
                  >
                     <div className="bg-rose-100 p-3 rounded-full text-rose-600">
                        <FaGraduationCap size={20} />
                     </div>
                     <div>
                        <span className="block text-2xl font-black text-slate-800">1000€</span>
                        <span className="block text-[10px] font-bold uppercase text-slate-400">Bonus</span>
                     </div>
                  </motion.div>
               </motion.div>
            </div>
         </div>
      </section>

      {/* ─── 2. INFO STRIP: THE BRIDGE (Updated to use belgiumInfo) ─── */}
      <section className="py-12 bg-white relative z-20">
         <div className="max-w-7xl mx-auto px-6">
            <motion.div 
               initial="hidden" 
               whileInView="visible" 
               variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
               className="grid md:grid-cols-3 gap-6"
            >
               {DATA.belgiumInfo.stats.map((stat, i) => (
                  <motion.div 
                     key={i}
                     variants={fadeInUp}
                     whileHover={{ y: -5, scale: 1.02 }}
                     className={`p-6 rounded-[2rem] flex items-center gap-4 border-2 border-transparent hover:border-slate-100 shadow-lg bg-white relative overflow-hidden group`}
                  >
                     <div className={`absolute right-0 top-0 w-24 h-24 bg-current opacity-5 rounded-bl-[5rem] transition-transform group-hover:scale-150 ${stat.color.split(' ')[0]}`} />
                     <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm ${stat.color}`}>
                        <stat.icon />
                     </div>
                     <div>
                        <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">{stat.label}</p>
                        <p className="text-2xl font-black text-slate-800">{stat.val}</p>
                     </div>
                  </motion.div>
               ))}
            </motion.div>
         </div>
      </section>

      {/* ─── 3. DISCOVERY GRID: COLORFUL TILES (Updated Description) ─── */}
      <section className="py-24 px-6 relative">
         <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
               <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} className="inline-block p-3 rounded-full bg-indigo-50 mb-4">
                  <FaGlobeEurope className="text-indigo-600 text-3xl" />
               </motion.div>
               <h2 className="text-4xl md:text-5xl font-black text-slate-800 mb-6">Бельгийг <span className="text-indigo-600 underline decoration-wavy decoration-yellow-400">Нээ</span></h2>
               <p className="text-lg text-slate-600 max-w-2xl mx-auto">{DATA.belgiumInfo.desc}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
               {DATA.culture.map((item, i) => (
                  <motion.div
                     key={i}
                     initial={{ opacity: 0, y: 20 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     transition={{ delay: i * 0.1 }}
                     whileHover={{ scale: 1.05, rotate: i % 2 === 0 ? 2 : -2 }}
                     className={`aspect-square rounded-[2.5rem] ${item.bg} flex flex-col items-center justify-center text-white p-6 shadow-xl relative overflow-hidden group cursor-pointer`}
                  >
                     <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
                     <div className="bg-white/20 p-4 rounded-full backdrop-blur-md mb-4 group-hover:rotate-12 transition-transform">
                        <item.icon size={32} />
                     </div>
                     <h3 className="font-black text-center leading-tight">{item.name}</h3>
                     <p className="text-xs opacity-80 mt-2 font-bold uppercase tracking-widest">{item.desc}</p>
                  </motion.div>
               ))}
            </div>
         </div>
      </section>

     
      {/* ─── 5. SCHEDULE: THE TICKET ─── */}
      <section className="py-24 px-6 bg-white">
         <div className="max-w-4xl mx-auto">
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               whileInView={{ opacity: 1, scale: 1 }}
               className="bg-slate-50 rounded-[3rem] p-8 md:p-16 text-center shadow-2xl relative overflow-hidden text-slate-800 border border-slate-100"
            >
               {/* Background Glow */}
               <div className="absolute top-[-50%] left-[-50%] w-full h-full bg-rose-500 blur-[150px] opacity-10" />
               <div className="absolute bottom-[-50%] right-[-50%] w-full h-full bg-blue-500 blur-[150px] opacity-10" />

               <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 bg-white backdrop-blur px-4 py-2 rounded-full mb-8 shadow-sm">
                     <FaPlaneDeparture className="text-yellow-500" />
                     <span className="font-bold text-sm tracking-widest uppercase text-slate-500">Upcoming Departures</span>
                  </div>
                  
                  <h2 className="text-4xl md:text-5xl font-black mb-12 text-slate-800">2025 Элсэлтийн Хуваарь</h2>

                  <div className="space-y-4">
                     {DATA.schedule.map((item, i) => (
                        <motion.div 
                           key={i}
                           whileHover={{ scale: 1.02, backgroundColor: "white" }}
                           className="flex flex-col md:flex-row items-center justify-between bg-white/60 border border-white/80 p-6 rounded-3xl backdrop-blur-sm cursor-pointer group shadow-sm"
                        >
                           <div className="flex items-center gap-6">
                              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-black text-yellow-600 group-hover:bg-yellow-400 group-hover:text-slate-800 transition-colors">
                                 {i + 1}
                              </div>
                              <div className="text-left">
                                 <div className="font-black text-xl text-slate-800">{item.date}</div>
                                 <div className="text-sm text-slate-500 font-medium">{item.type}</div>
                              </div>
                           </div>
                           
                           <div className="mt-4 md:mt-0 flex items-center gap-4">
                              <div className="px-4 py-2 rounded-xl bg-slate-100 font-bold flex items-center gap-2 text-slate-700">
                                 <Clock size={16} className="text-blue-500" /> {item.time}
                              </div>
                              <div className="px-4 py-2 rounded-xl bg-green-100 text-green-600 font-bold text-sm uppercase tracking-wide border border-green-200">
                                 {item.status}
                              </div>
                           </div>
                        </motion.div>
                     ))}
                  </div>

                  <div className="mt-12">
                     <Link href="/register">
                        <motion.button 
                           whileHover={{ scale: 1.05 }}
                           whileTap={{ scale: 0.95 }}
                           className="px-16 py-6 rounded-full bg-yellow-400 text-slate-800 font-black text-xl uppercase tracking-widest shadow-[0_10px_40px_rgba(250,204,21,0.4)]"
                        >
                           Бүртгүүлэх
                        </motion.button>
                     </Link>
                  </div>
               </div>
            </motion.div>
         </div>
      </section>

    </div>
  );
}