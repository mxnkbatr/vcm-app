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
  FaGlobeEurope, 
  FaGraduationCap, 
  FaBaby, 
  FaBroom, 
  FaMoneyBillWave, 
  FaHome,
  FaCheckCircle,
  FaPassport,
  FaMusic,
  FaPlaneDeparture
} from "react-icons/fa";
import { Clock } from "lucide-react";
import { useUser } from "@clerk/nextjs";

// --- DATA STRUCTURE ---
const DATA = {
  hero: {
    title: "Австри Улсад",
    highlight: "Au Pair Хийх",
    sub: "Альпийн нуруу, Венийн вальс, түүх соёлын гайхамшигт улсад ажиллаж амьдрах болон суралцах боломж. Герман хэлний мэдлэгээ дээшлүүлж, Европын соёлтой танилцаарай.",
    cta: "Бүртгүүлэх"
  },
  intro: "Au-Pair хөтөлбөр нь Монгол залууст гадаадад амьдарч, шинэ соёлтой танилцаж, тус улсын хэлийг орчинд сурч, туршлага хуримтлуулах боломжийг олгодог. Австрийн зочин гэр бүлийн нэг гишүүн болж, хэл сурангаа Европын орнуудаар аялах алтан боломж таныг хүлээж байна.",
  austriaInfo: {
    title: "Австри Улсын Тухай",
    desc: "Төв Европын урд бүсийн Альпийн нурууны зүүн хэсэгт байрладаг. Нийслэл нь Вена хот. Дэлхийн шилдэг хөгжмийн зохиолч Моцартын эх орон бөгөөд аялал жуулчлал, боловсрол, урлагийн өндөр хөгжилтэй улс юм.",
    stats: [
        { label: "Нийслэл", val: "Вена" },
        { label: "Хүн ам", val: "8.9 Сая" },
        { label: "Хэл", val: "Герман" },
    ]
  },
  requirements: [
    "Нас: 18-26",
    "Гэр бүлгүй байх",
    "Эрүүл мэндийн хувьд сайн",
    "Ял шийтгэлгүй байх",
    "Герман хэлний анхан шатны мэдлэгтэй"
  ],
  duties: [
    { icon: FaBaby, title: "Хүүхэд Харах", items: ["Тоглох, саатуулах", "Хооллох, хувцаслах", "Сургуульд хүргэх", "Даалгаварт туслах"], color: "bg-orange-50 text-orange-500" },
    { icon: FaBroom, title: "Хөнгөн Гэрийн Ажил", items: ["Аяга таваг угаах", "Тоос соруулах", "Хүүхдийн хувцас угаах", "Жижиг худалдан авалт"], color: "bg-teal-50 text-teal-500" },
  ],
  contract: [
    { icon: Clock, title: "Ажлын Цаг", desc: "Долоо хоногт 18 хүртэл цаг ажиллана." },
    { icon: FaMoneyBillWave, title: "Халаасны Мөнгө", desc: "Сар бүр тогтмол 520 Евро авна." },
    { icon: FaGraduationCap, title: "Сургалтын Төлбөр", desc: "Гэр бүл хэлний курсийн зардлын 50%-ийг төлнө." },
    { icon: FaPassport, title: "Хугацаа", desc: "Гэрээ 6-12 сар үргэлжилнэ." },
  ],
  housing: [
    "Тусдаа өрөөтэй байна",
    "Хувийн орон зай",
    "Гэр бүлтэй хооллоно",
    "Үнэ төлбөргүй байр, хоол"
  ]
};

// --- VARIANTS ---
const containerVar: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const itemVar: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.5 } }
};

