"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, Phone, Lock, School, CheckSquare } from "lucide-react";

export default function CompleteProfilePage() {
  const router = useRouter();
  const { update } = useSession(); // useNextAuth update

  // Form State
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [affiliation, setAffiliation] = useState("");

  // UI State
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasPhone, setHasPhone] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  React.useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const res = await fetch("/api/user/dashboard");
        if (res.ok) {
          const data = await res.json();
          const u = data.user;
          if (u) {
            if (u.phone) { setPhone(u.phone); setHasPhone(true); }
            if (u.hasPassword) { setPassword("********"); setHasPassword(true); }
            if (u.affiliation && u.affiliation !== "None") setAffiliation(u.affiliation);
          }
        }
      } catch (e) {
      } finally {
        setInitialLoad(false);
      }
    };
    fetchProfileData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/user/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password, affiliation: affiliation || "None" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");

      // Force session update so middleware sees profileComplete=true
      await update();
      
      // Redirect to dashboard
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex font-sans selection:bg-sky-500 selection:text-white bg-[#FDFBF7]">
      {/* ─── MAIN FORM SECTION ─── */}
      <div className="w-full max-w-xl mx-auto p-6 lg:p-12 flex flex-col justify-center relative z-20">
        
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-50 -z-10" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-white/80 backdrop-blur-md p-8 md:p-12 rounded-[2rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-sky-50"
        >
          {/* Header */}
          <div className="mb-10 text-center">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight">
              Complete Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-600">
                Profile
              </span>
            </h1>
            <p className="text-slate-500 font-bold text-sm leading-relaxed max-w-sm mx-auto">
              You registered with Google. Please provide a few more details to set up your VCM account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* PHONE */}
            {!hasPhone && (
               <div className="relative group">
                 <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors">
                   <Phone size={20} />
                 </div>
                 <input
                   type="tel"
                   value={phone}
                   onChange={(e) => setPhone(e.target.value)}
                   placeholder="Phone Number (used for future Login)"
                   className="w-full bg-[#f9fafa] border-2 border-slate-100 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 rounded-[1.5rem] py-4 pl-14 pr-6 text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none transition-all"
                   required
                 />
               </div>
            )}

            {/* PASSWORD */}
            {!hasPassword && (
               <div className="relative group">
                 <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors">
                   <Lock size={20} />
                 </div>
                 <input
                   type="password"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   placeholder="Protect your account with a Password"
                   className="w-full bg-[#f9fafa] border-2 border-slate-100 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 rounded-[1.5rem] py-4 pl-14 pr-6 text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none transition-all"
                   required
                 />
               </div>
            )}

            {/* AFFILIATION */}
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors">
                <School size={20} />
              </div>
              <input
                type="text"
                value={affiliation}
                onChange={(e) => setAffiliation(e.target.value)}
                placeholder="School, University (or type 'None')"
                className="w-full bg-[#f9fafa] border-2 border-slate-100 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 rounded-[1.5rem] py-4 pl-14 pr-6 text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none transition-all"
                required
              />
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
              className="w-full bg-sky-600 hover:bg-sky-500 text-white font-black text-xs uppercase tracking-[0.25em] py-5 rounded-[1.5rem] shadow-xl shadow-sky-600/20 hover:shadow-2xl hover:shadow-sky-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3 mt-6 group"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : (
                <>Complete Profile <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
