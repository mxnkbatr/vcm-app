"use client"; 
import React, { useState } from "react"; 
import Link from "next/link"; 
import { motion, AnimatePresence } from "framer-motion"; 
import { useTranslations } from "next-intl"; 
import { 
  Clock, Globe, CheckCircle2, ArrowRight, 
  Star, Users, BookOpen, Heart, Zap, GraduationCap, 
  CalendarDays, MapPin, Sparkles, ChevronLeft 
} from "lucide-react"; 
import { useSession } from "next-auth/react"; 

const PROGRAMS = [ 
  { 
    id: "EDU", emoji: "🎓", color: "#0A84FF", 
    gradFrom: "#0ea5e9", gradTo: "#3b82f6", 
    iconBg: "#E8F4FF", iconColor: "#0A84FF", 
    nameKey: "prog_edu", descKey: "prog_edu_desc", 
    href: "/programs/edu", duration: "3–12 сар", 
    location: "Монгол улс", slots: 8, 
    tags: ["Сургалт", "Хэл заалт", "Залуучууд"], 
    features: [ 
      { I: GraduationCap, t: "Дунд, ахлах сургуулиудад зааварлагч болох" }, 
      { I: BookOpen,       t: "Хэл, урлаг, технологи чиглэлийн хичээл заах" }, 
      { I: Users,          t: "Англи B1+ түвшин шаардлагатай" }, 
      { I: CalendarDays,   t: "Уян хатан цагийн хуваарь" }, 
      { I: Star,           t: "VCM-ийн бүрэн дэмжлэг, ментор" }, 
    ], 
    why: "Монголын сургуулиудад мэдлэгийг дамжуулж, нийгмийн хөгжилд хувь нэмэр оруулах ховор боломж.", 
  }, 
  { 
    id: "AND", emoji: "🤝", color: "#30D158", 
    gradFrom: "#10b981", gradTo: "#0d9488", 
    iconBg: "#E8FFF0", iconColor: "#30D158", 
    nameKey: "prog_and", descKey: "prog_and_desc", 
    href: "/programs/and", duration: "Уян хатан", 
    location: "Улаанбаатар", slots: 12, 
    tags: ["Тусгай хэрэгцээт", "Халамж", "Хамтын нийгэм"], 
    features: [ 
      { I: Heart,       t: "Тусгай хэрэгцээт хүүхдүүдэд сэтгэл зүйн дэмжлэг" }, 
      { I: Users,       t: "Гэр бүлд нийгмийн идэвхтэй туслалцаа" }, 
      { I: CalendarDays,t: "7 хоногт 2–3 удаа уулзах" }, 
      { I: MapPin,      t: "UB дахь хамтрагч байгууллагуудтай" }, 
      { I: Star,        t: "Урьдчилсан сургалт ба удирдамж" }, 
    ], 
    why: "Нийгмийн хамгийн эмзэг бүлэгт биечлэн туслах, тэдний гэр бүлд баяр баясгалан бэлэглэх.", 
  }, 
  { 
    id: "VCLUB", emoji: "🌍", color: "#FF9F0A", 
    gradFrom: "#f59e0b", gradTo: "#f97316", 
    iconBg: "#FFF5E6", iconColor: "#FF9F0A", 
    nameKey: "prog_vclub", descKey: "prog_vclub_desc", 
    href: "/programs/vclub", duration: "Арга хэмжээгээр", 
    location: "Монгол улс", slots: 20, 
    tags: ["Арга хэмжээ", "Сүлжээ", "Манлайлал"], 
    features: [ 
      { I: Zap,      t: "Олон нийтийн арга хэмжээнд оролцох" }, 
      { I: Users,    t: "Олон улсын гишүүдийн сүлжээнд нэгдэх" }, 
      { I: Star,     t: "Манлайлал, ур чадвар хөгжүүлэх" }, 
      { I: Globe,    t: "Дэлхийн сайн дурынхантай холбогдох" }, 
      { I: Sparkles, t: "Нийгмийн томоохон санаачилгуудад нэгдэх" }, 
    ], 
    why: "V-Club бол хувь хүний өсөлт, дэлхийн холбоо тогтоох, нийгмийн томоохон өөрчлөлтийн нэг хэсэг болох газар юм.", 
  }, 
]; 

type Prog = typeof PROGRAMS[0]; 

