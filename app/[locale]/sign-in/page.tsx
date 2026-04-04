"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ArrowRight, ChevronLeft, Fingerprint, KeyRound, Loader2, Lock, Phone } from "lucide-react";

export default function SignInPage() {
  const t = useTranslations("Auth");
  const router = useRouter();

  // Form State
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // UI State
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        phone,
        password,
      });

      if (result?.error) {
        throw new Error("Invalid phone number or password.");
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Sign in failed. Please try again.");
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
    <div className="min-h-[100dvh] w-full flex font-sans selection:bg-sky-500 selection:text-white overflow-hidden bg-[#FDFBF7]">

      {/* ─── LEFT: FORM SECTION (50%) ─── */}
      <div className="w-full lg:w-1/2 p-6 lg:p-16 flex flex-col justify-center relative z-20">

        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-50 -z-10" />

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-md mx-auto w-full"
        >
          {/* Back Nav */}
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-sky-600 uppercase tracking-[0.2em] transition-colors group"
            >
              <ChevronLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
              {t('home')}
            </Link>
          </div>

          {/* Header */}
          <div className="mb-10 relative">
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="absolute -top-10 -left-10 w-24 h-24 bg-sky-100 rounded-full blur-3xl opacity-50"
            />
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-3 tracking-tight leading-[0.95] relative z-10">
              Welcome <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-600">
                Back
              </span>
            </h1>
            <p className="text-slate-500 font-bold text-sm leading-relaxed max-w-sm relative z-10">
              Please enter your details to sign in.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* PHONE */}
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors">
                <Phone size={20} />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone Number"
                className="w-full bg-white border-2 border-slate-100 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 rounded-[1.5rem] py-4 pl-14 pr-6 text-sm font-bold text-slate-900 placeholder:text-slate-300 transition-all shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] outline-none"
                required
              />
            </div>

            {/* PASSWORD */}
            <div className="space-y-2">
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-white border-2 border-slate-100 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 rounded-[1.5rem] py-4 pl-14 pr-6 text-sm font-bold text-slate-900 placeholder:text-slate-300 transition-all shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] outline-none"
                  required
                />
              </div>
            </div>

            {/* ERROR MSG */}
            {error && (
              <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="text-red-500 text-[11px] font-black uppercase tracking-wider bg-red-50 p-4 rounded-2xl border border-red-100 text-center">
                {error}
              </motion.p>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 hover:bg-sky-600 text-white font-black text-xs uppercase tracking-[0.25em] py-5 rounded-[1.5rem] shadow-xl hover:shadow-2xl hover:shadow-sky-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3 mt-4 group"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : (
                <>Sign In <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>

          {/* Social Login Separator */}
          <div className="flex items-center gap-4 my-6">
            <div className="h-px bg-slate-200 flex-1" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">or</span>
            <div className="h-px bg-slate-200 flex-1" />
          </div>

          {/* Google Login */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-white border-2 border-slate-100 hover:border-sky-200 hover:bg-sky-50 text-slate-700 font-bold text-sm py-4 rounded-[1.5rem] shadow-sm transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign in with Google
          </button>

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Need an account?
              <Link href="/sign-up" className="text-sky-600 ml-2 hover:text-slate-900 transition-colors underline decoration-2 underline-offset-4">Sign up</Link>
            </p>
          </div>

        </motion.div>
      </div>

      {/* ─── RIGHT: VISUAL SECTION (50%) ─── */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-center bg-[#F0FDF4] border-l border-sky-50 overflow-hidden">

        {/* Animated Gradients */}
        <div className="absolute inset-0 w-full h-full">
          <motion.div
            animate={{ scale: [1, 1.1, 1], x: [0, 20, 0] }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute top-[-10%] right-[-10%] w-[700px] h-[700px] bg-sky-200 rounded-full blur-[100px] opacity-40"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], x: [0, -20, 0] }}
            transition={{ duration: 15, repeat: Infinity }}
            className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-sky-100 rounded-full blur-[100px] opacity-40"
          />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
        </div>

        {/* 3D Floating "Secure Login" Card */}
        <motion.div
          initial={{ rotateY: 90, opacity: 0 }}
          animate={{ rotateY: -5, opacity: 1 }}
          transition={{ duration: 1.2, type: "spring", bounce: 0.3 }}
          whileHover={{ rotateY: 0, scale: 1.02 }}
          className="relative z-10 w-[420px] h-[550px] bg-white/40 backdrop-blur-lg border border-white/60 rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] p-10 flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Gloss Shine */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-80 pointer-events-none" />

          {/* Rotating Elements */}
          <div className="relative w-64 h-64 mb-8">
            {/* Outer Ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border border-dashed border-sky-300"
            />

            {/* Inner Ring */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              className="absolute inset-4 rounded-full border border-dotted border-sky-400"
            />

            {/* Central Lock */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-xl shadow-sky-200/50">
                <KeyRound className="text-sky-500 text-4xl" />
              </div>
            </motion.div>
          </div>

          <div className="text-center relative z-10">
            <h3 className="text-2xl font-black text-slate-800 mb-2">Secure Access</h3>
            <div className="flex items-center justify-center gap-2 text-sky-600 bg-sky-50 px-4 py-2 rounded-full border border-sky-100 shadow-sm">
              <Lock size={24} />
              <span className="text-[10px] font-black uppercase tracking-widest">Encrypted</span>
            </div>
          </div>

          {/* Bottom Fingerprint */}
          <div className="absolute bottom-8 opacity-20 animate-pulse">
            <Fingerprint size={48} className="text-sky-700" />
          </div>

        </motion.div>

      </div>

    </div>
  );
}