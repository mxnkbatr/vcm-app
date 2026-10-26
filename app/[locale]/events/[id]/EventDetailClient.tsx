"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar, MapPin, Share2,
  Clock, Building2, CheckCircle2, Users, ChevronRight,
  CalendarPlus, ScanLine, Info,
} from "lucide-react";
import { motion } from "framer-motion";
import { useLocale } from "next-intl";
import { useSession } from "@/lib/hooks/useSession";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary";
import { Link } from "@/navigation";
import { QRCodeSVG } from "qrcode.react";
import { IOSAlert } from "@/app/components/iOSAlert";
import RichHtmlContent from "@/app/components/RichHtmlContent";
import DetailDock from "@/app/components/DetailDock";
import { nativeShare } from "@/lib/native-share";
import { buildEventIcs, downloadIcs } from "@/lib/event-ics";
import { scheduleEventDayBeforeReminder } from "@/lib/event-reminder";
import { hapticNotification } from "@/lib/haptics";
import { NotificationType } from "@capacitor/haptics";
import { BLUR_DATA_URL } from "@/lib/image-blur";
import { springNative } from "@/lib/motion";

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
  ticketPrice?: number;
  source?: string;
  externalUrl?: string;
}

const CAT_META: Record<string, { color: string; bg: string }> = {
  campaign:   { color: "#0A84FF", bg: "rgba(10,132,255,0.14)" },
  workshop:   { color: "#FF9F0A", bg: "rgba(255,159,10,0.14)" },
  meeting:    { color: "#30D158", bg: "rgba(48,209,88,0.14)"  },
  fundraiser: { color: "#FF3B30", bg: "rgba(255,59,48,0.14)"  },
  general:    { color: "#8E8E93", bg: "rgba(142,142,147,0.14)"},
};
const getCat = (c: string) => CAT_META[c?.toLowerCase()] || CAT_META.general;

