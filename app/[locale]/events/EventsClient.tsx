"use client"; 
import React, { useState, useEffect } from "react"; 
import Image from "next/image"; 
import Link from "next/link"; 
import { motion, AnimatePresence } from "framer-motion"; 
import { Clock, MapPin, ChevronRight, Calendar } from "lucide-react"; 
import { useTranslations, useLocale } from "next-intl"; 

interface EventItem { 
  _id: string; 
  title: { [k: string]: string }; 
  description: { [k: string]: string }; 
  date: string; 
  timeString: string; 
  location: { [k: string]: string }; 
  image: string; 
  category: string; 
  status: string; 
  link?: string; 
} 

const CAT_COLORS: Record<string, { bg: string; color: string }> = { 
  campaign:    { bg: '#E8F4FF', color: '#0A84FF' }, 
  workshop:    { bg: '#FFF5E6', color: '#FF9F0A' }, 
  meeting:     { bg: '#E8FFF0', color: '#30D158' }, 
  fundraiser:  { bg: '#FFE8E8', color: '#FF3B30' }, 
  default:     { bg: 'var(--fill2)', color: 'var(--label2)' }, 
}; 

function EventCard({ ev, locale }: { ev: EventItem; locale: string }) { 
  const c = CAT_COLORS[ev.category] || CAT_COLORS.default; 
  const title = ev.title?.[locale] || ev.title?.en || ''; 
  const loc   = ev.location?.[locale] || ev.location?.en || ''; 
  const date  = new Date(ev.date).toLocaleDateString(locale === 'mn' ? 'mn-MN' : 'en-US', { month: 'short', day: 'numeric' }); 

  return ( 
    <motion.div 
      className="card overflow-hidden press" 
      initial={{ opacity: 0, y: 12 }} 
      animate={{ opacity: 1, y: 0 }} 
      whileTap={{ scale: 0.97 }} 
      transition={{ type: 'spring', stiffness: 400, damping: 35 }} 
    > 
      <Link href={`/events/${ev._id}`} className="block"> 
        <div className="relative h-44 overflow-hidden bg-slate-100"> 
          <Image src={ev.image || ''} alt={title} fill className="object-cover" /> 
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" /> 
          <div className="absolute top-3 left-3"> 
            <span className="badge text-[11px]" style={{ background: c.bg, color: c.color }}>{ev.category}</span> 
          </div> 
        </div> 
        <div className="p-4 space-y-2"> 
          <h3 className="t-headline line-clamp-2">{title}</h3> 
          <div className="flex items-center gap-3"> 
            <span className="t-caption flex items-center gap-1"> 
              <Calendar size={11} style={{ color: 'var(--blue)' }} />{date} · {ev.timeString} 
            </span> 
          </div> 
          <div className="flex items-center justify-between pt-1"> 
            <span className="t-caption flex items-center gap-1"> 
              <MapPin size={11} style={{ color: 'var(--label3)' }} />{loc} 
            </span> 
            <span className="t-caption font-semibold flex items-center gap-0.5" style={{ color: 'var(--blue)' }}> 
              Дэлгэрэнгүй <ChevronRight size={13} /> 
            </span> 
          </div> 
        </div> 
      </Link> 
    </motion.div> 
  ); 
} 

export default function EventsClient() { 
  const t = useTranslations("EventsPage"); 
  const locale = useLocale(); 
  const [filter, setFilter] = useState("all"); 
  const [events, setEvents] = useState<EventItem[]>([]); 
  const [loading, setLoading] = useState(true); 

  useEffect(() => { 
    fetch("/api/events").then(r => r.json()).then(d => { if (Array.isArray(d)) setEvents(d); }).catch(console.error).finally(() => setLoading(false)); 
  }, []); 

  const CATS = ["all", "campaign", "workshop", "meeting", "fundraiser"]; 
  const filtered = filter === "all" ? events : events.filter(e => e.category === filter); 

  if (loading) return ( 
    <div className="min-h-dvh flex items-center justify-center" style={{ background: 'var(--bg)' }}> 
      <div className="ios-spinner" /> 
    </div> 
  ); 

  return ( 
    <div className="page"> 
      <div className="page-inner space-y-4"> 
        <div className="pt-2 pb-1"> 
          <h1 className="t-large-title">Арга хэмжээ</h1> 
          <p className="t-subhead mt-1" style={{ color: 'var(--label2)' }}>Ойрын үйл явдлуудыг хар</p> 
        </div> 

        {/* Filter */} 
        <div className="overflow-x-auto no-scroll -mx-4 px-4"> 
          <div className="seg inline-flex"> 
            {CATS.map(c => ( 
              <button key={c} onClick={() => setFilter(c)} className={`seg-item ${filter === c ? 'on' : ''}`}> 
                {c === 'all' ? 'Бүгд' : c.charAt(0).toUpperCase() + c.slice(1)} 
              </button> 
            ))} 
          </div> 
        </div> 

        {/* Cards */} 
        <AnimatePresence mode="popLayout"> 
          {filtered.length === 0 ? ( 
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-10 text-center"> 
              <div className="text-4xl mb-3">📅</div> 
              <p className="t-headline mb-1">Арга хэмжээ байхгүй</p> 
              <p className="t-footnote">Удахгүй шинэ арга хэмжээ нэмэгдэнэ</p> 
            </motion.div> 
          ) : ( 
            <div className="space-y-4 stagger"> 
              {filtered.map(ev => <EventCard key={ev._id} ev={ev} locale={locale} />)} 
            </div> 
          )} 
        </AnimatePresence> 
      </div> 
    </div> 
  ); 
}