function ProgCard({ p, onTap, nt }: { p: Prog; onTap: () => void; nt: any }) { 
  return ( 
    <motion.div 
      className="card overflow-hidden press" 
      initial={{ opacity: 0, y: 14 }} 
      animate={{ opacity: 1, y: 0 }} 
      whileTap={{ scale: 0.97 }} 
      transition={{ type: "spring", stiffness: 400, damping: 35 }} 
      onClick={onTap} 
    > 
      {/* Banner */} 
      <div className="relative h-32 flex items-end justify-between p-4" 
        style={{ background: `linear-gradient(135deg, ${p.gradFrom}, ${p.gradTo})` }}> 
        <div className="bg-black/20 backdrop-blur-sm rounded-lg px-2.5 py-1"> 
          <span className="t-caption2 text-white/90 uppercase">{p.id}</span> 
        </div> 
        <span className="text-5xl">{p.emoji}</span> 
        <div className="absolute top-3 right-3 bg-black/20 backdrop-blur-sm rounded-full px-2.5 py-1"> 
          <span className="t-caption2 text-white/90">{p.slots} нэр боломжтой</span> 
        </div> 
      </div> 
      {/* Body */} 
      <div className="p-4 space-y-3"> 
        <div className="flex items-start justify-between"> 
          <h3 className="t-headline">{nt(p.nameKey)}</h3> 
          <span className="t-footnote" style={{ color: 'var(--label3)' }}>›</span> 
        </div> 
        <div className="flex items-center gap-3"> 
          <span className="t-caption flex items-center gap-1"> 
            <Clock size={11} style={{ color: 'var(--label3)' }} />{p.duration} 
          </span> 
          <span className="t-caption flex items-center gap-1"> 
            <MapPin size={11} style={{ color: 'var(--label3)' }} />{p.location} 
          </span> 
        </div> 
        <div className="flex flex-wrap gap-1.5"> 
          {p.tags.map(tag => ( 
            <span key={tag} className="badge" style={{ background: p.iconBg, color: p.iconColor }}> 
              {tag} 
            </span> 
          ))} 
        </div> 
        <div className="flex gap-2 pt-1"> 
          <button onClick={e => { e.stopPropagation(); onTap(); }} 
            className="btn btn-ghost btn-sm flex-1">Дэлгэрэнгүй</button> 
          <Link href="/apply" onClick={e => e.stopPropagation()} 
            className="btn btn-sm flex-1 text-white text-center" 
            style={{ background: p.color, boxShadow: `0 4px 14px ${p.color}44` }}> 
            Өргөдөл 
          </Link> 
        </div> 
      </div> 
    </motion.div> 
  ); 
} 

function ProgDetail({ p, onBack, nt, signed }: { p: Prog; onBack: () => void; nt: any; signed: boolean }) { 
  return ( 
    <motion.div 
      key="detail" 
      initial={{ opacity: 0, x: 32 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: 32 }} 
      transition={{ type: "spring", stiffness: 350, damping: 35 }} 
      className="space-y-4" 
    > 
      <button onClick={onBack} className="flex items-center gap-0.5 pt-2 press" style={{ color: 'var(--blue)' }}> 
        <ChevronLeft size={22} strokeWidth={2.2} /> 
        <span className="t-headline font-semibold">Хөтөлбөрүүд</span> 
      </button> 

      {/* Hero */} 
      <div className="rounded-3xl p-6 flex gap-5 items-center relative overflow-hidden" 
        style={{ background: `linear-gradient(135deg, ${p.gradFrom}, ${p.gradTo})` }}> 
        <div className="absolute right-0 top-0 w-44 h-44 rounded-full opacity-10" 
          style={{ background: 'white', filter: 'blur(40px)', transform: 'translate(30%,-30%)' }} /> 
        <span className="text-6xl flex-shrink-0">{p.emoji}</span> 
        <div className="relative z-10"> 
          <div className="t-caption2 text-white/70 uppercase mb-1">{p.id} хөтөлбөр</div> 
          <h2 className="t-title2 text-white mb-2">{nt(p.nameKey)}</h2> 
          <div className="flex flex-wrap gap-1.5"> 
            {[p.duration, p.location, `${p.slots} нэр`].map(s => ( 
              <span key={s} className="text-[11px] font-semibold text-white/85 bg-black/20 px-2.5 py-1 rounded-full backdrop-blur-sm">{s}</span> 
            ))} 
          </div> 
        </div> 
      </div> 

      {/* Sections */} 
      {[ 
        { icon: Globe,        label: 'Хөтөлбөрийн тухай', content: <p className="t-subhead" style={{ color: 'var(--label2)', lineHeight: 1.6 }}>{nt(p.descKey)}</p> }, 
        { icon: CheckCircle2, label: 'Юу хийх вэ?',       content: ( 
          <div className="space-y-3"> 
            {p.features.map((f, i) => ( 
              <div key={i} className="flex items-start gap-3"> 
                <div className="icon-box-sm flex-shrink-0" style={{ background: p.iconBg, marginTop: 2 }}> 
                  <f.I size={14} style={{ color: p.iconColor }} /> 
                </div> 
                <span className="t-subhead" style={{ color: 'var(--label2)', lineHeight: 1.55 }}>{f.t}</span> 
              </div> 
            ))} 
          </div> 
        )}, 
        { icon: Star, label: 'Яагаад нэгдэх вэ?', content: <p className="t-subhead" style={{ color: 'var(--label2)', lineHeight: 1.6 }}>{p.why}</p> }, 
      ].map(({ icon: Icon, label, content }) => ( 
        <div key={label} className="card p-5"> 
          <div className="flex items-center gap-3 mb-3"> 
            <div className="icon-box" style={{ background: p.iconBg }}> 
              <Icon size={18} style={{ color: p.iconColor }} /> 
            </div> 
            <span className="t-headline">{label}</span> 
          </div> 
          {content} 
        </div> 
      ))} 

      <div className="flex flex-wrap gap-2 px-1"> 
        {p.tags.map(tag => ( 
          <span key={tag} className="badge" style={{ background: p.iconBg, color: p.iconColor }}>{tag}</span> 
        ))} 
      </div> 

      <div className="grid grid-cols-2 gap-3 pb-4"> 
        <Link href={p.href} className="btn btn-ghost py-4 text-center text-[15px]">Бүрэн мэдээлэл</Link> 
        <Link href={signed ? "/apply" : "/register"} 
          className="btn py-4 text-center text-[15px] text-white" 
          style={{ background: p.color, boxShadow: `0 4px 16px ${p.color}44` }}> 
          {signed ? 'Өргөдөл →' : 'Бүртгүүлэх →'} 
        </Link> 
      </div> 
    </motion.div> 
  ); 
} 

