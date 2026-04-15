"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { 
  Calendar, 
  MapPin, 
  ArrowLeft,
  Share2,
  Clock,
  Tag,
  Loader2,
  Facebook,
  Twitter,
  Linkedin,
  Zap,
  Bookmark,
  Users,
  Building2,
  CalendarDays,
  CheckCircle2
} from "lucide-react";
import { motion, useScroll, useSpring } from "framer-motion";
import { useTheme } from "next-themes";
import { useTranslations, useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary";

interface EventDetail {
  _id: string;
  title: { en: string; mn: string; de: string };
  description: { en: string; mn: string; de: string };
  date: string;
  timeString: string;
  location: { en: string; mn: string; de: string };
  image: string;
  category: string;
  university: string;
  status: string;
  featured: boolean;
  attendees: string[];
}

export default function EventDetailPage() {
  const t = useTranslations("events");
  const locale = useLocale() as "en" | "mn" | "de";
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const userLoaded = status !== "loading";
  const user = session?.user;
  const { theme } = useTheme();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  const [mounted, setMounted] = useState(false);
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => setMounted(true), []);
  const isDark = mounted && (theme === "dark" || !theme);
  const id = params.id as string;

  useEffect(() => {
    async function fetchEvent() {
      if (!id) return;
      try {
        const res = await fetch(`/api/events/${id}`);
        if (res.ok) {
          const json = await res.json();
          setEvent(json);
        }
      } catch (error) { console.error(error); } 
      finally { setLoading(false); }
    }
    fetchEvent();
  }, [id]);

  const handleJoinEvent = async () => {
    if (!user) {
      router.push('/sign-in');
      return;
    }

    setJoining(true);
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        setHasJoined(true);
        // Refresh event data to update attendee count
        const refreshRes = await fetch(`/api/events/${id}`);
        if (refreshRes.ok) {
          const json = await refreshRes.json();
          setEvent(json);
        }
      } else {
        alert(data.error || "Failed to join event");
      }
    } catch (error) {
      console.error("Error joining event:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setJoining(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="ios-spinner" />
      </div>
    );
  }

  if (!event) return (
    <div className="min-h-dvh flex flex-col items-center justify-center" style={{ background: 'var(--bg)' }}>
       <h1 className="t-headline mb-4">{t("notFound")}</h1>
       <Link href="/events" className="btn btn-primary btn-sm">{t("returnToEvents")}</Link>
    </div>
  );

  const eventDate = new Date(event.date).toLocaleDateString(locale === 'mn' ? 'mn-MN' : locale === 'de' ? 'de-DE' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="page">
      <div className="page-inner space-y-6">
        
        {/* NAVIGATION */}
        <Link href="/events" className="inline-flex items-center gap-1.5 py-2 opacity-60 active:opacity-100 transition-opacity font-semibold text-[13px]" style={{ color: 'var(--blue)' }}>
           <ArrowLeft size={16} /> {t("back")}
        </Link>

        {/* HERO HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card overflow-hidden"
        >
           <div className="relative aspect-[16/9] w-full">
              <Image 
                 src={optimizeCloudinaryUrl(event.image)} 
                 alt={event.title[locale] || event.title.en} 
                 fill
                 className="object-cover"
                 sizes="100vw"
                 priority
              />
              <div className="absolute top-4 left-4">
                 <div className="badge text-[10px] uppercase tracking-widest shadow-sm" style={{ background: 'rgba(255,255,255,0.9)', color: 'var(--blue)' }}>
                    {event.category}
                 </div>
              </div>
           </div>

           <div className="p-6 space-y-6">
              <h1 className="t-large-title !text-2xl leading-tight">
                 {event.title[locale] || event.title.en}
              </h1>

              <div className="space-y-3">
                 <div className="flex items-center gap-3">
                    <div className="icon-box-sm" style={{ background: 'var(--bg)' }}>
                       <CalendarDays size={14} style={{ color: 'var(--label2)' }} />
                    </div>
                    <span className="t-subhead">{eventDate}</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="icon-box-sm" style={{ background: 'var(--bg)' }}>
                       <Clock size={14} style={{ color: 'var(--label2)' }} />
                    </div>
                    <span className="t-subhead">{event.timeString}</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="icon-box-sm" style={{ background: 'var(--bg)' }}>
                       <MapPin size={14} style={{ color: 'var(--label2)' }} />
                    </div>
                    <span className="t-subhead">{event.location[locale] || event.location.en}</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="icon-box-sm" style={{ background: 'var(--bg)' }}>
                       <Building2 size={14} style={{ color: 'var(--label2)' }} />
                    </div>
                    <span className="t-subhead">{event.university}</span>
                 </div>
              </div>
           </div>
        </motion.div>

        {/* DESCRIPTION */}
        <div className="space-y-6">
           <motion.div 
             initial={{ opacity: 0, y: 12 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
             className="card p-6"
           >
              <h3 className="t-headline mb-4 flex items-center gap-2">
                 <span className="w-1 h-5 rounded-full" style={{ background: 'var(--blue)' }} />
                 Арга хэмжээний тухай
              </h3>
              <div className="space-y-4">
                 {(event.description[locale] || event.description.en).split('\n').map((para, i) => (
                    para.trim() && (
                      <p key={i} className="t-body leading-relaxed" style={{ color: 'var(--label2)' }}>
                         {para}
                      </p>
                    )
                 ))}
              </div>
           </motion.div>

           {/* JOIN CARD */}
           <motion.div 
             initial={{ opacity: 0, y: 12 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 }}
             className="card p-6 text-center space-y-4"
             style={{ background: 'var(--blue-dim)' }}
           >
              <div className="flex justify-center -space-x-2 overflow-hidden mb-2">
                 {[...Array(5)].map((_, i) => (
                    <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-slate-200 flex items-center justify-center text-[10px] font-bold">
                       {i === 4 ? `+${event.attendees.length}` : <User size={12} />}
                    </div>
                 ))}
              </div>
              <p className="t-footnote" style={{ color: 'var(--label2)' }}>
                 Одоогоор {event.attendees.length} хүн оролцохоор бүртгүүлсэн байна.
              </p>
              
              <button
                 onClick={handleJoinEvent}
                 disabled={joining || hasJoined}
                 className={`btn btn-primary btn-full ${hasJoined ? 'opacity-50' : ''}`}
              >
                 {joining ? <div className="ios-spinner !w-5 !h-5" /> : hasJoined ? <><CheckCircle2 size={18} /> Бүртгэгдсэн</> : "Оролцох"}
              </button>

              <div className="pt-4 border-t border-dashed" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
                 <div className="flex items-center justify-center gap-4">
                    <button className="icon-box-sm" style={{ background: 'var(--bg)' }}>
                       <Share2 size={16} style={{ color: 'var(--label2)' }} />
                    </button>
                    <button className="icon-box-sm" style={{ background: 'var(--bg)' }}>
                       <Bookmark size={16} style={{ color: 'var(--label2)' }} />
                    </button>
                 </div>
              </div>
           </motion.div>
        </div>

      </div>
    </div>
  );
}