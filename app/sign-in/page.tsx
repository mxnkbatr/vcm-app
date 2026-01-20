"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { 
  ChevronLeft, 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2, 
  ShieldCheck, 
  KeyRound,
  Fingerprint
} from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const { isLoaded, signIn, setActive } = useSignIn();
  
  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // UI State
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || isLoading) return;
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      } else {
        setError("Login verification required.");
      }
    } catch (err: any) {
      if (err.errors?.[0]?.code === "form_password_incorrect") {
        setError("Incorrect password.");
      } else if (err.errors?.[0]?.code === "form_identifier_not_found") {
        setError("Account not found.");
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex font-sans selection:bg-red-500 selection:text-white overflow-hidden bg-[#FDFBF7]">
      
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
              className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-red-600 uppercase tracking-[0.2em] transition-colors group"
            >
              <ChevronLeft size={12} className="group-hover:-translate-x-1 transition-transform" /> 
              Нүүр хуудас
            </Link>
          </div>

          {/* Header */}
          <div className="mb-10 relative">
            <motion.div 
              initial={{ scale: 0 }} animate={{ scale: 1 }} 
              className="absolute -top-10 -left-10 w-24 h-24 bg-emerald-100 rounded-full blur-3xl opacity-50" 
            />
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-3 tracking-tight leading-[0.95] relative z-10">
              Welcome <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">
                Back.
              </span>
            </h1>
            <p className="text-slate-500 font-bold text-sm leading-relaxed max-w-sm relative z-10">
              Хувийн мэдээлэл болон хөтөлбөрийн явцаа шалгахын тулд нэвтэрнэ үү.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* EMAIL */}
            <div className="relative group">
               <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                  <Mail size={20} />
               </div>
               <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="И-мэйл хаяг"
                  className="w-full bg-white border-2 border-slate-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-[1.5rem] py-5 pl-14 pr-6 text-sm font-bold text-slate-900 placeholder:text-slate-300 transition-all shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] outline-none"
                  required
               />
            </div>

            {/* PASSWORD */}
            <div className="space-y-2">
               <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                     <Lock size={20} />
                  </div>
                  <input 
                     type="password" 
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     placeholder="Нууц үг"
                     className="w-full bg-white border-2 border-slate-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-[1.5rem] py-5 pl-14 pr-6 text-sm font-bold text-slate-900 placeholder:text-slate-300 transition-all shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] outline-none"
                     required
                  />
               </div>
               <div className="text-right pr-2">
                  <Link href="#" className="text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-emerald-600 transition-colors">
                     Нууц үгээ мартсан?
                  </Link>
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
              className="w-full bg-slate-900 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-[0.25em] py-6 rounded-[1.5rem] shadow-xl hover:shadow-2xl hover:shadow-emerald-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3 mt-6 group"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : (
                 <>Нэвтрэх <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>

            {/* Clerk CAPTCHA Placeholder */}
            <div id="clerk-captcha" />

          </form>

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Шинэ гишүүн үү? 
                <Link href="/sign-up" className="text-emerald-600 ml-2 hover:text-slate-900 transition-colors underline decoration-2 underline-offset-4">Бүртгүүлэх</Link>
             </p>
          </div>

        </motion.div>
      </div>

      {/* ─── RIGHT: VISUAL SECTION (50%) ─── */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-center bg-[#F0FDF4] border-l border-emerald-50 overflow-hidden">
         
         {/* Animated Gradients */}
         <div className="absolute inset-0 w-full h-full">
            <motion.div 
               animate={{ scale: [1, 1.1, 1], x: [0, 20, 0] }}
               transition={{ duration: 10, repeat: Infinity }}
               className="absolute top-[-10%] right-[-10%] w-[700px] h-[700px] bg-emerald-200 rounded-full blur-[150px] opacity-40" 
            />
            <motion.div 
               animate={{ scale: [1, 1.2, 1], x: [0, -20, 0] }}
               transition={{ duration: 15, repeat: Infinity }}
               className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-teal-200 rounded-full blur-[150px] opacity-40" 
            />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
         </div>

         {/* 3D Floating "Secure Login" Card */}
         <motion.div 
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: -5, opacity: 1 }}
            transition={{ duration: 1.2, type: "spring", bounce: 0.3 }}
            whileHover={{ rotateY: 0, scale: 1.02 }}
            className="relative z-10 w-[420px] h-[550px] bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] p-10 flex flex-col items-center justify-center overflow-hidden"
         >
            {/* Gloss Shine */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-80 pointer-events-none" />

            {/* Rotating Elements */}
            <div className="relative w-64 h-64 mb-8">
                {/* Outer Ring */}
                <motion.div 
                   animate={{ rotate: 360 }}
                   transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                   className="absolute inset-0 rounded-full border border-dashed border-emerald-300"
                />
                
                {/* Inner Ring */}
                <motion.div 
                   animate={{ rotate: -360 }}
                   transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                   className="absolute inset-4 rounded-full border border-dotted border-emerald-400"
                />

                {/* Central Lock */}
                <motion.div 
                   animate={{ y: [0, -10, 0] }}
                   transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                   className="absolute inset-0 flex items-center justify-center"
                >
                   <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-xl shadow-emerald-200/50">
                      <KeyRound className="text-emerald-500 text-4xl" />
                   </div>
                </motion.div>
            </div>

            <div className="text-center relative z-10">
               <h3 className="text-2xl font-black text-slate-800 mb-2">Secure Access</h3>
               <div className="flex items-center justify-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 shadow-sm">
                  <ShieldCheck size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Encrypted</span>
               </div>
            </div>

            {/* Bottom Fingerprint */}
            <div className="absolute bottom-8 opacity-20 animate-pulse">
                <Fingerprint size={48} className="text-emerald-700" />
            </div>

         </motion.div>

      </div>

    </div>
  );
}