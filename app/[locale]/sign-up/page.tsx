"use client";

import React, { useState } from "react";
import { Link, useRouter } from "@/navigation";
import { motion } from "framer-motion";
import { Phone, Lock, Eye, EyeOff, User, ChevronLeft, CheckCircle2 } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setErr("");

    if (!phone.trim()) { setErr("Утасны дугаар оруулна уу."); return; }
    if (!pw) { setErr("Нууц үг оруулна уу."); return; }
    if (pw !== pw2) { setErr("Нууц үг таарахгүй байна."); return; }
    if (pw.length < 8) { setErr("Нууц үг 8-аас дээш тэмдэгт байх ёстой."); return; }
    const hasLower = /[a-z]/.test(pw);
    const hasUpper = /[A-Z]/.test(pw);
    const hasNumber = /\d/.test(pw);
    const score = [hasLower, hasUpper, hasNumber].filter(Boolean).length;
    if (score < 2) { setErr("Нууц үг том үсэг, жижиг үсэг, тоо гэсэн 2-оос доошгүй ангиллыг агуулсан байх ёстой."); return; }

    setBusy(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: fullName.trim() || "Гишүүн", phone: phone.trim(), password: pw }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Бүртгэл амжилтгүй болсон.");
      setSuccess(true);
      setTimeout(() => router.push("/sign-in"), 1800);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6" style={{ background: "var(--bg)" }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-4"
        >
          <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center" style={{ background: "var(--emerald-dim)" }}>
            <CheckCircle2 size={40} style={{ color: "var(--emerald)" }} />
          </div>
          <h2 className="t-title2">Бүртгэл амжилттай!</h2>
          <p className="t-footnote" style={{ color: "var(--label2)" }}>Нэвтрэх хуудас руу шилжиж байна...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{ background: "var(--bg)", paddingTop: "env(safe-area-inset-top, 44px)" }}
    >
      <div className="relative z-[120] max-w-sm mx-auto w-full px-6 flex flex-col justify-center min-h-dvh py-12 pb-32">

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-4 shadow-xl"
            style={{ background: "var(--blue)" }}
          >
            <span className="text-4xl">🌍</span>
          </div>
          <h1 className="t-title2">Бүртгэл үүсгэх</h1>
          <p className="t-footnote mt-1" style={{ color: "var(--label2)" }}>
            Volunteer Center Mongolia-д нэгдэнэ үү
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="input-group">
            {/* Full Name */}
            <div className="input-row">
              <User size={18} style={{ color: "var(--label3)", flexShrink: 0 }} />
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Нэр (заавал биш)"
                autoComplete="name"
              />
            </div>

            {/* Phone */}
            <div className="input-row">
              <Phone size={18} style={{ color: "var(--label3)", flexShrink: 0 }} />
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Утасны дугаар"
                autoComplete="tel"
                required
              />
            </div>

            {/* Password */}
            <div className="input-row">
              <Lock size={18} style={{ color: "var(--label3)", flexShrink: 0 }} />
              <input
                type={show ? "text" : "password"}
                value={pw}
                onChange={e => setPw(e.target.value)}
                placeholder="Нууц үг (8+ тэмдэгт)"
                autoComplete="new-password"
                required
              />
              <button type="button" onClick={() => setShow(!show)} className="press flex-shrink-0">
                {show
                  ? <EyeOff size={18} style={{ color: "var(--label3)" }} />
                  : <Eye size={18} style={{ color: "var(--label3)" }} />
                }
              </button>
            </div>

            {/* Confirm Password */}
            <div className="input-row">
              <Lock size={18} style={{ color: "var(--label3)", flexShrink: 0 }} />
              <input
                type={show ? "text" : "password"}
                value={pw2}
                onChange={e => setPw2(e.target.value)}
                placeholder="Нууц үг давтах"
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          {/* Password hint */}
          <p className="t-caption2" style={{ color: "var(--label3)" }}>
            Нууц үг: 8+ тэмдэгт, том болон жижиг үсэг, тоо агуулсан байх.
          </p>

          {err && (
            <p
              className="t-footnote text-center py-3 px-4 rounded-xl"
              style={{ background: "#FFE8E8", color: "var(--red)" }}
            >
              {err}
            </p>
          )}

          <button type="submit" disabled={busy} className="btn btn-primary btn-full mt-2">
            {busy
              ? <span className="ios-spinner" style={{ width: 22, height: 22, borderWidth: 2 }} />
              : "Бүртгүүлэх"
            }
          </button>
        </motion.form>

        <p className="t-footnote text-center mt-6">
          Аль хэдийн гишүүн үү?{" "}
          <Link href="/sign-in" className="press font-semibold" style={{ color: "var(--blue)" }}>
            Нэвтрэх
          </Link>
        </p>

        <div className="mt-4 text-center">
          <Link href="/" className="inline-flex items-center gap-1 t-caption press" style={{ color: "var(--label3)" }}>
            <ChevronLeft size={14} /> Нүүр хуудас руу буцах
          </Link>
        </div>

      </div>
    </div>
  );
}
