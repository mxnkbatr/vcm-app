"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import {
  ChevronLeft,
  User,
  Phone,
  Lock,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import BeforeLoginNews from "../../components/BeforeLoginNews";

export default function SignUpPage() {
  const t = useTranslations("Auth");
  const router = useRouter();

  // --- FORM STATE ---
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // --- UI STATE ---
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // --- HANDLERS ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setError("");

    try {
      // 1. Create account
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, phone, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // 2. Log in automatically
      const signInRes = await signIn("credentials", {
        redirect: false,
        phone,
        password,
      });

      if (signInRes?.error) {
        throw new Error("Account created, but couldn't log in automatically. Please sign in.");
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (err) {
      setError("Google sign-in failed.");
      setIsLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-inner space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Back Nav */}
          <div className="mb-6">
            <Link
              href="/register"
              className="inline-flex items-center gap-1 t-caption font-semibold press"
              style={{ color: 'var(--blue)' }}
            >
              <ChevronLeft size={14} />
              Буцах
            </Link>
          </div>

          {/* Header */}
          <div className="pt-2 mb-8">
            <h1 className="t-large-title">
              VCM-д <span style={{ color: 'var(--blue)' }}>нэгдэх</span>
            </h1>
            <p className="t-subhead mt-2" style={{ color: 'var(--label2)' }}>
              Шинэ бүртгэл үүсгэж аялалаа эхлүүлээрэй.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="input-group">
              {/* FULL NAME */}
              <div className="input-row">
                <User size={18} style={{ color: 'var(--label3)', flexShrink: 0 }} />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Овог нэр"
                  required
                />
              </div>

              {/* PHONE */}
              <div className="input-row">
                <Phone size={18} style={{ color: 'var(--label3)', flexShrink: 0 }} />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Утасны дугаар"
                  required
                />
              </div>

              {/* PASSWORD */}
              <div className="input-row">
                <Lock size={18} style={{ color: 'var(--label3)', flexShrink: 0 }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Нууц үг (дор хаяж 6 тэмдэгт)"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* ERROR MSG */}
            {error && (
              <p className="t-footnote text-center py-3 px-4 rounded-xl" 
                style={{ background: '#FFE8E8', color: 'var(--red)' }}>
                {error}
              </p>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary btn-full"
            >
              {isLoading ? <span className="ios-spinner" style={{ width: 22, height: 22, borderWidth: 2 }} /> : "Бүртгүүлэх"}
            </button>
          </form>

          {/* Google Login */}
          <div className="mt-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="btn btn-ghost btn-full"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google-ээр бүртгүүлэх
            </button>
          </div>

          {/* Login Link */}
          <div className="mt-8 text-center">
            <p className="t-footnote">
              Аль хэдийн бүртгэлтэй юу?
              <Link href="/sign-in" className="ml-2 press" style={{ color: 'var(--blue)', fontWeight: 600 }}>Нэвтрэх</Link>
            </p>
          </div>

        </motion.div>
      </div>
    </div>
  );
}