export default function ProgramsClient() { 
  const nt = useTranslations("navbar"); 
  const { status } = useSession(); 
  const signed = status === "authenticated"; 
  const [sel, setSel] = useState<Prog | null>(null); 
  const [filter, setFilter] = useState("all"); 
  const list = filter === "all" ? PROGRAMS : PROGRAMS.filter(p => p.id === filter); 

  return ( 
    <div className="page"> 
      <div className="page-inner"> 
        <AnimatePresence mode="wait"> 
          {!sel ? ( 
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }} className="space-y-4"> 
              <div className="pt-2 pb-1"> 
                <h1 className="t-large-title">VCM Хөтөлбөрүүд</h1> 
                <p className="t-subhead mt-1" style={{ color: 'var(--label2)' }}>Танд тохирохоо сонгоорой</p> 
              </div> 

              {/* Segmented filter */} 
              <div className="seg overflow-x-auto no-scroll"> 
                {[{ id: 'all', l: 'Бүгд' }, { id: 'EDU', l: '🎓 EDU' }, { id: 'AND', l: '🤝 AND' }, { id: 'VCLUB', l: '🌍 VClub' }].map(f => ( 
                  <button key={f.id} onClick={() => setFilter(f.id)} className={`seg-item flex-shrink-0 ${filter === f.id ? 'on' : ''}`}>{f.l}</button> 
                ))} 
              </div> 

              <div className="space-y-4 stagger"> 
                {list.map(p => <ProgCard key={p.id} p={p} onTap={() => setSel(p)} nt={nt} />)} 
              </div> 

              {!signed && ( 
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} 
                  className="card p-6 text-center" style={{ background: 'var(--bg-dark)' }}> 
                  <div className="text-4xl mb-3">✨</div> 
                  <h3 className="t-title3 text-white mb-2">Нэгдэхэд бэлэн үү?</h3> 
                  <p className="t-footnote text-slate-400 mb-5 max-w-xs mx-auto leading-relaxed"> 
                    Бүртгүүлж хөтөлбөрт өргөдлөө гаргаарай. 
                  </p> 
                  <div className="flex gap-3 justify-center"> 
                    <Link href="/register" className="btn btn-primary btn-sm">Бүртгүүлэх</Link> 
                    <Link href="/sign-in" className="btn btn-sm text-white" style={{ background: 'rgba(255,255,255,0.12)' }}>Нэвтрэх</Link> 
                  </div> 
                </motion.div> 
              )} 
            </motion.div> 
          ) : ( 
            <ProgDetail key="detail" p={sel} onBack={() => setSel(null)} nt={nt} signed={signed} /> 
          )} 
        </AnimatePresence> 
      </div> 
    </div> 
  ); 
}