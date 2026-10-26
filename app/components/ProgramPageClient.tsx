"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import {
  Clock,
  MapPin,
  CheckCircle2,
  Globe,
  ArrowRight,
  Sparkles,
  Send,
  User,
  Mail,
  Phone,
  CalendarDays,
} from "lucide-react";
import { useSession } from "@/lib/hooks/useSession";
import DetailDock from "@/app/components/DetailDock";
import { IOSAlert, IOSSheet } from "./iOSAlert";

interface ProgramConfig {
  id: string;
  emoji: string;
  gradientFrom: string;
  gradientTo: string;
  accentBg: string;
  accentText: string;
  btnBg: string;
  shadowColor: string;
  name: string;
  shortDesc: string;
  duration: string;
  type: string;
  location: string;
  openSlots: number;
  tags: { label: string; bg: string }[];
  features: { icon: React.ElementType; title: string; desc: string }[];
  requirements: string[];
  whyJoin: string;
  heroSub: string;
  steps: { num: string; title: string; desc: string }[];
}

function ApplyForm({
  prog,
  onClose,
  onSuccess,
}: {
  prog: ProgramConfig;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    age: "",
    level: "B1",
    message: "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.firstName || !form.email || !form.message) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, program: prog.id }),
      });
      if (res.ok) onSuccess();
      else throw new Error("Failed");
    } catch {
      setError("Алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <IOSSheet isOpen={true} onClose={onClose} title="Өргөдөл гаргах">
      <div className="p-6 space-y-5">
        <div
          className="app-detail__card flex items-center gap-4"
          style={{
            padding: 14,
            background: `linear-gradient(135deg, ${prog.gradientFrom}18, ${prog.gradientTo}12)`,
          }}
        >
          <span className="text-4xl">{prog.emoji}</span>
          <div className="flex-1 min-w-0">
            <div className="text-[15px] font-bold" style={{ color: "var(--label)" }}>
              {prog.name}
            </div>
            <div className="text-[12px] mt-0.5" style={{ color: "var(--label3)" }}>
              {prog.duration} · {prog.location}
            </div>
          </div>
        </div>

        <div className="input-group">
          <div className="input-row">
            <User size={18} style={{ color: "var(--label3)", flexShrink: 0 }} />
            <input
              value={form.firstName}
              onChange={(e) => set("firstName", e.target.value)}
              placeholder="Нэр"
            />
          </div>
          <div className="input-row">
            <User size={18} style={{ color: "var(--label3)", flexShrink: 0 }} />
            <input
              value={form.lastName}
              onChange={(e) => set("lastName", e.target.value)}
              placeholder="Овог"
            />
          </div>
          <div className="input-row">
            <Mail size={18} style={{ color: "var(--label3)", flexShrink: 0 }} />
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="Имэйл хаяг"
            />
          </div>
          <div className="input-row">
            <Phone size={18} style={{ color: "var(--label3)", flexShrink: 0 }} />
            <input
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="Утасны дугаар"
            />
          </div>
          <div className="input-row">
            <CalendarDays size={18} style={{ color: "var(--label3)", flexShrink: 0 }} />
            <input
              type="number"
              value={form.age}
              onChange={(e) => set("age", e.target.value)}
              placeholder="Нас"
            />
          </div>
          <div className="input-row">
            <Globe size={18} style={{ color: "var(--label3)", flexShrink: 0 }} />
            <select
              value={form.level}
              onChange={(e) => set("level", e.target.value)}
              className="flex-1"
            >
              <option value="A1">A1 — Анхан шат</option>
              <option value="A2">A2 — Суурь</option>
              <option value="B1">B1 — Дунд</option>
              <option value="B2">B2 — Дунд дээш</option>
              <option value="C1">C1 — Ахисан</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="app-detail__section-label">Урам зоригийн захиа</label>
          <textarea
            rows={4}
            value={form.message}
            onChange={(e) => set("message", e.target.value)}
            placeholder="Яагаад энэ хөтөлбөрт орохыг хүсэж байгаагаа бичнэ үү..."
            className="input"
            style={{ borderRadius: "var(--r-xl)" }}
          />
        </div>

        {error ? (
          <p className="text-[13px] text-center" style={{ color: "var(--red)" }}>
            {error}
          </p>
        ) : null}

        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={loading || !form.firstName || !form.email || !form.message}
          className="btn btn-primary btn-full"
          style={{
            opacity: loading || !form.firstName || !form.email || !form.message ? 0.5 : 1,
          }}
        >
          {loading ? (
            <div className="ios-spinner !w-5 !h-5" />
          ) : (
            <>
              Өргөдөл илгээх <Send size={16} className="ml-2" />
            </>
          )}
        </button>
        <div className="pb-8" />
      </div>

      <IOSAlert
        isOpen={!!error}
        onClose={() => setError(null)}
        title="Алдаа"
        message={error || ""}
        type="error"
      />
    </IOSSheet>
  );
}

