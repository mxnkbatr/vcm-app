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
    image: "https://res.cloudinary.com/dc127wztz/image/upload/q_auto/f_auto/v1775390121/tsevlee_mnzwhq.jpg",
    signatureImage: "https://res.cloudinary.com/dc127wztz/image/upload/q_auto/f_auto/v1775390121/tsevlee_mnzwhq.jpg",
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
    image: "https://res.cloudinary.com/dc127wztz/image/upload/q_auto/f_auto/v1775390121/tsevlee_mnzwhq.jpg",
    signatureImage: "https://res.cloudinary.com/dc127wztz/image/upload/q_auto/f_auto/v1775390121/tsevlee_mnzwhq.jpg",
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
    <div className="page">
      <div className="page-inner space-y-8">
        
        {/* HERO SECTION */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVar}
          className="space-y-6"
        >
          <div className="pt-2">
            <div className="badge mb-3" style={{ background: 'var(--blue-dim)', color: 'var(--blue)' }}>
              {locale === 'mn' ? 'Монголын Сайн Дурынхны Төв' : 'Volunteer Center Mongolia'}
            </div>
            <h1 className="t-large-title">
              {aboutD.sectionTitle}
            </h1>
          </div>

          <div className="card overflow-hidden">
            <div className="relative aspect-video">
              <Image
                src="https://res.cloudinary.com/dc127wztz/image/upload/q_auto/f_auto/v1775390121/tsevlee_mnzwhq.jpg"
                alt="VCM Mission"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <p className="t-body" style={{ color: 'var(--label2)' }}>
                {aboutD.content}
              </p>
            </div>
          </div>
        </motion.div>

        {/* FOUNDER SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="card p-6 space-y-6"
        >
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-lg">
              <Image
                src={introD.image}
                alt={introD.founderName}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="t-title2">{introD.founderName}</h2>
              <p className="t-footnote" style={{ color: 'var(--blue)' }}>{introD.founderTitle}</p>
            </div>
          </div>

          <div className="space-y-4">
            {introD.text.map((para, i) => (
              <p key={i} className="t-subhead" style={{ color: 'var(--label2)', lineHeight: 1.6 }}>
                {para}
              </p>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h4 className="t-headline mb-4">{introD.highlightsTitle}</h4>
            <ul className="space-y-3">
              {introD.highlights.map((hlt, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="icon-box-sm" style={{ background: 'var(--blue-dim)', color: 'var(--blue)', marginTop: 2 }}>
                    <FaStar size={10} />
                  </div>
                  <span className="t-footnote" style={{ color: 'var(--label2)' }}>{hlt}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* VALUES */}
        <div className="space-y-4">
          <div className="px-1">
            <h2 className="t-title2">{aboutD.valuesTitle}</h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {aboutD.values.map((val, i) => (
              <div key={i} className="card p-5 flex items-start gap-4">
                <div className="icon-box" style={{ background: 'var(--blue-dim)', color: 'var(--blue)' }}>
                  <val.icon size={20} />
                </div>
                <div>
                  <h3 className="t-headline">{val.title}</h3>
                  <p className="t-footnote" style={{ color: 'var(--label2)' }}>{val.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pb-8" />
      </div>
    </div>
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