export default function EventDetailClient({
  initialEvent,
}: {
  initialEvent?: EventDetail | null;
}) {
  const locale = useLocale() as "en" | "mn" | "de";
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const user = session?.user;

  const [mounted, setMounted] = useState(false);
  const [event, setEvent] = useState<EventDetail | null>(initialEvent ?? null);
  const [loading, setLoading] = useState(!initialEvent);
  const [joining, setJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [scanMsg, setScanMsg] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ title: string; message: string; type?: "error" | "info" } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setMounted(true), []);
  const id = params.id as string;

  useEffect(() => {
    if (!event) return;
    const t = event.title[locale] || event.title.en;
    window.dispatchEvent(new CustomEvent("vcm:page-title", { detail: { title: t } }));
    return () => {
      window.dispatchEvent(new CustomEvent("vcm:page-title", { detail: { title: "" } }));
    };
  }, [event, locale]);

  useEffect(() => {
    if (initialEvent || !id) return;
    fetch(`/api/events/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setEvent(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, initialEvent]);

  useEffect(() => {
    if (!event || !user?.id) return;
    setHasJoined(event.attendees?.some((a) => String(a) === String(user.id)) ?? false);
  }, [event, user?.id]);

  const handleShare = async () => {
    if (!event) return;
    const title = event.title[locale] || event.title.en;
    const url = typeof window !== "undefined" ? window.location.href : undefined;
    await nativeShare({
      title,
      text: locale === "mn" ? `${title} — VCM эвент` : `${title} — VCM event`,
      url,
      dialogTitle: locale === "mn" ? "Хуваалцах" : "Share",
    });
  };

  const handleAddToCalendar = () => {
    if (!event) return;
    const title = event.title[locale] || event.title.en;
    const desc = event.description[locale] || event.description.en;
    const loc = event.location[locale] || event.location.en;
    const ics = buildEventIcs({
      id: event._id,
      title,
      description: typeof desc === "string" ? desc.replace(/<[^>]+>/g, " ").slice(0, 400) : "",
      location: loc,
      start: new Date(event.date),
      url: typeof window !== "undefined" ? window.location.href : undefined,
    });
    downloadIcs(`vcm-${event._id}`, ics);
  };

  const handleScanFile = async (file: File) => {
    // Client-only decode via BarcodeDetector when available; otherwise prompt manual confirm.
    try {
      const BD = (window as unknown as { BarcodeDetector?: new (o: { formats: string[] }) => { detect: (b: ImageBitmap) => Promise<{ rawValue: string }[]> } }).BarcodeDetector;
      if (BD) {
        const detector = new BD({ formats: ["qr_code"] });
        const bmp = await createImageBitmap(file);
        const codes = await detector.detect(bmp);
        bmp.close();
        const raw = codes[0]?.rawValue || "";
        if (raw.startsWith("vcm-volunteer:")) {
          setScanMsg(locale === "mn" ? "Ирц амжилттай бүртгэгдлээ" : "Attendance recorded");
          void hapticNotification(NotificationType.Success);
          return;
        }
      }
    } catch {
      /* fall through */
    }
    setScanMsg(
      locale === "mn"
        ? "QR уншигдсангүй. Профайлын үнэмлэхийг ойртуулна уу"
        : "Could not read QR. Try the volunteer ID from profile"
    );
    void hapticNotification(NotificationType.Error);
  };

  const handleJoin = async () => {
    if (!user) { router.push("/sign-in"); return; }
    setJoining(true);
    try {
      const res = await fetch(`/api/events/${id}`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setHasJoined(true);
        setShowConfetti(true);
        void hapticNotification(NotificationType.Success);
        setTimeout(() => setShowConfetti(false), 2200);
        if (user?.id) {
          setEvent((prev) =>
            prev ? { ...prev, attendees: [...(prev.attendees || []), user.id] } : prev
          );
        }
        const title = event?.title?.[locale] || event?.title?.en || "VCM";
        if (event?.date) {
          void scheduleEventDayBeforeReminder({
            eventId: String(id),
            title: locale === "mn" ? "Эвентийн сануулга" : "Event reminder",
            body:
              locale === "mn"
                ? `Маргааш: ${title}`
                : `Tomorrow: ${title}`,
            eventStart: new Date(event.date),
          });
        }
      } else {
        void hapticNotification(NotificationType.Error);
        setAlert({
          title: locale === "mn" ? "Алдаа" : "Error",
          message: data.error || (locale === "mn" ? "Оролцох боломжгүй" : "Failed to join event"),
          type: "error",
        });
      }
    } catch {
      void hapticNotification(NotificationType.Error);
      setAlert({
        title: locale === "mn" ? "Алдаа" : "Error",
        message: locale === "mn" ? "Дахин оролдоно уу" : "Something went wrong. Please try again.",
        type: "error",
      });
    } finally {
      setJoining(false);
    }
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
    <div className="app-detail app-detail--event">
      <div className="app-detail__hero app-detail__hero--event">
        {event.image ? (
          <Image
            src={optimizeCloudinaryUrl(event.image)}
            alt={title}
            fill
            className="app-detail__hero-img object-cover"
            sizes="100vw"
            priority
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(145deg, ${cat.color}, color-mix(in srgb, ${cat.color} 55%, #1a1a2e))` }}
          />
        )}
        <div className="app-detail__hero-fade" aria-hidden />

        <div className="app-detail__date-float" aria-hidden>
          <span className="app-detail__date-day">{day}</span>
          <span className="app-detail__date-month">{month}</span>
        </div>
      </div>

      <div className="app-detail__sheet">
        <div className="app-detail__handle" aria-hidden />

        <div className="app-detail__meta">
          <span className="app-detail__pill" style={{ color: cat.color, background: cat.bg }}>
            {event.category}
          </span>
          {event.featured ? (
            <span className="app-detail__pill app-detail__pill--accent">Онцлох</span>
          ) : null}
          <span className="app-detail__meta-item">
            {day} {month}
          </span>
        </div>

        <h1 className="app-detail__title">{title}</h1>

        {/* Meta info — iOS grouped rows */}
        <motion.div
          initial={{ y: 12 }}
          animate={{ y: 0 }}
          transition={{ ...springNative, delay: 0.04 }}
          className="app-detail__card"
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
          initial={{ y: 12 }}
          animate={{ y: 0 }}
          transition={{ ...springNative, delay: 0.06 }}
          className="app-detail__card flex items-center justify-between px-4 py-4"
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
          initial={{ y: 12 }}
          animate={{ y: 0 }}
          transition={{ ...springNative, delay: 0.08 }}
          className="app-detail__card overflow-hidden"
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
            {/<\/?[a-z][\s\S]*>/i.test(desc) ? (
              <RichHtmlContent html={desc} />
            ) : (
              desc.split("\n").filter((p) => p.trim()).map((para, i) => (
                <p key={i} className="app-article__p">
                  {para}
                </p>
              ))
            )}
          </div>
        </motion.div>

        <div className="app-detail__actions">
          <button
            type="button"
            onClick={handleAddToCalendar}
            className="app-detail__action press"
          >
            <CalendarPlus size={18} strokeWidth={1.75} />
            {locale === "mn" ? "Календарьт нэмэх" : "Add to calendar"}
          </button>
          <button
            type="button"
            onClick={() => void handleShare()}
            className="app-detail__action press"
          >
            <Share2 size={18} strokeWidth={1.75} />
            {locale === "mn" ? "Хуваалцах" : "Share"}
          </button>
        </div>

        {/* Ticket QR + attendance scan */}
        {hasJoined && (
          <motion.div
            initial={{ y: 10 }}
            animate={{ y: 0 }}
            transition={springNative}
            className="app-detail__card flex flex-col items-center justify-center py-8 px-4"
          >
            <p className="text-[14px] font-bold mb-4" style={{ color: "var(--label)" }}>
              Таны тасалбар
            </p>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <QRCodeSVG value={`vcm-event-${event._id}-${user?.email}`} size={160} />
            </div>
            <p className="text-[12px] mt-4 text-center" style={{ color: "var(--label3)" }}>
              Орохдоо энэхүү QR кодыг уншуулна уу
            </p>
            <button
              type="button"
              onClick={() => {
                setScanOpen(true);
                setScanMsg(null);
                fileInputRef.current?.click();
              }}
              className="press mt-4 flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-semibold"
              style={{ background: "var(--fill2)", color: "var(--blue)" }}
            >
              <ScanLine size={16} strokeWidth={1.75} />
              {locale === "mn" ? "Ирц QR уншуулах" : "Scan attendance QR"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleScanFile(f);
                e.target.value = "";
                setScanOpen(false);
              }}
            />
            {scanMsg && (
              <p className="text-[13px] mt-3 font-medium text-center" style={{ color: "var(--emerald)" }}>
                {scanMsg}
              </p>
            )}
            {scanOpen && !scanMsg && (
              <p className="text-[12px] mt-2" style={{ color: "var(--label3)" }}>
                {locale === "mn" ? "Камер нээгдэж байна…" : "Opening camera…"}
              </p>
            )}
          </motion.div>
        )}
      </div>

      {showConfetti && (
        <div className="pointer-events-none fixed inset-0 z-[80] overflow-hidden flex items-center justify-center" aria-hidden>
          {Array.from({ length: 28 }).map((_, i) => (
            <span
              key={i}
              className="absolute w-2 h-2 rounded-sm"
              style={{
                left: `${(i * 17) % 100}%`,
                top: "-8px",
                background: ["#1E5BD8", "#34C759", "#FF9F0A", "#FF3B30", "#AF52DE"][i % 5],
                animation: `ios-confetti-fall 1.4s ease-in ${i * 0.04}s forwards`,
              }}
            />
          ))}
          <motion.div
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 420, damping: 18 }}
            className="relative z-10 w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: "var(--emerald)", boxShadow: "0 12px 40px rgba(52,199,89,0.45)" }}
          >
            <CheckCircle2 size={40} color="white" strokeWidth={2.25} />
          </motion.div>
          <style>{`@keyframes ios-confetti-fall{to{transform:translateY(110vh) rotate(540deg);opacity:0}}`}</style>
        </div>
      )}

      <DetailDock>
        {hasJoined ? (
          <button type="button" className="detail-dock__btn detail-dock__btn--success" disabled>
            <CheckCircle2 size={20} strokeWidth={1.75} />
            Амжилттай бүртгүүлсэн
          </button>
        ) : (
          <button
            type="button"
            onClick={handleJoin}
            disabled={joining || status === "loading"}
            className="detail-dock__btn detail-dock__btn--primary press"
          >
            {joining ? (
              <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin inline-block" />
            ) : (
              <>
                {user ? "Нэгдэх" : "Нэвтэрч бүртгүүлэх"}
                <ChevronRight size={18} strokeWidth={1.75} />
              </>
            )}
          </button>
        )}
      </DetailDock>

      <IOSAlert
        isOpen={!!alert}
        onClose={() => setAlert(null)}
        title={alert?.title || ""}
        message={alert?.message || ""}
        type={alert?.type || "info"}
        confirmText={locale === "mn" ? "Ойлголоо" : "OK"}
      />
    </div>
  );
}
