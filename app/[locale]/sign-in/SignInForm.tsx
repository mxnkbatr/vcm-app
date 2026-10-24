"use client";

import React, { useState } from "react";
import { Link, useRouter } from "@/navigation";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AuthScreen, { AuthError } from "@/app/components/auth/AuthScreen";
import FloatingField from "@/app/components/auth/FloatingField";
import IOSSheet from "@/app/components/ui/IOSSheet";
import { hapticNotification } from "@/lib/haptics";
import { NotificationType } from "@capacitor/haptics";

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");
  const [forgotBusy, setForgotBusy] = useState(false);

  const finishLogin = async () => {
    await fetch("/api/auth/session", { method: "POST" });

    let sessionOk = false;
    for (let attempt = 0; attempt < 2; attempt++) {
      if (attempt > 0) await new Promise((r) => setTimeout(r, 600));
      const res = await fetch("/api/auth/session", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          sessionOk = true;
          break;
        }
      }
    }

    if (!sessionOk) {
      throw new Error("Нэвтрэхэд алдаа гарлаа. Дахин оролдоно уу.");
    }

    router.push(callbackUrl.startsWith("/") ? callbackUrl : "/");
    router.refresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError("Имэйл хаягаа оруулна уу.");
      return;
    }
    if (!password) {
      setError("Нууц үгээ оруулна уу.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });
      if (signInError) {
        throw new Error("Имэйл эсвэл нууц үг буруу байна.");
      }
      void hapticNotification(NotificationType.Success);
      await finishLogin();
    } catch (err: unknown) {
      void hapticNotification(NotificationType.Error);
      setError(err instanceof Error ? err.message : "Нэвтрэхэд алдаа гарлаа.");
    } finally {
      setBusy(false);
    }
  };

  const sendReset = async () => {
    const trimmed = forgotEmail.trim().toLowerCase() || email.trim().toLowerCase();
    if (!trimmed) {
      setForgotMsg("Имэйл хаягаа оруулна уу.");
      return;
    }
    setForgotBusy(true);
    setForgotMsg("");
    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmed, {
        redirectTo: typeof window !== "undefined" ? `${window.location.origin}/sign-in` : undefined,
      });
      if (resetError) throw new Error(resetError.message);
      void hapticNotification(NotificationType.Success);
      setForgotMsg("Имэйл илгээлээ. Холбоосыг шалгана уу.");
    } catch (err: unknown) {
      void hapticNotification(NotificationType.Error);
      setForgotMsg(err instanceof Error ? err.message : "Алдаа гарлаа.");
    } finally {
      setForgotBusy(false);
    }
  };

  return (
    <>
      <AuthScreen
        title="Тавтай морил"
        subtitle="Имэйл болон нууц үгээрээ нэвтэрнэ үү"
        footer={
          <p className="text-[14px]" style={{ color: "var(--label2)" }}>
            Бүртгэлгүй юу?{" "}
            <Link href="/sign-up" className="font-bold press" style={{ color: "var(--blue)" }}>
              Бүртгүүлэх
            </Link>
          </p>
        }
        stickyAction={
          <button type="submit" form="sign-in-form" disabled={busy} className="btn btn-primary btn-full">
            {busy ? (
              <span className="ios-spinner" style={{ width: 22, height: 22, borderWidth: 2 }} />
            ) : (
              "Нэвтрэх"
            )}
          </button>
        }
      >
        <form id="sign-in-form" onSubmit={handleSubmit} className="space-y-3">
          <FloatingField
            label="Имэйл"
            value={email}
            onChange={setEmail}
            type="email"
            inputMode="email"
            autoComplete="email"
            disabled={busy}
          />
          <FloatingField
            label="Нууц үг"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            disabled={busy}
            passwordToggle
          />

          <button
            type="button"
            className="auth-forgot press"
            onClick={() => {
              setForgotEmail(email);
              setForgotMsg("");
              setForgotOpen(true);
            }}
          >
            Нууц үг мартсан?
          </button>

          <AuthError message={error} />
        </form>
      </AuthScreen>

      <IOSSheet open={forgotOpen} title="Нууц үг сэргээх" onClose={() => setForgotOpen(false)} detent="half">
        <div className="space-y-3 pt-2">
          <p className="ios-subhead">Имэйл хаяг руу сэргээх холбоос илгээнэ.</p>
          <FloatingField
            label="Имэйл"
            value={forgotEmail}
            onChange={setForgotEmail}
            type="email"
            inputMode="email"
            autoComplete="email"
            disabled={forgotBusy}
          />
          {forgotMsg ? (
            <p
              className="text-[13px] font-medium"
              style={{ color: forgotMsg.includes("илгээлээ") ? "var(--emerald)" : "var(--red)" }}
            >
              {forgotMsg}
            </p>
          ) : null}
          <button
            type="button"
            className="btn btn-primary btn-full"
            disabled={forgotBusy}
            onClick={() => void sendReset()}
          >
            {forgotBusy ? (
              <span className="ios-spinner" style={{ width: 22, height: 22, borderWidth: 2 }} />
            ) : (
              "Илгээх"
            )}
          </button>
        </div>
      </IOSSheet>
    </>
  );
}
