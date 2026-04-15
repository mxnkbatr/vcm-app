"use client"; 
import React, { useState, useEffect } from "react"; 
import Image from "next/image"; 
import { Link } from "@/navigation"; 
import { motion } from "framer-motion"; 
import { Play, Clock, BookOpen, Users, GraduationCap, Sparkles, TrendingUp, Lock, ChevronRight } from "lucide-react"; 
import { useTranslations, useLocale } from "next-intl"; 

interface Lesson { 
  _id: string; 
  title: { [k: string]: string }; 
  description: { [k: string]: string }; 
  image: string; 
  videoLink: string; 
  difficulty: "beginner" | "intermediate" | "advanced"; 
  category: string; 
  duration: string; 
  studentsJoined: number; 
  isUnlocked?: boolean; 
} 

const DIFF: Record<string, { label: string; bg: string; color: string; Icon: any }> = { 
  beginner:     { label: 'Анхан',    bg: '#E8FFF0', color: '#30D158', Icon: Sparkles }, 
  intermediate: { label: 'Дунд',     bg: '#FFF5E6', color: '#FF9F0A', Icon: TrendingUp }, 
  advanced:     { label: 'Дэвшилтэт',bg: '#FFE8E8', color: '#FF3B30', Icon: GraduationCap }, 
}; 

function LessonCard({ l, locale }: { l: Lesson; locale: string }) { 
  const d = DIFF[l.difficulty] || DIFF.beginner; 
  const title = l.title?.[locale] || l.title?.en || ''; 
  const desc  = l.description?.[locale] || l.description?.en || ''; 

  return ( 
    <motion.div 
      className={`card overflow-hidden press ${!l.isUnlocked ? 'opacity-70' : ''}`} 
      initial={{ opacity: 0, y: 12 }} 
      animate={{ opacity: !l.isUnlocked ? 0.7 : 1, y: 0 }} 
      whileTap={{ scale: 0.97 }} 
      transition={{ type: 'spring', stiffness: 400, damping: 35 }} 
    > 
      <div className="relative h-36 overflow-hidden bg-slate-100"> 
        {l.image && <Image src={l.image} alt={title} fill className="object-cover" />} 
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" /> 
        <div className="absolute top-3 left-3"> 
          <span className="badge text-[11px]" style={{ background: d.bg, color: d.color }}> 
            <d.Icon size={10} /> {d.label} 
          </span> 
        </div> 
        {!l.isUnlocked && ( 
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]"> 
            <div className="icon-box" style={{ background: 'rgba(0,0,0,0.5)' }}> 
              <Lock size={20} color="white" /> 
            </div> 
          </div> 
        )} 
      </div> 
      <div className="p-4 space-y-2"> 
        <h3 className="t-headline line-clamp-1">{title}</h3> 
        <p className="t-footnote line-clamp-2 leading-relaxed">{desc}</p> 
        <div className="flex items-center justify-between pt-1"> 
          <div className="flex items-center gap-3"> 
            <span className="t-caption flex items-center gap-1"> 
              <Clock size={11} style={{ color: 'var(--label3)' }} />{l.duration} 
            </span> 
            <span className="t-caption flex items-center gap-1"> 
              <Users size={11} style={{ color: 'var(--label3)' }} />{l.studentsJoined} 
            </span> 
          </div> 
          {l.isUnlocked ? ( 
            <Link href={`/lessons/${l._id}`} className="flex items-center gap-1 font-semibold text-[13px]" style={{ color: 'var(--blue)' }}> 
              Эхлэх <ChevronRight size={14} /> 
            </Link> 
          ) : ( 
            <span className="t-caption2 uppercase tracking-wider" style={{ color: 'var(--orange)' }}>Нээх</span> 
          )} 
        </div> 
      </div> 
    </motion.div> 
  ); 
} 

export default function LessonsClient() { 
  const t = useTranslations("LessonsPage"); 
  const locale = useLocale(); 
  const [lessons, setLessons] = useState<Lesson[]>([]); 
  const [loading, setLoading] = useState(true); 
  const [filter, setFilter] = useState("all"); 

  useEffect(() => { 
    fetch('/api/lessons').then(r => r.json()).then(d => { if (Array.isArray(d)) setLessons(d); }).catch(console.error).finally(() => setLoading(false)); 
  }, []); 

  const cats = ["all", ...Array.from(new Set(lessons.map(l => l.category).filter(Boolean)))]; 
  const filtered = filter === "all" ? lessons : lessons.filter(l => l.category === filter); 

  if (loading) return ( 
    <div className="min-h-dvh flex items-center justify-center" style={{ background: 'var(--bg)' }}> 
      <div className="ios-spinner" /> 
    </div> 
  ); 

  return ( 
    <div className="page"> 
      <div className="page-inner space-y-4"> 
        <div className="pt-2 pb-1"> 
          <h1 className="t-large-title">Сургалтууд</h1> 
          <p className="t-subhead mt-1" style={{ color: 'var(--label2)' }}>{lessons.length} хичээл байна</p> 
        </div> 

        <div className="overflow-x-auto no-scroll -mx-4 px-4"> 
          <div className="seg inline-flex"> 
            {cats.map(c => ( 
              <button key={c} onClick={() => setFilter(c)} className={`seg-item ${filter === c ? 'on' : ''}`}> 
                {c === 'all' ? 'Бүгд' : c.charAt(0).toUpperCase() + c.slice(1)} 
              </button> 
            ))} 
          </div> 
        </div> 

        <div className="space-y-4 stagger"> 
          {filtered.map(l => <LessonCard key={l._id} l={l} locale={locale} />)} 
          {filtered.length === 0 && ( 
            <div className="card p-10 text-center"> 
              <div className="text-4xl mb-3">📚</div> 
              <p className="t-headline mb-1">Сургалт байхгүй</p> 
              <p className="t-footnote">Удахгүй шинэ сургалт нэмэгдэнэ</p> 
            </div> 
          )} 
        </div> 
      </div> 
    </div> 
  ); 
}