"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  CheckCircle2,
  Loader2,
  Send,
  User,
  Mail,
  Phone,
  Calendar,
  Globe,
  MessageSquare,
} from "lucide-react";
import { Link, useRouter } from "@/navigation";
import { useTranslations } from "next-intl";

const PROGRAM_IDS = ["EDU", "AND", "VCLUB"] as const;
type ProgramId = (typeof PROGRAM_IDS)[number];

function isProgramId(v: string | null): v is ProgramId {
  return !!v && PROGRAM_IDS.includes(v as ProgramId);
}

function ProgramsApplyInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nt = useTranslations("navbar");
  const { status } = useSession();

  const initialP = searchParams.get("p");
  const [programId, setProgramId] = useState<ProgramId>(
    isProgramId(initialP) ? initialP : "EDU"
  );

  useEffect(() => {
    const p = searchParams.get("p");
    if (isProgramId(p)) setProgramId(p);
  }, [searchParams]);

  const [generals, setGenerals] = useState<{ _id: string; fullName: string; role: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    age: "",
    level: "B1",
    message: "",
    generalId: "",
  });

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/user/get-profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const user = d?.user;
        if (!user) return;
        let age = "";
        if (user.profile?.dob) {
          const b = new Date(user.profile.dob);
          const t = new Date();
          let a = t.getFullYear() - b.getFullYear();
          const m = t.getMonth() - b.getMonth();
          if (m < 0 || (m === 0 && t.getDate() < b.getDate())) a--;
          age = String(a);
        }
        setForm((prev) => ({
          ...prev,
          email: user.email || prev.email,
          firstName: user.fullName?.split(" ")[0] || prev.firstName,
          lastName: user.fullName?.split(" ").slice(1).join(" ") || prev.lastName,
          phone: user.profile?.phone || user.phone || prev.phone,
          age: age || prev.age,
        }));
      })
      .catch(() => {});

    fetch("/api/generals")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setGenerals(data);
      })
      .catch(() => {});
  }, [status]);

  const programMeta = useMemo(
    () =>
      ({
        EDU: { key: "prog_edu" as const, color: "var(--blue)", emoji: "🎓" },
        AND: { key: "prog_and" as const, color: "var(--emerald)", emoji: "🤝" },
        VCLUB: { key: "prog_vclub" as const, color: "var(--orange)", emoji: "🌍" },
      }) satisfies Record<ProgramId, { key: "prog_edu" | "prog_and" | "prog_vclub"; color: string; emoji: string }>,
    []
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!form.generalId) {
      setErr("Координатор сонгоно уу.");
      return;
    }
    if (!form.message?.trim()) {
      setErr("Урам зориг / зорилгоо бичнэ үү.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/applications/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ programId, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Илгээлт амжилтгүй");
      setDone(true);
    } catch (e: any) {
      setErr(e.message || "Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-dvh flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="ios-spinner" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.replace("/sign-in");
    return null;
  }

  const meta = programMeta[programId];

  if (done) {
    return (
      <div className="page">
        <div className="page-inner flex flex-col items-center justify-center min-h-[70dvh] text-center space-y-5 px-4">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: "var(--emerald-dim)" }}
          >
            <CheckCircle2 size={44} style={{ color: "var(--emerald)" }} />
          </motion.div>
          <h1 className="t-title2">Өргөдөл хүлээн авлаа</h1>
          <p className="t-subhead max-w-sm" style={{ color: "var(--label2)" }}>
            Таны мэдээллийг хөтөлбөрийн координатор руу илгээлээ. Удахгүй холбогдох болно.
          </p>
          <div className="flex flex-col gap-3 w-full max-w-xs pt-2">
            <Link href="/dashboard" className="btn btn-primary btn-full">
              Миний самбар
            </Link>
            <Link href="/programs" className="btn btn-secondary btn-full">
              Хөтөлбөрүүд
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-inner space-y-5 pb-28">
        <div className="pt-2 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--label3)" }}>
              VCM · Хөтөлбөр
            </p>
            <h1 className="t-large-title">Өргөдөл гаргах</h1>
            <p className="t-subhead mt-1" style={{ color: "var(--label2)" }}>
              Хөтөлбөр сонгоод мэдээллээ бөглөнө үү
            </p>
          </div>
          <Link href="/programs" className="icon-box-sm press shrink-0" style={{ background: "var(--fill2)" }}>
            <ChevronLeft size={20} style={{ color: "var(--label2)" }} />
          </Link>
        </div>

        {/* Program pills */}
        <div className="flex gap-2 flex-wrap">
          {PROGRAM_IDS.map((id) => {
            const m = programMeta[id];
            const active = programId === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setProgramId(id)}
                className="px-4 py-2.5 rounded-2xl text-[13px] font-bold press transition-all"
                style={{
                  background: active ? m.color : "var(--card)",
                  color: active ? "white" : "var(--label2)",
                  border: `0.5px solid ${active ? m.color : "var(--sep)"}`,
                  boxShadow: active ? `0 4px 14px ${m.color}44` : "none",
                }}
              >
                {m.emoji} {id}
              </button>
            );
          })}
        </div>

        <div
          className="card p-4 flex items-center gap-3"
          style={{ borderLeft: `4px solid ${meta.color}` }}
        >
          <span className="text-3xl">{meta.emoji}</span>
          <div>
            <p className="t-caption2 uppercase tracking-widest" style={{ color: "var(--label3)" }}>
              Сонгогдсон хөтөлбөр
            </p>
            <p className="t-headline">{nt(meta.key)}</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="input-group">
            <div className="input-row">
              <User size={17} style={{ color: "var(--label3)", flexShrink: 0 }} />
              <input
                required
                placeholder="Нэр"
                value={form.firstName}
                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
              />
            </div>
            <div className="input-row">
              <User size={17} style={{ color: "var(--label3)", flexShrink: 0 }} />
              <input
                required
                placeholder="Овог"
                value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
              />
            </div>
            <div className="input-row">
              <Mail size={17} style={{ color: "var(--label3)", flexShrink: 0 }} />
              <input
                type="email"
                required
                placeholder="Имэйл"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="input-row">
              <Phone size={17} style={{ color: "var(--label3)", flexShrink: 0 }} />
              <input
                required
                placeholder="Утас"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div className="input-row">
              <Calendar size={17} style={{ color: "var(--label3)", flexShrink: 0 }} />
              <input
                required
                type="number"
                min={14}
                max={99}
                placeholder="Нас"
                value={form.age}
                onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
              />
            </div>
            <div className="input-row">
              <Globe size={17} style={{ color: "var(--label3)", flexShrink: 0 }} />
              <select
                required
                value={form.level}
                onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}
                className="flex-1 bg-transparent outline-none t-body"
                style={{ color: "var(--label)" }}
              >
                <option value="A1">Англи A1</option>
                <option value="A2">Англи A2</option>
                <option value="B1">Англи B1</option>
                <option value="B2">Англи B2</option>
                <option value="C1">Англи C1</option>
              </select>
            </div>
          </div>

          <div>
            <p className="sec-label mb-2">Хөтөлбөрийн координатор</p>
            <div className="card p-0 overflow-hidden">
              <select
                required
                value={form.generalId}
                onChange={(e) => setForm((f) => ({ ...f, generalId: e.target.value }))}
                className="w-full px-4 py-3.5 bg-transparent outline-none t-body"
                style={{ color: "var(--label)", border: "none" }}
              >
                <option value="">Сонгох...</option>
                {generals.map((g) => (
                  <option key={g._id} value={g._id}>
                    {g.fullName} ({g.role.replace("general_", "").toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
            {generals.length === 0 && (
              <p className="t-caption mt-2" style={{ color: "var(--orange)" }}>
                Координаторын жагсаалт хоосон байна. Админтай холбогдоно уу.
              </p>
            )}
          </div>

          <div>
            <p className="sec-label mb-2">Урам зориг / зорилго</p>
            <div className="card p-4">
              <div className="flex gap-2 mb-2">
                <MessageSquare size={17} style={{ color: "var(--label3)", flexShrink: 0 }} />
              </div>
              <textarea
                required
                rows={5}
                className="w-full bg-transparent outline-none t-body resize-none"
                style={{ color: "var(--label)" }}
                placeholder="Яагаад энэ хөтөлбөрт нэгдэхийг хүсэж байна вэ? Туршлага, хүлээлтээ бичнэ үү."
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              />
            </div>
          </div>

          <AnimatePresence>
            {err && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="t-footnote text-center py-3 px-4 rounded-xl"
                style={{ background: "var(--red-dim)", color: "var(--red)" }}
              >
                {err}
              </motion.p>
            )}
          </AnimatePresence>

          <button type="submit" disabled={loading || generals.length === 0} className="btn btn-primary btn-full">
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <Send size={18} /> Өргөдөл илгээх
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ProgramsApplyClient() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh flex items-center justify-center" style={{ background: "var(--bg)" }}>
          <div className="ios-spinner" />
        </div>
      }
    >
      <ProgramsApplyInner />
    </Suspense>
  );
}
