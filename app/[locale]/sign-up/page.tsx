"use client";

import React, { useState } from "react";
import { Link, useRouter } from "@/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import AuthScreen, { AuthError } from "@/app/components/auth/AuthScreen";
import FloatingField from "@/app/components/auth/FloatingField";
import { hapticNotification, hapticImpact } from "@/lib/haptics";
import { ImpactStyle, NotificationType } from "@capacitor/haptics";
import { springNative } from "@/lib/motion";

const INTERESTS = [
  "Боловсрол",
  "Байгаль",
  "Эрүүл мэнд",
  "Залуучууд",
  "Соёл",
  "Технологи",
  "Спорт",
  "Нийгэм",
] as const;

function validatePassword(pw: string): string | null {
  if (pw.length < 8) return "Нууц үг 8-аас дээш тэмдэгт байх ёстой.";
  const hasLower = /[a-z]/.test(pw);
  const hasUpper = /[A-Z]/.test(pw);
  const hasNumber = /\d/.test(pw);
  const score = [hasLower, hasUpper, hasNumber].filter(Boolean).length;
  if (score < 2) {
    return "Нууц үг том үсэг, жижиг үсэг, тоо гэсэн 2-оос доошгүй ангиллыг агуулсан байх ёстой.";
  }
  return null;
}

export default function SignUpPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  const toggleInterest = (label: string) => {
    void hapticImpact(ImpactStyle.Light);
    setInterests((prev) =>
      prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]
    );
  };

  const goNext = () => {
    setError("");
    setFieldErrors({});
    if (step === 0) {
      const fe: Record<string, string> = {};
      if (!fullName.trim()) fe.fullName = "Нэрээ оруулна уу.";
      if (!phone.trim()) fe.phone = "Утасны дугаар оруулна уу.";
      if (!email.trim()) fe.email = "Имэйл оруулна уу.";
      else if (!email.includes("@")) fe.email = "Зөв имэйл оруулна уу.";
      if (Object.keys(fe).length) {
        setFieldErrors(fe);
        return;
      }
    }
    if (step === 1) {
      const pwError = validatePassword(password);
      if (pwError) {
        setFieldErrors({ password: pwError });
        return;
      }
      if (password !== confirmPassword) {
        setFieldErrors({ confirmPassword: "Нууц үг таарахгүй байна." });
        return;
      }
    }
    void hapticImpact(ImpactStyle.Light);
    setStep((s) => Math.min(2, s + 1));
  };

  const handleSubmit = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const trimmedEmail = email.trim().toLowerCase();
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: trimmedEmail,
          phone: phone.trim(),
          password,
          interests,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg =
          data.error === "An account with this email already exists"
            ? "Энэ имэйл хаягтай бүртгэл байна."
            : data.error || "Бүртгэл амжилтгүй болсон.";
        throw new Error(msg);
      }

      try {
        localStorage.setItem("vcm-interests", JSON.stringify(interests));
      } catch {
        /* noop */
      }

      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });
      if (signInError) {
        void hapticNotification(NotificationType.Success);
        setSuccess(true);
        setTimeout(() => router.push("/sign-in"), 1800);
        return;
      }

      void hapticNotification(NotificationType.Success);
      await fetch("/api/auth/session", { method: "POST" });
      router.push("/profile");
      router.refresh();
    } catch (err: unknown) {
      void hapticNotification(NotificationType.Error);
      setError(err instanceof Error ? err.message : "Бүртгэл амжилтгүй.");
    } finally {
      setBusy(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-dvh flex items-center justify-center px-6" style={{ background: "#fff" }}>
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-sm w-full"
        >
          <div
            className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4"
            style={{ background: "var(--emerald-dim)" }}
          >
            <CheckCircle2 size={40} style={{ color: "var(--emerald)" }} />
          </div>
          <h2 className="text-[22px] font-bold" style={{ color: "var(--label)" }}>
            Бүртгэл амжилттай!
          </h2>
          <p className="text-[15px] mt-2" style={{ color: "var(--label2)" }}>
            Нэвтрэх хуудас руу шилжиж байна...
          </p>
        </motion.div>
      </div>
    );
  }

  const stickyLabel = step < 2 ? "Үргэлжлүүлэх" : "Бүртгүүлэх";

  return (
    <AuthScreen
      title="Тавтай морил"
      subtitle="Шинэ бүртгэл үүсгэх"
      footer={
        <p className="text-[14px]" style={{ color: "var(--label2)" }}>
          Аль хэдийн бүртгэлтэй юу?{" "}
          <Link href="/sign-in" className="font-bold press" style={{ color: "var(--blue)" }}>
            Нэвтрэх
          </Link>
        </p>
      }
      stickyAction={
        <button
          type="button"
          disabled={busy}
          className="btn btn-primary btn-full"
          onClick={() => (step < 2 ? goNext() : void handleSubmit())}
        >
          {busy ? (
            <span className="ios-spinner" style={{ width: 22, height: 22, borderWidth: 2 }} />
          ) : (
            stickyLabel
          )}
        </button>
      }
    >
      <div className="auth-progress" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span key={i} className={`auth-progress__seg ${i <= step ? "on" : ""}`} />
        ))}
      </div>
      <p className="auth-step-label">Алхам {step + 1} / 3</p>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -28 }}
          transition={springNative}
          className="space-y-3"
        >
          {step === 0 && (
            <>
              <FloatingField
                label="Бүтэн нэр"
                value={fullName}
                onChange={setFullName}
                autoComplete="name"
                disabled={busy}
                error={fieldErrors.fullName}
              />
              <FloatingField
                label="Утас"
                value={phone}
                onChange={setPhone}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                disabled={busy}
                error={fieldErrors.phone}
              />
              <FloatingField
                label="Имэйл"
                value={email}
                onChange={setEmail}
                type="email"
                inputMode="email"
                autoComplete="email"
                disabled={busy}
                error={fieldErrors.email}
              />
            </>
          )}
          {step === 1 && (
            <>
              <FloatingField
                label="Нууц үг"
                value={password}
                onChange={setPassword}
                autoComplete="new-password"
                disabled={busy}
                passwordToggle
                error={fieldErrors.password}
              />
              <FloatingField
                label="Нууц үг давтах"
                value={confirmPassword}
                onChange={setConfirmPassword}
                autoComplete="new-password"
                disabled={busy}
                passwordToggle
                error={fieldErrors.confirmPassword}
              />
              <p className="text-[12px]" style={{ color: "var(--label3)" }}>
                8+ тэмдэгт, том/жижиг үсэг, тоо агуулсан байх.
              </p>
            </>
          )}
          {step === 2 && (
            <>
              <p className="ios-subhead mb-1">Сонирхлоо сонгоно уу</p>
              <div className="auth-chips">
                {INTERESTS.map((label) => {
                  const on = interests.includes(label);
                  return (
                    <button
                      key={label}
                      type="button"
                      className={`auth-chip press ${on ? "on" : ""}`}
                      onClick={() => toggleInterest(label)}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {step > 0 && (
        <button
          type="button"
          className="auth-back-step press mt-4"
          onClick={() => {
            setError("");
            setStep((s) => s - 1);
          }}
        >
          Өмнөх
        </button>
      )}

      <AuthError message={error} />
    </AuthScreen>
  );
}
