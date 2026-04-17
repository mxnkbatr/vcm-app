"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar, MapPin, ArrowLeft, Share2,
  Clock, Building2, CheckCircle2, Users, ChevronRight,
  Info
} from "lucide-react";
import { motion } from "framer-motion";
import { useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary";
import { Link } from "@/navigation";

import { QRCodeSVG } from "qrcode.react";

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

const CAT_META: Record<string, { color: string; bg: string }> = {
  campaign:   { color: "#0A84FF", bg: "rgba(10,132,255,0.14)" },
  workshop:   { color: "#FF9F0A", bg: "rgba(255,159,10,0.14)" },
  meeting:    { color: "#30D158", bg: "rgba(48,209,88,0.14)"  },
  fundraiser: { color: "#FF3B30", bg: "rgba(255,59,48,0.14)"  },
  general:    { color: "#8E8E93", bg: "rgba(142,142,147,0.14)"},
};
const getCat = (c: string) => CAT_META[c?.toLowerCase()] || CAT_META.general;

export default function EventDetailPage() {
  const locale = useLocale() as "en" | "mn" | "de";
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const user = session?.user;

  const [mounted, setMounted] = useState(false);
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => setMounted(true), []);
  const id = params.id as string;

  useEffect(() => {
    if (!id) return;
    fetch(`/api/events/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setEvent(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleJoin = async () => {
    if (!user) { router.push("/sign-in"); return; }
    setJoining(true);
    try {
      const res = await fetch(`/api/events/${id}`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setHasJoined(true);
        const r2 = await fetch(`/api/events/${id}`);
        if (r2.ok) setEvent(await r2.json());
      } else {
        alert(data.error || "Failed to join event");
      }
    } catch { alert("Something went wrong. Please try again."); }
    finally { setJoining(false); }
  };

  /* ── Loading ── */
  if (!mounted || loading) return (
    <div className="min-h-dvh flex items-center justify-center" style={{ background: "var(--bg)" }}>
      <div className="space-y-4 w-full px-5">
        <div className="animate-pulse rounded-3xl" style={{ height: 350, background: "var(--fill2)" }} />
        <div className="animate-pulse rounded-3xl" style={{ height: 140, background: "var(--fill2)" }} />
        <div className="animate-pulse rounded-3xl" style={{ height: 100, background: "var(--fill2)" }} />
      </div>
    </div>
  );

  /* ── Not found ── */
  if (!event) return (
    <div className="min-h-dvh flex flex-col items-center justify-center gap-4 px-6" style={{ background: "var(--bg)" }}>
      <div className="text-5xl">📅</div>
      <h1 className="text-[20px] font-bold text-center" style={{ color: "var(--label)" }}>
        Арга хэмжээ олдсонгүй
      </h1>
      <Link href="/events" className="px-6 py-3 rounded-2xl text-white font-semibold text-[14px]"
        style={{ background: "var(--blue)" }}>
        Буцах
      </Link>
    </div>
  );

  const cat = getCat(event.category);

  const d = new Date(event.date);
  const dateFormatted = d.toLocaleDateString(
    locale === "mn" ? "mn-MN" : locale === "de" ? "de-DE" : "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );
  const day   = d.getDate().toString().padStart(2, "0");
  const month = d.toLocaleDateString("en-US", { month: "short" }).toUpperCase();

  const title = event.title[locale] || event.title.en;
  const desc  = event.description[locale] || event.description.en;
  const loc   = event.location[locale] || event.location.en;

  const META_ROWS = [
    { icon: Calendar,  label: "Огноо",   value: dateFormatted },
    { icon: Clock,     label: "Цаг",     value: event.timeString },
    { icon: MapPin,    label: "Байршил", value: loc },
    ...(event.university ? [{ icon: Building2, label: "Байгууллага", value: event.university }] : []),
  ];

  return (
    <div
      className="min-h-dvh relative"
      style={{ background: "var(--bg)", paddingBottom: 160 }}
    >
      {/* ── Top Nav (Back & Share) ── */}
      <div
        className="absolute top-0 left-0 right-0 px-4 flex justify-between items-center z-20"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 12px) + 12px)" }}
      >
        <button
          onClick={() => router.back()}
          className="press w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            background: "rgba(255,255,255,0.2)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "0.5px solid rgba(255,255,255,0.3)"
          }}
        >
          <ArrowLeft size={20} color="white" />
        </button>
        <button
          className="press w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            background: "rgba(255,255,255,0.2)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "0.5px solid rgba(255,255,255,0.3)"
          }}
        >
          <Share2 size={18} color="white" />
        </button>
      </div>

      {/* ── Hero Image Card ── */}
      <div className="px-4" style={{ paddingTop: "calc(env(safe-area-inset-top, 12px) + 64px)" }}>
        <div
          className="relative w-full overflow-hidden"
          style={{
            height: "45vh",
            minHeight: 340,
            maxHeight: 460,
            borderRadius: "var(--r-3xl)",
            boxShadow: "var(--s-card)"
          }}
        >
          {event.image ? (
            <Image
              src={optimizeCloudinaryUrl(event.image)}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 800px"
              priority
            />
          ) : (
            <div
              className="w-full h-full"
              style={{ background: `linear-gradient(135deg, ${cat.color}33, ${cat.color}66)` }}
            />
          )}
          
          {/* Gradient overlay for text readability */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.1) 100%)",
            }}
          />

          {/* Date badge (Floating top right inside card) */}
          <div
            className="absolute flex flex-col items-center justify-center"
            style={{
              top: 16,
              right: 16,
              background: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "0.5px solid rgba(255,255,255,0.3)",
              borderRadius: 16,
              padding: "8px 14px",
              minWidth: 52,
              zIndex: 30
            }}
          >
            <span className="text-[22px] font-black text-white leading-none">{day}</span>
            <span className="text-[9px] font-bold text-white/75 uppercase tracking-widest mt-0.5">{month}</span>
          </div>

          {/* Title & Badges inside Hero */}
          <div className="absolute bottom-6 left-5 right-5 z-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex flex-wrap items-center gap-2 mb-3.5">
                <span
                  className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-sm"
                  style={{ background: cat.color }}
                >
                  {event.category}
                </span>
                <span
                  className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-sm"
                  style={{ background: "rgba(255,255,255,0.25)", backdropFilter: "blur(12px)" }}
                >
                  {day} {month}
                </span>
                {event.featured && (
                  <span
                    className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-sm"
                    style={{ background: "rgba(255,214,10,0.3)", backdropFilter: "blur(12px)", color: "#FFD60A" }}
                  >
                    ⭐ Онцлох
                  </span>
                )}
              </div>
              <h1 className="text-[26px] font-bold text-white leading-tight drop-shadow-md">
                {title}
              </h1>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="relative z-30 px-4 pt-6 pb-8 space-y-5">
        {/* Meta info — iOS grouped rows */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="overflow-hidden"
          style={{
            borderRadius: "var(--r-2xl)",
            background: "var(--card)",
            boxShadow: "var(--s-card)",
          }}
        >
          {META_ROWS.map(({ icon: Icon, label, value }, idx) => (
            <div key={label}>
              <div className="flex items-center gap-4 px-4 py-3.5">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: cat.bg }}
                >
                  <Icon size={18} style={{ color: cat.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium mb-0.5" style={{ color: "var(--label3)" }}>
                    {label}
                  </p>
                  <p className="text-[15px] font-semibold truncate" style={{ color: "var(--label)" }}>
                    {value}
                  </p>
                </div>
              </div>
              {idx < META_ROWS.length - 1 && (
                <div className="h-px ml-[68px]" style={{ background: "var(--sep)" }} />
              )}
            </div>
          ))}
        </motion.div>

        {/* Attendees */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between px-4 py-4 overflow-hidden"
          style={{
            borderRadius: "var(--r-2xl)",
            background: "var(--card)",
            boxShadow: "var(--s-card)",
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: "var(--fill2)" }}
            >
              <Users size={18} style={{ color: "var(--label2)" }} />
            </div>
            <div>
              <p className="text-[12px] font-medium mb-0.5" style={{ color: "var(--label3)" }}>Оролцогчид</p>
              <p className="text-[15px] font-semibold" style={{ color: "var(--label)" }}>
                {event.attendees.length} хүн бүртгүүлсэн
              </p>
            </div>
          </div>
          {/* Avatar stack */}
          <div className="flex -space-x-2">
            {[...Array(Math.min(4, event.attendees.length || 3))].map((_, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                style={{
                  background: `hsl(${i * 45 + 200}, 75%, 55%)`,
                  borderColor: "var(--card)",
                }}
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="overflow-hidden"
          style={{
            borderRadius: "var(--r-2xl)",
            background: "var(--card)",
            boxShadow: "var(--s-card)",
          }}
        >
          <div className="px-5 pt-5 pb-2 flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: cat.bg }}
            >
              <Info size={18} style={{ color: cat.color }} />
            </div>
            <span className="text-[17px] font-bold" style={{ color: "var(--label)" }}>
              Арга хэмжээний тухай
            </span>
          </div>
          <div className="px-5 pb-6 pt-2 space-y-4">
            {desc.split("\n").filter(p => p.trim()).map((para, i) => (
              <p key={i} className="text-[15px] leading-relaxed" style={{ color: "var(--label2)" }}>
                {para}
              </p>
            ))}
          </div>
        </motion.div>

        {/* Ticket QR Code */}
        {hasJoined && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="overflow-hidden flex flex-col items-center justify-center py-8"
            style={{
              borderRadius: "var(--r-2xl)",
              background: "var(--card)",
              boxShadow: "var(--s-card)",
            }}
          >
            <p className="text-[14px] font-bold mb-4" style={{ color: "var(--label)" }}>
              Таны тасалбар
            </p>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <QRCodeSVG value={`vcm-event-${event._id}-${user?.email}`} size={160} />
            </div>
            <p className="text-[12px] mt-4" style={{ color: "var(--label3)" }}>
              Орохдоо энэхүү QR кодыг уншуулна уу
            </p>
          </motion.div>
        )}

      </div>

      {/* ── Sticky bottom CTA ── */}
      <div
        className="fixed left-0 right-0 px-4 pt-3"
        style={{
          bottom: "calc(64px + env(safe-area-inset-bottom, 0px))", // Above MobileChrome tab bar
          paddingBottom: 16,
          background: "linear-gradient(to top, var(--bg) 60%, transparent)",
          zIndex: 50,
        }}
      >
        {hasJoined ? (
          <div
            className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-[16px] font-bold shadow-lg"
            style={{ background: "var(--card)", color: "#30D158" }}
          >
            <CheckCircle2 size={20} />
            Амжилттай бүртгүүлсэн
          </div>
        ) : (
          <button
            onClick={handleJoin}
            disabled={joining || status === "loading"}
            className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-[16px] font-bold text-white transition-all active:scale-[0.97] disabled:opacity-60"
            style={{ background: cat.color, boxShadow: `0 8px 24px ${cat.color}55` }}
          >
            {joining ? (
              <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <>
                {user ? "Оролцох" : "Нэвтэрч бүртгүүлэх"}
                <ChevronRight size={18} />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