function SuccessScreen({ prog, onDashboard }: { prog: ProgramConfig; onDashboard: () => void }) {
  return (
    <div className="app-detail app-detail--empty">
      <div className="app-detail__empty-icon" style={{ background: "var(--emerald-dim)", color: "var(--emerald)" }}>
        <CheckCircle2 size={28} strokeWidth={1.75} />
      </div>
      <h1 className="app-detail__title">Амжилттай!</h1>
      <p className="app-detail__lead" style={{ maxWidth: 320 }}>
        Таны өргөдөл {prog.name}-д хүргэгдлээ. VCM-ийн баг 24 цагийн дотор холбогдох болно.
      </p>
      <div className="flex flex-col gap-3 w-full max-w-xs mt-6">
        <button type="button" onClick={onDashboard} className="btn btn-primary btn-full">
          Миний хуудас руу →
        </button>
        <Link href="/programs" className="btn btn-ghost btn-full">
          Хөтөлбөрүүд харах
        </Link>
      </div>
    </div>
  );
}

export function ProgramPageClient({ config }: { config: ProgramConfig }) {
  const { status } = useSession();
  const isSignedIn = status === "authenticated";
  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("vcm:page-title", { detail: { title: config.name } }));
    return () => {
      window.dispatchEvent(new CustomEvent("vcm:page-title", { detail: { title: "" } }));
    };
  }, [config.name]);

  const handleApplyClick = () => {
    if (!isSignedIn) {
      window.location.href = "/register";
    } else {
      setShowForm(true);
    }
  };

  if (success) {
    return (
      <SuccessScreen
        prog={config}
        onDashboard={() => {
          window.location.href = "/dashboard";
        }}
      />
    );
  }

  return (
    <>
      <div className="app-detail app-detail--program">
        <div
          className="app-detail__hero app-detail__hero--event"
          style={{
            background: `linear-gradient(155deg, ${config.gradientFrom} 0%, ${config.gradientTo} 55%, #0f172a 120%)`,
            minHeight: 240,
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
            <span style={{ fontSize: 88, lineHeight: 1, filter: "drop-shadow(0 12px 28px rgba(0,0,0,0.25))" }}>
              {config.emoji}
            </span>
          </div>
          <div className="app-detail__hero-fade" aria-hidden />
        </div>

        <div className="app-detail__sheet">
          <div className="app-detail__handle" aria-hidden />

          <div className="app-detail__meta">
            <span className="app-detail__pill app-detail__pill--accent">
              <Sparkles size={11} /> {config.id}
            </span>
            <span className="app-detail__meta-item">
              <Clock size={13} strokeWidth={2} /> {config.duration}
            </span>
            <span className="app-detail__meta-item">
              <MapPin size={13} strokeWidth={2} /> {config.location}
            </span>
            {config.openSlots > 0 ? (
              <span className="app-detail__pill app-detail__pill--ok">
                {config.openSlots} сул орон
              </span>
            ) : null}
          </div>

          <h1 className="app-detail__title">{config.name}</h1>
          <p className="app-detail__lead">{config.heroSub || config.shortDesc}</p>

          {config.tags.length > 0 ? (
            <div className="app-detail__tags" style={{ marginTop: 4, marginBottom: 8 }}>
              {config.tags.map((t) => (
                <span key={t.label} className="app-detail__tag">
                  {t.label}
                </span>
              ))}
            </div>
          ) : null}

          <div className="app-detail__card" style={{ marginTop: 16, padding: "16px 18px" }}>
            <p className="app-detail__section-label">Хөтөлбөрийн тухай</p>
            <p className="app-article__p" style={{ marginTop: 8 }}>
              {config.heroSub}
            </p>
            <div className="flex items-center gap-2 mt-3 text-[13px]" style={{ color: "var(--label2)" }}>
              <Globe size={14} /> {config.type}
            </div>
          </div>

          <section style={{ marginTop: 18 }}>
            <p className="app-detail__section-label" style={{ marginBottom: 10 }}>
              Юу хийх вэ?
            </p>
            <div className="space-y-3">
              {config.features.map((f, i) => (
                <div key={i} className="app-detail__card" style={{ padding: "14px 16px" }}>
                  <div className="flex items-start gap-3">
                    <div
                      className="icon-box-sm"
                      style={{ background: "var(--blue-dim)", color: "var(--blue)", marginTop: 1 }}
                    >
                      <f.icon size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[15px] font-bold" style={{ color: "var(--label)" }}>
                        {f.title}
                      </div>
                      <div className="text-[13px] mt-1" style={{ color: "var(--label2)", lineHeight: 1.5 }}>
                        {f.desc}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section style={{ marginTop: 18 }}>
            <p className="app-detail__section-label" style={{ marginBottom: 10 }}>
              Шаардлага
            </p>
            <div className="app-detail__card" style={{ padding: "14px 16px" }}>
              <div className="space-y-3">
                {config.requirements.map((r, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: "var(--blue-dim)" }}
                    >
                      <div className="w-2 h-2 rounded-full" style={{ background: "var(--blue)" }} />
                    </div>
                    <span className="text-[14px]" style={{ color: "var(--label)", lineHeight: 1.45 }}>
                      {r}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section style={{ marginTop: 18 }}>
            <p className="app-detail__section-label" style={{ marginBottom: 10 }}>
              Хэрхэн нэгдэх вэ?
            </p>
            <div className="space-y-3">
              {config.steps.map((s) => (
                <div key={s.num} className="app-detail__card" style={{ padding: "14px 16px" }}>
                  <div className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                      style={{
                        background: `linear-gradient(135deg, ${config.gradientFrom}, ${config.gradientTo})`,
                      }}
                    >
                      {s.num}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[15px] font-bold" style={{ color: "var(--label)" }}>
                        {s.title}
                      </div>
                      <div className="text-[13px] mt-1" style={{ color: "var(--label2)" }}>
                        {s.desc}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div
            className="app-detail__card"
            style={{
              marginTop: 18,
              marginBottom: 8,
              padding: "20px 18px",
              textAlign: "center",
              background: "linear-gradient(160deg, #0f172a, #1e293b)",
              color: "#fff",
              border: "none",
            }}
          >
            <div className="text-2xl mb-2" aria-hidden>
              ⭐
            </div>
            <p className="text-[14px] leading-relaxed" style={{ opacity: 0.9 }}>
              {config.whyJoin}
            </p>
          </div>
        </div>
      </div>

      <DetailDock visible={!showForm}>
        <button
          type="button"
          onClick={handleApplyClick}
          className="detail-dock__btn detail-dock__btn--primary press"
        >
          <span>{isSignedIn ? "Өргөдөл гаргах" : "Бүртгүүлж өргөдөл гаргах"}</span>
          <ArrowRight size={18} strokeWidth={1.85} />
        </button>
      </DetailDock>

      <AnimatePresence>
        {showForm ? (
          <ApplyForm
            prog={config}
            onClose={() => setShowForm(false)}
            onSuccess={() => {
              setShowForm(false);
              setSuccess(true);
            }}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}
