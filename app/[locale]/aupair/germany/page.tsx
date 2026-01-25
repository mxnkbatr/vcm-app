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
  FaCar, 
  FaBaby, 
  FaBroom, 
  FaMoneyBillWave, 
  FaHome,
  FaCheckCircle,
  FaPassport,
  FaBeer,
  FaPlaneDeparture
} from "react-icons/fa";
import { Clock, BookOpen, MapPin } from "lucide-react";
import { useUser } from "@clerk/nextjs";

// --- DATA STRUCTURE ---
const DATA = {
  hero: {
    title: "Герман Улсад",
    highlight: "Au Pair Хийх",
    sub: "Европын зүрхэнд амьдарч, дэлхийд тэргүүлэх боловсролын систем, соёлтой танилцах алтан боломж. Герман хэлний мэдлэгээ орчинд нь төгс эзэмшиж, ирээдүйн карьераа эхлүүлээрэй.",
    cta: "Бүртгүүлэх"
  },
  intro: "Au-Pair хөтөлбөр нь 18-26 насны залууст зориулсан олон улсын соёл солилцооны хөтөлбөр юм. Та зочин гэр бүлийн гишүүн болж амьдарснаар герман хэлний мэдлэгээ орчинд нь дээшлүүлж, бие даах чадвар болон хариуцлагад суралцана. Хөтөлбөрийн хугацаанд та байр, хоолны зардлаас чөлөөлөгдөж, сар бүр тогтмол халаасны мөнгө авна.",
  germanyInfo: {
    title: "Герман Улсын Тухай",
    desc: "ХБНГУ нь 83 сая хүн амтай, техник технологи, инженерийн чиглэлээр дэлхийд тэргүүлэгч улс. Сургалтын төлбөргүй боловсролын систем, үзэсгэлэнт байгаль, түүхэн дурсгалт газрууд болон соёлын баялаг өвөөрөө алдартай.",
    stats: [
        { label: "Нийслэл", val: "Берлин" },
        { label: "Хүн ам", val: "83 Сая" },
        { label: "Хэл", val: "Герман" },
    ]
  },
  programs: [
    {
      title: "Герман хэл А1+",
      target: "Анхан шат",
      desc: "Ямар ч хэлний мэдлэггүй оролцогчдод зориулсан. Герман хэлийг анхан шатнаас А2 түвшин хүртэл сургаж бэлтгэнэ.",
      duration: "Бэлтгэл: 6 сар",
      age: "Нас: 18+",
      icon: FaGraduationCap,
      color: "bg-rose-50 text-rose-500 border-rose-100"
    },
    {
      title: "Англи хэл В2",
      target: "Дунд шат",
      desc: "Нислэгийн тийзийн урамшуулалтай. Англи хэлний мэдлэгтэй залууст зориулсан бөгөөд Герман хэлний А1 мэдлэг шаардлагатай.",
      duration: "Бэлтгэл: 4-6 сар",
      age: "Нас: 20+",
      icon: FaGlobeEurope,
      color: "bg-teal-50 text-teal-500 border-teal-100"
    },
    {
      title: "Au-Pair Boy",
      target: "Эрэгтэй",
      desc: "Эрэгтэй оролцогчдод зориулсан хөтөлбөр. Англи В2 / Герман А2+ мэдлэгтэй, жолооны эрхтэй хөвгүүдэд зориулсан.",
      duration: "Бэлтгэл: 3-8 сар",
      age: "Жолооны эрхтэй",
      icon: FaCar,
      color: "bg-yellow-50 text-yellow-600 border-yellow-100"
    }
  ],
  duties: [
    { icon: FaBaby, title: "Хүүхэд Харах", items: ["Тоглох, саатуулах", "Өглөө сэрээх, хувцаслах", "Сургуульд хүргэх", "Даалгаварт туслах"], color: "bg-rose-50 text-rose-500" },
    { icon: FaBroom, title: "Гэрийн Ажил", items: ["Аяга таваг угаагч", "Тоос соруулах", "Хүүхдийн хувцас угаах", "Жижиг худалдан авалт"], color: "bg-teal-50 text-teal-500" },
  ],
  contract: [
    { icon: Clock, title: "Ажлын Цаг", desc: "Долоо хоногт 30 хүртэл цаг ажиллана." },
    { icon: FaMoneyBillWave, title: "Халаасны Мөнгө", desc: "Сар бүр тогтмол 280 Евро авна." },
    { icon: FaGraduationCap, title: "Курсын төлбөр", desc: "Зочин айл сар бүр 70 Евро төлнө." },
    { icon: FaPlaneDeparture, title: "Амралт", desc: "Жилд 4 долоо хоногийн цалинтай амралт." },
  ],
  housing: [
    "Тусдаа өрөө (Цонхтой)",
    "Түгжигдэх боломжтой",
    "Дулаан, тавилгатай",
    "Байр, хоол үнэгүй"
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

export default function GermanyPageBright() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const yHero = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const { isSignedIn } = useUser();

  return (
    <div ref={containerRef} className="min-h-[100dvh] bg-white text-slate-800 font-sans selection:bg-[#E3002D] selection:text-white overflow-hidden">
      
      {/* ─── 1. HERO: BRIGHT SUNNY VIBE ─── */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 px-6 overflow-hidden">
         {/* Dotted Pattern */}
         <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-60 pointer-events-none" />
         
         {/* Gradient Shapes */}
         <div className="absolute top-20 right-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-[#00C1B6] via-teal-100 to-transparent rounded-full blur-[100px] opacity-30 mix-blend-multiply" />
         <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-gradient-to-tr from-[#E3002D] via-rose-200 to-transparent rounded-full blur-[100px] opacity-30 mix-blend-multiply" />

         <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
            
            <motion.div initial="hidden" animate="visible" variants={containerVar} className="space-y-8 text-center lg:text-left">
               <motion.div variants={itemVar} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-teal-100 shadow-sm text-[#00C1B6]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00C1B6] animate-ping absolute" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00C1B6] relative" />
                  <span className="text-xs font-black uppercase tracking-widest ml-1">Germany Program</span>
               </motion.div>

               <motion.h1 variants={itemVar} className="text-6xl md:text-8xl font-black leading-[0.95] tracking-tight text-slate-900">
                  <span className="block text-slate-800">{DATA.hero.title}</span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#E3002D] via-teal-500 to-[#00C1B6]">
                    {DATA.hero.highlight}
                  </span>
               </motion.h1>
               
               <motion.p variants={itemVar} className="text-xl text-slate-600 font-medium leading-relaxed max-w-lg mx-auto lg:mx-0">
                  {DATA.hero.sub}
               </motion.p>

               <motion.div variants={itemVar} className="flex flex-wrap gap-4 justify-center lg:justify-start pt-4">
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

            {/* Collage Hero */}
            <div className="relative h-[600px] hidden lg:block perspective-1000">
               <motion.div style={{ y: yHero, rotateY: -10, rotateX: 5 }} className="absolute right-8 top-8 w-[420px] h-[550px] bg-white p-3 rounded-[3rem] shadow-2xl border-[6px] border-white z-20">
                  <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden bg-slate-100">
                     <Image src="https://images.unsplash.com/photo-1599946347371-88a3064ea17d?auto=format&fit=crop&w=800&q=80" alt="Berlin" fill className="object-cover" />
                     <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
                     <div className="absolute bottom-8 left-8 text-white">
                        <p className="font-serif italic text-lg opacity-90">Discover</p>
                        <h3 className="text-3xl font-black">Berlin Style</h3>
                     </div>
                  </div>
               </motion.div>

               <motion.div 
                  animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-0 right-[350px] bg-teal-50 text-teal-600 p-6 rounded-2xl shadow-lg border border-white rotate-[-12deg] z-10"
               >
                  <FaBeer size={32} />
               </motion.div>

               <motion.div 
                  animate={{ y: [0, 20, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute bottom-20 -left-4 bg-white p-5 rounded-3xl shadow-xl border border-slate-100 flex items-center gap-3 rotate-[5deg] z-30"
               >
                  <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center text-[#E3002D]">
                     <FaPassport size={20} />
                  </div>
                  <p className="font-bold text-slate-800 text-xs uppercase tracking-widest">Visa Support</p>
               </motion.div>
            </div>
         </div>
      </section>

      {/* ─── 2. EDUCATIONAL INTRO ─── */}
      <section className="py-24 px-6 bg-white relative">
         <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
               
               {/* Left: Info Card */}
               <motion.div 
                  initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}
                  className="bg-[#F0FDFA] border border-teal-50 p-10 rounded-[3rem] relative overflow-hidden shadow-sm"
               >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#00C1B6] opacity-5 rounded-bl-[5rem]" />
                  
                  <div className="flex items-center gap-4 mb-6">
                     <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm text-[#00C1B6]">
                        <FaGlobeEurope />
                     </div>
                     <h2 className="text-3xl font-black text-slate-900">Герман Улсын Тухай</h2>
                  </div>
                  
                  <p className="text-slate-600 leading-relaxed mb-8 font-medium">
                     {DATA.germanyInfo.desc}
                  </p>

                  <div className="grid grid-cols-3 gap-6">
                     {DATA.germanyInfo.stats.map((s, i) => (
                        <div key={i} className="text-center bg-white p-4 rounded-2xl shadow-sm border border-teal-50">
                           <p className="text-[10px] font-bold uppercase text-[#00C1B6] mb-1">{s.label}</p>
                           <p className="text-lg font-black text-slate-800">{s.val}</p>
                        </div>
                     ))}
                  </div>
               </motion.div>

               {/* Right: Text Column */}
               <div className="space-y-8">
                  <h3 className="text-4xl font-black text-slate-900 leading-tight">
                     <span className="text-[#E3002D]">Боловсрол,</span> Соёл,<br/>
                     <span className="text-[#00C1B6]">Туршлага</span> нэг дор
                  </h3>
                  <p className="text-lg text-slate-600 leading-relaxed">
                     {DATA.intro}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="flex items-center gap-3 font-bold text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <FaCheckCircle className="text-[#00C1B6]" /> 18-26 Нас
                     </div>
                     <div className="flex items-center gap-3 font-bold text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <FaCheckCircle className="text-[#00C1B6]" /> Орчинд нь сурах
                     </div>
                  </div>
               </div>

            </div>
         </div>
      </section>

      {/* ─── 3. PROGRAMS (Vibrant Grid) ─── */}
      <section className="py-24 bg-slate-50 relative">
         <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
               <span className="text-[#00C896] font-bold tracking-widest text-sm uppercase block mb-3">Programs for you</span>
               <h2 className="text-5xl font-black text-slate-900">Хэрэгждэг <span className="text-[#E31B23]">3 Төрлийн</span> Хөтөлбөр</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
               {DATA.programs.map((prog, i) => (
                  <motion.div 
                    key={i} whileHover={{ y: -12 }} transition={{ type: "spring", stiffness: 300 }}
                    className="bg-white p-8 rounded-[2.5rem] shadow-[0_15px_50px_-15px_rgba(0,0,0,0.05)] border-2 border-white hover:border-[#00C1B6] flex flex-col justify-between h-full relative group transition-all"
                  >
                     <div>
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-sm ${prog.icon}`}>
                           <prog.icon />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#E31B23] mb-2 block">{prog.target}</span>
                        <h3 className="text-2xl font-black text-slate-900 mb-4">{prog.title}</h3>
                        <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8">{prog.desc}</p>
                     </div>
                     <div className="pt-6 border-t border-slate-100 space-y-2">
                        <p className="flex items-center gap-2 text-xs font-bold text-slate-800"><Clock size={14} className="text-[#00C896]" /> {prog.duration}</p>
                        <p className="flex items-center gap-2 text-xs font-bold text-slate-800"><FaCheckCircle size={14} className="text-[#E31B23]" /> {prog.age}</p>
                     </div>
                  </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* ─── 4. CONTRACT & HOUSING ─── */}
      <section className="py-24 bg-white relative">
         <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
               <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">Гэрээ & <span className="text-[#00C1B6]">Нөхцөл</span></h2>
               <p className="text-slate-500 font-medium">ХБНГУ-ын Au-Pair гэрээний дагуух стандартууд.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
               {DATA.contract.map((item, i) => (
                  <div key={i} className="flex flex-col items-center text-center p-8 bg-[#FFF9F9] rounded-[2.5rem] border border-red-50 hover:bg-white hover:shadow-xl transition-all group">
                     <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-[#E31B23] text-2xl shadow-sm mb-4 group-hover:text-white group-hover:bg-[#E31B23] transition-colors">
                        <item.icon />
                     </div>
                     <h4 className="font-bold text-lg text-slate-900 mb-2">{item.title}</h4>
                     <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                  </div>
               ))}
            </div>

            {/* Housing Bubble */}
            <div className="bg-[#F0FDFA] p-10 md:p-12 rounded-[3rem] border border-teal-50 flex flex-col md:flex-row gap-10 items-center justify-between shadow-sm">
               <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-[#00C1B6] text-white rounded-3xl flex items-center justify-center text-4xl shadow-lg rotate-3">
                     <FaHome />
                  </div>
                  <div>
                     <h3 className="text-2xl font-black text-slate-900 mb-1">Орон Сууц & Хоол</h3>
                     <p className="text-teal-600 font-medium">Зочин айлаас 100% хангагдана</p>
                  </div>
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full md:w-auto">
                  {DATA.housing.map((h, i) => (
                     <div key={i} className="flex items-center gap-3 bg-white px-5 py-3 rounded-xl shadow-sm text-sm font-bold text-slate-700 border border-teal-50">
                        <FaCheckCircle className="text-[#E31B23]" /> {h}
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </section>

    </div>
  );
}