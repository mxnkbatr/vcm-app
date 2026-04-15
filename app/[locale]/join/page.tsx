"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
   UserPlus,
   LogIn,
   ArrowRight,
   CheckCircle2,
   Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";

export default function JoinPage() {
   const t = useTranslations("Auth");
   const locale = useLocale();
   const { theme } = useTheme();
   const router = useRouter();

   const [selected, setSelected] = useState<'signup' | 'signin'>('signup');
   const [mounted, setMounted] = useState(false);

   useEffect(() => setMounted(true), []);

   if (!mounted) return null;

   const isDark = theme === "dark" || !theme;

   const handleContinue = () => {
      if (selected === 'signup') {
         router.push('/sign-up');
      } else {
         router.push('/sign-in');
      }
   };

   return (
      <div className="page !pt-safe flex flex-col justify-center">
         <div className="page-inner space-y-12 py-10">
            {/* Header */}
            <div className="text-center space-y-4">
               <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#00aeef] to-[#00dbde] flex items-center justify-center mx-auto shadow-xl shadow-[#00aeef]/20 mb-6"
               >
                  <Sparkles size={32} className="text-white" />
               </motion.div>
               <motion.h1
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="t-large-title"
               >
                  {t("joinTitle")}
               </motion.h1>
               <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="t-subhead"
                  style={{ color: 'var(--label2)' }}
               >
                  {t("signupSubtitle")}
               </motion.p>
            </div>

            {/* OPTION CARDS */}
            <div className="space-y-4 stagger">
               {/* Option 1: Sign Up */}
               <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setSelected('signup')}
                  className={`card p-6 press flex items-center gap-5`}
                  style={selected === 'signup' ? { boxShadow: 'inset 0 0 0 2px var(--blue)' } : {}}
               >
                  <div className="icon-box" style={{ background: selected === 'signup' ? 'var(--blue)' : 'var(--blue-dim)', color: selected === 'signup' ? 'white' : 'var(--blue)' }}>
                     <UserPlus size={24} />
                  </div>
                  <div className="flex-1">
                     <div className="flex justify-between items-center mb-0.5">
                        <h3 className="t-headline">{t("newMemberTitle")}</h3>
                        <div className="w-5 h-5 rounded-full border flex items-center justify-center transition-all"
                             style={{ borderColor: selected === 'signup' ? 'var(--blue)' : 'var(--label4)', background: selected === 'signup' ? 'var(--blue)' : 'transparent' }}>
                           {selected === 'signup' && <CheckCircle2 size={12} className="text-white" />}
                        </div>
                     </div>
                     <p className="t-caption" style={{ color: 'var(--label3)' }}>
                        {t("newMemberDesc")}
                     </p>
                  </div>
                  {/* Recommended Badge */}
                  <div className="absolute -top-2 right-6 badge text-[9px] uppercase tracking-wider" style={{ background: 'var(--blue)', color: 'white' }}>
                     {t("recommended")}
                  </div>
               </motion.div>

               {/* Option 2: Sign In */}
               <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setSelected('signin')}
                  className={`card p-6 press flex items-center gap-5`}
                  style={selected === 'signin' ? { boxShadow: 'inset 0 0 0 2px var(--blue)' } : {}}
               >
                  <div className="icon-box" style={{ background: selected === 'signin' ? 'var(--blue)' : 'var(--blue-dim)', color: selected === 'signin' ? 'white' : 'var(--blue)' }}>
                     <LogIn size={24} />
                  </div>
                  <div className="flex-1">
                     <div className="flex justify-between items-center mb-0.5">
                        <h3 className="t-headline">{t("existingMemberTitle")}</h3>
                        <div className="w-5 h-5 rounded-full border flex items-center justify-center transition-all"
                             style={{ borderColor: selected === 'signin' ? 'var(--blue)' : 'var(--label4)', background: selected === 'signin' ? 'var(--blue)' : 'transparent' }}>
                           {selected === 'signin' && <CheckCircle2 size={12} className="text-white" />}
                        </div>
                     </div>
                     <p className="t-caption" style={{ color: 'var(--label3)' }}>
                        {t("existingMemberDesc")}
                     </p>
                  </div>
               </motion.div>
            </div>

            {/* Continue Button */}
            <motion.div
               initial={{ opacity: 0, y: 12 }}
               animate={{ opacity: 1, y: 0 }}
               className="pt-4"
            >
               <button
                  onClick={handleContinue}
                  className="btn btn-primary btn-full py-5 text-sm"
               >
                  {selected === 'signup' ? t("signUpButton") : t("signIn")}
                  <ArrowRight size={18} />
               </button>

               <div className="mt-8 text-center">
                  <Link href="/" className="t-caption font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">
                     {t("home")}
                  </Link>
               </div>
            </motion.div>
         </div>
      </div>
   );
}