export default function AustriaPageBright() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const yHero = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const { isSignedIn } = useUser();

  return (
    <div ref={containerRef} className="min-h-[100dvh] bg-white text-slate-800 font-sans selection:bg-[#E3002D] selection:text-white overflow-hidden">
      
      {/* ─── 1. HERO: BRIGHT SUNNY VIBE ─── */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 px-6 overflow-hidden">
         <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-60 pointer-events-none" />
         <div className="absolute top-20 right-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-[#FFD100] via-[#FDE047] to-transparent rounded-full blur-[100px] opacity-40 mix-blend-multiply" />
         <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-gradient-to-tr from-[#E3002D] via-rose-300 to-transparent rounded-full blur-[100px] opacity-30 mix-blend-multiply" />

         <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
            <motion.div initial="hidden" animate="visible" variants={containerVar} className="space-y-8">
               <motion.div variants={itemVar} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-red-100 shadow-sm text-[#E3002D]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E3002D] animate-ping absolute" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E3002D] relative" />
                  <span className="text-xs font-black uppercase tracking-widest ml-1">Austria Program</span>
               </motion.div>

               <motion.h1 variants={itemVar} className="text-6xl md:text-8xl font-black leading-[0.95] tracking-tight text-slate-900">
                  <span className="block text-slate-800">{DATA.hero.title}</span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#E3002D] via-orange-500 to-yellow-500">
                    {DATA.hero.highlight}
                  </span>
               </motion.h1>
               
               <motion.p variants={itemVar} className="text-xl text-slate-600 font-medium leading-relaxed max-w-lg">
                  {DATA.hero.sub}
               </motion.p>

               <motion.div variants={itemVar} className="flex flex-wrap gap-4 pt-4">
                  {!isSignedIn && (
                    <Link href="/register">
                      <button className="px-10 py-4 rounded-full bg-[#E3002D] text-white font-black text-sm uppercase tracking-widest shadow-[0_10px_30px_rgba(227,0,45,0.3)] hover:scale-105 hover:bg-[#c90022] hover:shadow-[0_20px_40px_rgba(227,0,45,0.4)] transition-all flex items-center gap-2">
                         {DATA.hero.cta} <FaPlaneDeparture />
                      </button>
                    </Link>
                  )}
                  <button className="px-10 py-4 rounded-full bg-white text-slate-800 border-2 border-slate-100 font-bold text-sm uppercase tracking-widest hover:border-[#00C1B6] hover:text-[#00C1B6] transition-all">
                     Бидний тухай
                  </button>
               </motion.div>
            </motion.div>

            <div className="relative h-[600px] hidden lg:block perspective-1000">
               <motion.div style={{ y: yHero, rotateY: -12, rotateX: 6 }} className="absolute right-8 top-8 w-[420px] h-[550px] bg-white p-3 rounded-[3rem] shadow-2xl border-[6px] border-white z-20">
                  <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden bg-slate-100">
                     <Image src="https://images.unsplash.com/photo-1520509414578-d9cbf09933a1?auto=format&fit=crop&w=800&q=80" alt="Vienna" fill className="object-cover" />
                     <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50" />
                     <div className="absolute bottom-8 left-8 text-white">
                        <p className="font-serif italic text-lg opacity-90">Explore</p>
                        <h3 className="text-3xl font-black">Vienna Life</h3>
                     </div>
                  </div>
               </motion.div>

               <motion.div 
                  animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-0 right-[350px] bg-yellow-50 text-yellow-600 p-6 rounded-2xl shadow-lg border border-white rotate-[-12deg] z-10"
               >
                  <FaMusic size={32} />
               </motion.div>

               <motion.div 
                  animate={{ y: [0, 20, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute bottom-20 -left-4 bg-white p-5 rounded-3xl shadow-xl border border-slate-100 flex items-center gap-3 rotate-[5deg] z-30"
               >
                  <div className="flex flex-col gap-1">
                     <div className="w-8 h-2 bg-[#E3002D] rounded-full" />
                     <div className="w-8 h-2 bg-white border border-slate-200 rounded-full" />
                     <div className="w-8 h-2 bg-[#E3002D] rounded-full" />
                  </div>
                  <div>
                     <p className="font-bold text-slate-800 text-xs uppercase tracking-widest">Austria</p>
                  </div>
               </motion.div>
            </div>
         </div>
      </section>

      {/* ─── 2. EDUCATIONAL INTRO ─── */}
      <section className="py-24 px-6 bg-white relative">
         <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
               <motion.div 
                  initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}
                  className="bg-[#FFF9F9] border border-red-50 p-10 rounded-[3rem] relative overflow-hidden"
               >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#E3002D] opacity-5 rounded-bl-[5rem]" />
                  <div className="flex items-center gap-4 mb-6">
                     <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm text-[#E3002D]">
                        <FaGlobeEurope />
                     </div>
                     <h2 className="text-3xl font-black text-slate-900">Улсын Танилцуулга</h2>
                  </div>
                  <p className="text-slate-600 leading-relaxed mb-8">{DATA.austriaInfo.desc}</p>
                  <div className="grid grid-cols-3 gap-6">
                     {DATA.austriaInfo.stats.map((s, i) => (
                        <div key={i} className="text-center bg-white p-4 rounded-2xl shadow-sm border border-red-50">
                           <p className="text-[10px] font-bold uppercase text-[#E3002D] mb-1">{s.label}</p>
                           <p className="text-lg font-black text-slate-800">{s.val}</p>
                        </div>
                     ))}
                  </div>
               </motion.div>

               <div className="space-y-8">
                  <h3 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                     Тавигдах <span className="text-[#00C1B6] underline decoration-wavy decoration-yellow-400">Шаардлага</span>
                  </h3>
                  <div className="grid gap-4">
                     {DATA.requirements.map((req, i) => (
                        <motion.div 
                           key={i} 
                           whileHover={{ scale: 1.02, x: 10 }}
                           className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-[#00C1B6] transition-all cursor-default"
                        >
                           <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-[#00C1B6] shrink-0">
                              <FaCheckCircle />
                           </div>
                           <span className="font-bold text-slate-700">{req}</span>
                        </motion.div>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* ─── 3. CONTRACT INFO ─── */}
      <section className="py-24 bg-white relative">
         <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
               <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">Хөтөлбөрийн <span className="text-[#00C1B6]">Нөхцөл</span></h2>
               <p className="text-slate-500 font-medium">Австри улсын хууль тогтоомжийн дагуух гэрээний гол заалтууд.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
               {DATA.contract.map((item, i) => (
                  <div key={i} className="flex flex-col items-center text-center p-8 bg-[#F0FDFA] rounded-[2.5rem] border border-teal-100 hover:bg-white hover:shadow-xl hover:scale-105 transition-all duration-300 group">
                     <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-[#00C1B6] text-2xl shadow-sm mb-4 group-hover:text-white group-hover:bg-[#00C1B6] transition-colors">
                        <item.icon />
                     </div>
                     <h4 className="font-bold text-lg text-slate-900 mb-2">{item.title}</h4>
                     <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                  </div>
               ))}
            </div>

            <div className="bg-[#FFF9F9] p-10 md:p-12 rounded-[3rem] border border-red-50 flex flex-col md:flex-row gap-10 items-center justify-between">
               <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-[#E3002D] text-white rounded-3xl flex items-center justify-center text-4xl shadow-lg rotate-[-3deg]">
                     <FaHome />
                  </div>
                  <div>
                     <h3 className="text-2xl font-black text-slate-900 mb-1">Байр & Хоол</h3>
                     <p className="text-slate-500 font-medium">Үнэ төлбөргүй хангагдана</p>
                  </div>
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full md:w-auto">
                  {DATA.housing.map((h, i) => (
                     <div key={i} className="flex items-center gap-3 bg-white px-5 py-3 rounded-xl shadow-sm text-sm font-bold text-slate-700">
                        <FaCheckCircle className="text-[#00C1B6]" /> {h}
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </section>

      {/* ─── 4. CTA (HIDDEN IF LOGGED IN) ─── */}
      {!isSignedIn && (
        <section className="py-32 px-6">
           <div className="max-w-4xl mx-auto text-center">
              <Link href="/register">
                 <button className="px-12 py-6 rounded-full bg-[#E3002D] text-white font-black text-xl uppercase tracking-widest shadow-[0_15px_40px_-10px_rgba(227,0,45,0.4)] hover:scale-105 hover:bg-[#c90022] hover:shadow-[0_20px_60px_-10px_rgba(227,0,45,0.5)] transition-all">
                    Бүртгүүлэх
                 </button>
              </Link>
           </div>
        </section>
      )}

    </div>
  );
}