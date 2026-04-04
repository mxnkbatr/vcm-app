"use client";

import React, { useRef } from "react";
import Image from "next/image";
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
  FaStar, 
  FaQuoteLeft,
  FaHandsHelping, 
  FaGlobe, 
  FaUsers, 
  FaHeart 
} from "react-icons/fa";
import { useLocale } from "next-intl";

// --- DATA CONTEXTS ---
const aboutData = {
  mn: {
    sectionTitle: "Бидний тухай",
    content: "Монголын сайн дурынхны төв нь бүтээлч оролцоо бүхий хүмүүнлэг, иргэний ардчилсан нийгмийг бүтээхэд хувь нэмрээ оруулах эрхэм зорилготойгоор 2007 оноос хойш 50 гаруй үндэсний төсөл, хөтөлбөрийг амжилттай хэрэгжүүлж байна. Бид боловсрол, хүүхэд хамгаалал, тогтвортой амьжиргааны чиглэлээр сайн дурынхны загвар хөтөлбөрүүдийг бий болгон, түгээн дэлгэрүүлсээр ирсэн.",
    valuesTitle: "Бидний Үнэт Зүйлс",
    values: [
      { icon: FaHandsHelping, title: "Сайн дурын сэтгэл", description: "Бидний үйл ажиллагааны цөм нь сайн дурынхны хүсэл тэмүүлэл юм." },
      { icon: FaGlobe, title: "Дэлхийн нөлөө", description: "Орон нутгийн үйлсээрээ дамжуулан дэлхийн өөрчлөлтийг бий болгохыг зорьдог." },
      { icon: FaUsers, title: "Олон нийтийн хөгжил", description: "Хамтдаа илүү хүчирхэг, ээлтэй нийгмийг цогцлоон бэхжүүлдэг." },
      { icon: FaHeart, title: "Дур хүсэл ба халамж", description: "Хийж буй бүх зүйлдээ чин сэтгэлийн хандлага, халамжийг шингээдэг." }
    ]
  },
  en: {
    sectionTitle: "About Our Mission",
    content: "Since 2007, the Mongolian Volunteer Center has pursued the noble goal of building a humane, democratic society through creative volunteerism. We have successfully implemented over 50 national projects focused on education, child protection, and sustainable livelihoods, creating and scaling model volunteer programs.",
    valuesTitle: "Our Core Values",
    values: [
      { icon: FaHandsHelping, title: "Volunteer Spirit", description: "Driven by the passion and dedication of volunteers at our core." },
      { icon: FaGlobe, title: "Global Impact", description: "Creating global change through impactful local action and partnership." },
      { icon: FaUsers, title: "Community Building", description: "Strengthening bonds to build more resilient and supportive communities." },
      { icon: FaHeart, title: "Passion & Care", description: "Infusing genuine passion and care into everything we undertake." }
    ]
  },
};

const introductionData = {
  mn: {
    title: "Үүсгэн байгуулагчийн танилцуулга",
    founderName: "Б. Цэвэлмаа",
    founderTitle: "Үүсгэн байгуулагч, Нийгмийн зөвлөх",
    image: "/tsev.png",
    signatureImage: "/tsev.png",
    text: [
      "Сайн дурын үйлсээр дамжуулан эерэг өөрчлөлтийг бүтээх хүсэл тэмүүлэл минь Монголын сайн дурынхны төвийг үүсгэн байгуулахад хүргэсэн юм. Бид хамтдаа, эх орныхоо өнцөг булан бүрт хүрч, хүмүүнлэг, иргэний нийгмийг цогцлоохын төлөө тууштай ажиллаж байна.",
      "Бидний үйл ажиллагааны гол цөм нь хүн бүрийн дотор орших тусч сэтгэл бөгөөд тэрхүү сэтгэлийг зөв гольдролд нь оруулж, бодит үйлдэл болгох нь бидний эрхэм зорилго юм. Таныг энэхүү үнэ цэнтэй аялалд нэгдэхийг урьж байна.",
    ],
    highlightsTitle: "Онцлох амжилтууд",
    highlights: [
      "Нийгмийн ажлын багш, зөвлөх мэргэжилтэн",
      "50 гаруй үндэсний хэмжээний төсөл, хөтөлбөр удирдсан",
      "Олон нийтийн оролцоо ба залуучуудын хөгжлийн чиглэлээр мэргэшсэн",
    ],
  },
  en: {
    title: "Meet Our Founder",
    founderName: "B. Tsevelmaa",
    founderTitle: "Founder & Community Engagement Consultant",
    image: "/tsev.png",
    signatureImage: "/tsev.png",
    text: [
      "My passion for creating positive change through volunteerism led me to establish the Mongolian Volunteer Center. Together, we have reached every corner of our nation, working tirelessly to build a more humane and civil society.",
      "At the core of our work is the belief in the helping spirit that resides in everyone. Our mission is to channel that spirit into meaningful, tangible action. I invite you to join us on this invaluable journey of contribution and growth.",
    ],
    highlightsTitle: "Key Highlights",
    highlights: [
      "Certified Social Work Teacher and Consultant",
      "Led over 50 national-level projects and programs",
      "Specialist in community engagement and youth development",
    ],
  },
};

