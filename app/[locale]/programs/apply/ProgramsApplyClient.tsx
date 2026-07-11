"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "@/lib/hooks/useSession";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  CheckCircle2,
  Loader2,
  Send,
  User,
  Mail,
  Phone,
} from "lucide-react";
import { Link, useRouter } from "@/navigation";
import type { ProgramQuestion } from "@/lib/programQuestions";
import { sortQuestions } from "@/lib/programQuestions";

type Program = {
  _id: string;
  code: string;
  slug: string;
  emoji: string;
  color?: string;
  name?: { mn?: string; en?: string };
  applicationQuestions?: ProgramQuestion[];
};

function QuestionField({
  question,
  value,
  onChange,
}: {
  question: ProgramQuestion;
  value: string;
  onChange: (v: string) => void;
}) {
  const placeholder = question.placeholder?.mn || question.label.mn;

  if (question.type === "textarea") {
    return (
      <textarea
        required={question.required}
        rows={4}
        className="w-full bg-transparent outline-none t-body resize-none"
        style={{ color: "var(--label)" }}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  if (question.type === "select") {
    return (
      <select
        required={question.required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent outline-none t-body"
        style={{ color: "var(--label)" }}
      >
        <option value="">Сонгох...</option>
        {(question.options || []).map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      required={question.required}
      type={question.type === "number" ? "number" : question.type === "email" ? "email" : question.type === "phone" ? "tel" : "text"}
      className="flex-1 bg-transparent outline-none t-body"
      style={{ color: "var(--label)" }}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function ProgramsApplyInner({ initialPrograms }: { initialPrograms?: Program[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();

  const [programs, setPrograms] = useState<Program[]>(initialPrograms ?? []);
  const [programId, setProgramId] = useState("");
  const [generals, setGenerals] = useState<{ _id: string; fullName: string; role: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPrograms, setLoadingPrograms] = useState(!initialPrograms?.length);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    generalId: "",
  });
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!initialPrograms?.length) return;
    const p = searchParams.get("p") || searchParams.get("program");
    const match = initialPrograms.find(
      (d) => d.code === p?.toUpperCase() || d.slug === p?.toLowerCase()
    );
    setProgramId(match?.code || initialPrograms[0].code);
  }, [initialPrograms, searchParams]);

  useEffect(() => {
    if (initialPrograms?.length) return;
    fetch("/api/programs")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (!Array.isArray(data) || !data.length) return;
        setPrograms(data);
        const p = searchParams.get("p") || searchParams.get("program");
        const match = data.find(
          (d: Program) => d.code === p?.toUpperCase() || d.slug === p?.toLowerCase()
        );
        setProgramId(match?.code || data[0].code);
      })
      .finally(() => setLoadingPrograms(false));
  }, [searchParams, initialPrograms]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/user/get-profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const user = d?.user;
        if (!user) return;
        setForm((prev) => ({
          ...prev,
          email: user.email || prev.email,
          firstName: user.fullName?.split(" ")[0] || prev.firstName,
          lastName: user.fullName?.split(" ").slice(1).join(" ") || prev.lastName,
          phone: user.profile?.phone || user.phone || prev.phone,
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

  const selectedProgram = useMemo(
    () => programs.find((p) => p.code === programId),
    [programs, programId]
  );

  const questions = useMemo(
    () => sortQuestions(selectedProgram?.applicationQuestions || []),
    [selectedProgram]
  );

  useEffect(() => {
    if (!selectedProgram) return;
    const initial: Record<string, string> = {};
    for (const q of sortQuestions(selectedProgram.applicationQuestions || [])) {
      initial[q.id] = "";
    }
    setAnswers(initial);
  }, [selectedProgram?.code]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!form.generalId) {
      setErr("Координатор сонгоно уу.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        programId,
        ...form,
        answers: questions.map((q) => ({
          questionId: q.id,
          label: q.label.mn,
          value: answers[q.id] || "",
        })),
      };

      const res = await fetch("/api/applications/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Илгээлт амжилтгүй");
      setDone(true);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loadingPrograms) {
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

  if (!programs.length) {
    return (
      <div className="page">
        <div className="page-inner text-center py-20">
          <p className="t-subhead" style={{ color: "var(--label2)" }}>Идэвхтэй хөтөлбөр байхгүй байна.</p>
          <Link href="/programs" className="btn btn-primary mt-4 inline-flex">Буцах</Link>
        </div>
      </div>
    );
  }

  const accent = selectedProgram?.color || "var(--blue)";

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
          <h1 className="t-title2">Хүсэлт хүлээн авлаа</h1>
          <p className="t-subhead max-w-sm" style={{ color: "var(--label2)" }}>
            Таны {selectedProgram?.name?.mn || programId} хөтөлбөрийн бүртгэлийн хүсэлт илгээгдлээ.
          </p>
          <div className="flex flex-col gap-3 w-full max-w-xs pt-2">
            <Link href="/profile" className="btn btn-primary btn-full">
              Миний профайл
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
            <h1 className="t-large-title">Бүртгэлийн хүсэлт</h1>
            <p className="t-subhead mt-1" style={{ color: "var(--label2)" }}>
              Хөтөлбөр сонгоод асуултуудад хариулна уу
            </p>
          </div>
          <Link href="/programs" className="icon-box-sm press shrink-0" style={{ background: "var(--fill2)" }}>
            <ChevronLeft size={20} style={{ color: "var(--label2)" }} />
          </Link>
        </div>

        <div className="flex gap-2 flex-wrap">
          {programs.map((p) => {
            const active = programId === p.code;
            return (
              <button
                key={p.code}
                type="button"
                onClick={() => setProgramId(p.code)}
                className="px-4 py-2.5 rounded-2xl text-[13px] font-bold press transition-all"
                style={{
                  background: active ? (p.color || "var(--blue)") : "var(--card)",
                  color: active ? "white" : "var(--label2)",
                  border: `0.5px solid ${active ? (p.color || "var(--blue)") : "var(--sep)"}`,
                }}
              >
                {p.emoji} {p.name?.mn || p.code}
              </button>
            );
          })}
        </div>

        <div className="liquid-card p-4 flex items-center gap-3" style={{ borderLeft: `4px solid ${accent}` }}>
          <span className="text-3xl">{selectedProgram?.emoji}</span>
          <div>
            <p className="t-caption2 uppercase tracking-widest" style={{ color: "var(--label3)" }}>
              Сонгогдсон хөтөлбөр
            </p>
            <p className="t-headline">{selectedProgram?.name?.mn || programId}</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <p className="sec-label mb-2">Үндсэн мэдээлэл</p>
            <div className="input-group">
              <div className="input-row">
                <User size={17} style={{ color: "var(--label3)", flexShrink: 0 }} />
                <input required placeholder="Нэр" value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} />
              </div>
              <div className="input-row">
                <User size={17} style={{ color: "var(--label3)", flexShrink: 0 }} />
                <input required placeholder="Овог" value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} />
              </div>
              <div className="input-row">
                <Mail size={17} style={{ color: "var(--label3)", flexShrink: 0 }} />
                <input type="email" required placeholder="Gmail" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="input-row">
                <Phone size={17} style={{ color: "var(--label3)", flexShrink: 0 }} />
                <input required placeholder="Утас" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
              </div>
            </div>
          </div>

          {questions.length > 0 && (
            <div>
              <p className="sec-label mb-2">Хөтөлбөрийн асуултууд</p>
              <div className="space-y-3">
                {questions.map((q) => (
                  <div key={q.id} className="liquid-card p-4">
                    <p className="text-[13px] font-semibold mb-2" style={{ color: "var(--label)" }}>
                      {q.label.mn}
                      {q.required && <span style={{ color: "var(--red)" }}> *</span>}
                    </p>
                    <QuestionField
                      question={q}
                      value={answers[q.id] || ""}
                      onChange={(v) => setAnswers((prev) => ({ ...prev, [q.id]: v }))}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

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
            {loading ? <Loader2 className="animate-spin" size={20} /> : <><Send size={18} /> Хүсэлт илгээх</>}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ProgramsApplyClient({ initialPrograms }: { initialPrograms?: Program[] }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh flex items-center justify-center" style={{ background: "var(--bg)" }}>
          <div className="ios-spinner" />
        </div>
      }
    >
      <ProgramsApplyInner initialPrograms={initialPrograms} />
    </Suspense>
  );
}