// --- ANIMATION VARIANTS ---
const containerVar: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
  }
};

const itemVar: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", bounce: 0.4, duration: 0.9 }
  }
};

export default function AboutPageSky() {
  const locale = useLocale() as "en" | "mn";
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "end start"] });

  // Parallax effects
  const yHero = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const textY = useTransform(scrollYProgress, [0, 0.5], [60, 0]);

  const aboutD = aboutData[locale] || aboutData.en;
  const introD = introductionData[locale] || introductionData.en;

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-[100dvh] bg-white overflow-hidden py-32 font-sans selection:bg-sky-200 selection:text-sky-900"
    >
      {/* ─── 1. SKY BLUE ATMOSPHERE ─── */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Dominant Sky Blob Top Right */}
        <motion.div
          animate={{
            x: [0, 50, -50, 0],
            y: [0, -30, 30, 0],
            scale: [1, 1.1, 0.9, 1]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-15%] right-[-10%] w-[900px] h-[900px] bg-gradient-to-br from-sky-100 via-sky-300/20 to-transparent rounded-full blur-[100px] opacity-80"
        />
        {/* Secondary Blue/Cyan Mix Bottom Left */}
        <motion.div
          animate={{
            x: [0, -70, 30, 0],
            y: [0, 60, -40, 0],
            scale: [1, 1.2, 0.8, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-10%] left-[-15%] w-[800px] h-[800px] bg-gradient-to-tr from-sky-400/20 via-sky-100 to-blue-50 rounded-full blur-[100px]"
        />
        {/* Grain Texture */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.25] mix-blend-overlay" />
      </div>

      <div className="container relative z-10 px-6 mx-auto max-w-7xl">

        {/* ─── 2. HERO SECTION ─── */}
        <div className="grid lg:grid-cols-2 gap-16 md:gap-24 items-center mb-32">

          {/* Text Content */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVar}
            style={{ y: textY }}
            className="space-y-10 relative -mt-[160px]"
          >
            {/* Tagline */}
            <motion.div variants={itemVar} className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/90 border border-sky-100 shadow-[0_4px_20px_-10px_rgba(14,165,233,0.3)] backdrop-blur-md">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
              </span>
              <span className="text-xs font-black uppercase tracking-[0.25em] text-sky-500">
                {locale === 'mn' ? 'Монголын Сайн Дурынхны Төв' : 'Volunteer Center Mongolia'}
              </span>
            </motion.div>

            {/* Title with Sky Dominance */}
            <motion.h1 variants={itemVar} className="text-5xl md:text-7xl font-black tracking-tighter leading-[1.05] text-slate-900 drop-shadow-sm">
              <span className="block text-slate-800 relative z-10">
                {aboutD.sectionTitle.split(' ')[0]} 
              </span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-500 to-sky-600 filter drop-shadow-sm">
                {aboutD.sectionTitle.split(' ').slice(1).join(' ')}
              </span>
            </motion.h1>

            <motion.p variants={itemVar} className="text-lg font-medium text-slate-600 leading-relaxed border-l-[6px] border-sky-300 pl-8 max-w-lg">
              {aboutD.content}
            </motion.p>
          </motion.div>

          {/* Hero Image */}
          <div className="relative">
            {/* Curtain Reveal Image */}
            <motion.div
              style={{ y: yHero }}
              initial={{ clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)" }}
              whileInView={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-sky-900/20 border-[8px] border-white bg-white aspect-[4/5] w-full"
            >
              <div className="relative w-full h-full group">
                {/* Fallback image representing volunteering/mission */}
                <Image
                  src="https://res.cloudinary.com/dc127wztz/image/upload/v1768996172/zu47lypqyoup0ylylou2.webp"
                  alt="VCM Mission"
                  fill
                  className="object-cover transition-transform duration-[2s] group-hover:scale-110"
                />
                {/* Sky Tint Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-sky-900/40 via-transparent to-transparent opacity-60 mix-blend-multiply" />
              </div>
            </motion.div>

            {/* Rotating Badge - "Established 2007" */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute -top-12 -right-6 md:-right-12 z-20 w-40 h-40 flex items-center justify-center bg-white rounded-full shadow-2xl border-[6px] border-sky-50"
            >
              <svg viewBox="0 0 100 100" width="150" height="150" className="animate-spin-slow absolute">
                <path id="curve" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="transparent" />
                <text className="text-[11px] font-bold uppercase tracking-[0.2em] fill-sky-500">
                  <textPath href="#curve">
                    Volunteer Center Mongolia • 2007 • 
                  </textPath>
                </text>
              </svg>
              <div className="relative z-10 flex flex-col items-center leading-none">
                <span className="text-4xl font-black text-slate-900">15+</span>
                <span className="text-[10px] font-bold uppercase text-sky-400 tracking-wider">
                  {locale === 'mn' ? 'Жил' : 'Years'}
                </span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ─── 3. FOUNDER SECTION ─── */}
        <div className="grid lg:grid-cols-12 gap-16 mb-32 items-center">

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="lg:col-span-4 relative aspect-[3/4] w-full max-w-sm mx-auto"
          >
            {/* Founder Image */}
            <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-tr from-sky-400 to-blue-300 translate-x-4 translate-y-4 -z-10" />
            <div className="relative w-full h-full rounded-[2.5rem] border-4 border-white shadow-xl overflow-hidden bg-slate-100">
              <Image
                src={introD.image}
                alt={introD.founderName}
                fill
                className="object-cover"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-8 bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-12 border border-sky-50 shadow-[0_20px_60px_-15px_rgba(14,165,233,0.1)] space-y-8"
          >
            <div>
              <div className="inline-flex gap-2 items-center mb-2">
                <FaQuoteLeft className="text-sky-300 text-xl" />
                <h4 className="text-sky-500 font-bold uppercase tracking-widest text-xs">
                  {introD.title}
                </h4>
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900">
                {introD.founderName}
              </h2>
              <p className="text-sm font-semibold text-sky-600 mt-2">
                {introD.founderTitle}
              </p>
            </div>

            <div className="space-y-4">
              {introD.text.map((para, i) => (
                <p key={i} className="text-lg text-slate-600 leading-relaxed font-medium">
                  {para}
                </p>
              ))}
            </div>

            <div className="pt-6 border-t border-slate-100">
              <h4 className="font-bold text-slate-900 mb-4">{introD.highlightsTitle}</h4>
              <ul className="space-y-3">
                {introD.highlights.map((hlt, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-100 text-sky-500 shrink-0">
                      <FaStar size={10} />
                    </span>
                    <span className="text-slate-600 font-medium text-sm">{hlt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>

        {/* ─── 4. VALUES (Sky-Themed 3D Grid) ─── */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
              {aboutD.valuesTitle}
            </h2>
            {/* Gradient Divider */}
            <div className="w-32 h-1.5 bg-gradient-to-r from-sky-400 via-blue-400 to-sky-300 mx-auto rounded-full" />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {aboutD.values.map((val, i) => (
              <SkyTiltCard
                key={i}
                icon={val.icon}
                title={val.title}
                text={val.description}
                index={i}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

// ─── 3D MAGNETIC CARD (Sky Dominant) ───
interface CardProps {
  icon: any;
  title: string;
  text: string;
  index: number;
}

const SkyTiltCard = ({ icon: Icon, title, text, index }: CardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const xSpring = useSpring(x, { stiffness: 150, damping: 15 });
  const ySpring = useSpring(y, { stiffness: 150, damping: 15 });
  const rotateX = useTransform(ySpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(xSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const glareX = useTransform(xSpring, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(ySpring, [-0.5, 0.5], ["0%", "100%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="group relative min-h-[220px] p-10 rounded-[2.5rem] bg-white border border-sky-50 shadow-xl shadow-sky-100/50 hover:border-sky-200 cursor-pointer perspective-1000 overflow-hidden"
    >
      {/* Dynamic Glare */}
      <motion.div
        style={{ background: useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.8), transparent 50%)` }}
        className="absolute inset-0 rounded-[2.5rem] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300 z-20 mix-blend-overlay"
      />

      <div style={{ transform: "translateZ(30px)" }} className="relative z-10 h-full flex flex-col items-start">
        {/* Icon Box */}
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 bg-sky-50 text-sky-500 group-hover:bg-sky-500 group-hover:text-white">
          <Icon size={28} />
        </div>

        <h3 className="text-xl font-black mb-3 group-hover:translate-x-1 transition-transform text-slate-900">
          {title}
        </h3>

        <p className="text-sm text-slate-500 font-medium leading-relaxed mt-auto">
          {text}
        </p>
      </div>

      {/* Decorative Blob in corner */}
      <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full blur-[70px] opacity-0 group-hover:opacity-20 transition-opacity duration-500 z-0 bg-sky-500" />
    </motion.div>
  );
};
