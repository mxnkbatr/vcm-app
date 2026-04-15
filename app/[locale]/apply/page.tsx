"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
   CheckCircle2,
   MapPin,
   Clock,
   Euro,
   ArrowRight,
   Loader2,
   Send,
   Plane,
   Info
} from "lucide-react";
import { FaPassport, FaGraduationCap } from "react-icons/fa";
import { Link } from "@/navigation";
import { useTranslations } from "next-intl";

// --- BRAND CONFIG ---
const BRAND = {
   SKY: "#0EA5E9",
   GREEN: "#00C896",
   DARK: "#0F172A",
};

// --- PROGRAMS DATA ---
const PROGRAMS = [
   {
      id: "EDU",
      countryKey: "prog_edu",
      titleKey: "prog_edu",
      image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80",
      allowance: "Flexible",
      currency: "",
      hours: "Flexible",
      color: "from-sky-500 to-blue-600"
   },
   {
      id: "AND",
      countryKey: "prog_and",
      titleKey: "prog_and",
      image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80",
      allowance: "Community",
      currency: "",
      hours: "Flexible",
      color: "from-emerald-500 to-teal-600"
   },
   {
      id: "VCLUB",
      countryKey: "prog_vclub",
      titleKey: "prog_vclub",
      image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80",
      allowance: "Members",
      currency: "",
      hours: "Events",
      color: "from-amber-500 to-orange-600"
   },
];

export default function ApplyPage() {
   const t = useTranslations("ApplyPage");
   const nt = useTranslations("navbar");
   const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
   const [loading, setLoading] = useState(false);
   const [step, setStep] = useState(1); // 1: Initial Form, 2: Detailed Info
   const [isPreFilled, setIsPreFilled] = useState(false);

   // Form State
   const [formData, setFormData] = useState({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      age: "",
      level: "A1",
      message: "",
      generalId: ""
   });

   const [generals, setGenerals] = useState<{_id: string, fullName: string, role: string}[]>([]);

   // Pre-fill user data from DB
   useEffect(() => {
      const fetchUserData = async () => {
         try {
            const res = await fetch("/api/user/get-profile");
            if (res.ok) {
               const { user } = await res.json();
               if (user) {
                  setIsPreFilled(true);
                  // Calculate age if DOB exists
                  let calculatedAge = "";
                  if (user.profile?.dob) {
                     const birthDate = new Date(user.profile.dob);
                     const today = new Date();
                     let age = today.getFullYear() - birthDate.getFullYear();
                     const m = today.getMonth() - birthDate.getMonth();
                     if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                        age--;
                     }
                     calculatedAge = age.toString();
                  }

                  setFormData(prev => ({
                     ...prev,
                     email: user.email || prev.email,
                     firstName: user.fullName?.split(" ")[0] || prev.firstName,
                     lastName: user.fullName?.split(" ").slice(1).join(" ") || prev.lastName,
                     phone: user.profile?.phone || prev.phone,
                     age: calculatedAge || prev.age
                  }));
               }
            }
         } catch (err) {
            console.error("Error fetching user info:", err);
         }
      };
      
      const fetchGenerals = async () => {
         try {
            const res = await fetch("/api/generals");
            if (res.ok) {
               const data = await res.json();
               setGenerals(data);
            }
         } catch(e) {}
      };

      fetchUserData();
      fetchGenerals();
   }, []);

   const formRef = useRef<HTMLDivElement>(null);

   // Scroll to form when program selected
   const handleSelectProgram = (id: string) => {
      setSelectedProgram(id);
      setTimeout(() => {
         formRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedProgram) return;

      setLoading(true);

      try {
         const response = await fetch('/api/applications/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               programId: selectedProgram,
               ...formData,
            })
         });

         if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Submission failed');
         }

         setStep(2); // Move to detailed info

      } catch (error: any) {
         console.error("Submission failed", error);
         alert(error.message || "An error occurred during submission.");
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="page">
         <div className="page-inner space-y-5"> 
            <div className="pt-2"> 
               <h1 className="t-large-title">Өргөдөл гаргах</h1> 
               <p className="t-subhead mt-1" style={{ color: 'var(--label2)' }}>Хөтөлбөр сонгоод анкетаа илгээнэ үү</p> 
            </div> 

            <AnimatePresence mode="wait">
               {step === 1 ? (
                  <motion.div
                     key="step1"
                     initial={{ opacity: 1 }}
                     exit={{ opacity: 0, x: -20 }}
                  >
                     {/* ─── 2. PROGRAM SELECTION GRID ─── */}
                     <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24 relative z-10">
                        {PROGRAMS.map((prog, i) => (
                           <motion.div
                              key={prog.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.1 }}
                              onClick={() => handleSelectProgram(prog.id)}
                              className={`card overflow-hidden press h-112.5
                        ${selectedProgram === prog.id
                                    ? "ring-4 ring-[#0EA5E9] shadow-2xl scale-105 z-20"
                                    : "hover:shadow-xl hover:scale-[1.02]"}`
                              }
                           >
                           {/* Background Image */}
                           <div className="absolute inset-0">
                              <Image
                                 src={prog.image}
                                 alt=""
                                 fill
                                 className="object-cover transition-transform duration-700 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-slate-900/40 to-transparent opacity-80" />
                           </div>

                           {/* Selected Checkmark */}
                           {selectedProgram === prog.id && (
                              <div className="absolute top-4 right-4 bg-[#0EA5E9] text-white p-2 rounded-full shadow-lg z-30">
                                 <CheckCircle2 size={24} />
                              </div>
                           )}

                           {/* Content */}
                           <div className="absolute bottom-0 left-0 w-full p-8 text-white z-10">
                              <h3 className="text-3xl font-black mb-2">{nt(prog.countryKey)}</h3>
                              <div className="space-y-2 mb-6 text-sm font-medium text-slate-200">
                                 <div className="flex items-center gap-2">
                                    <Euro size={16} className="text-[#00C896]" /> {prog.allowance}{prog.currency} / {t("programSelection.allowanceUnit")}
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <Clock size={16} className="text-amber-400" /> {prog.hours}h / {t("programSelection.hoursUnit")}
                                 </div>
                              </div>

                              <div className="border-t border-white/20 pt-4">
                                 <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-2">{t("programSelection.requirements")}</p>
                                 <div className="flex flex-wrap gap-2">
                                    {t.raw(`requirements.${prog.countryKey}`).map((r: string) => (
                                       <span key={r} className="bg-white/10 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-bold">
                                          {r}
                                       </span>
                                    ))}
                                 </div>
                              </div>
                           </div>
                        </motion.div>
                     ))}
                  </div>

                  {/* ─── 3. APPLICATION FORM ─── */}
                  <div ref={formRef} className="max-w-4xl mx-auto relative z-10">
                     {!selectedProgram ? (
                        <motion.div
                           initial={{ opacity: 0 }}
                           animate={{ opacity: 1 }}
                           className="text-center py-20 border-2 border-dashed border-slate-200 rounded-[3rem] bg-white/50"
                        >
                           <MapPin className="mx-auto text-slate-300 mb-4" size={48} />
                           <h3 className="text-xl font-bold text-slate-400">{t("programSelection.selectPrompt")}</h3>
                        </motion.div>
                     ) : (
                        <motion.div
                           initial={{ opacity: 0, y: 30 }}
                           animate={{ opacity: 1, y: 0 }}
                           className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col md:flex-row"
                        >
                           {/* Left Side: Summary */}
                           <div className="w-full md:w-1/3 bg-slate-900 text-white p-10 flex flex-col justify-between relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-64 h-64 bg-[#0EA5E9] rounded-full blur-[100px] opacity-20" />
                              <div className="relative z-10">
                                 <span className="inline-block bg-[#0EA5E9] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md mb-6">
                                    {t("programSelection.step1")}
                                 </span>
                                 <h2 className="text-4xl font-black mb-2">{nt(PROGRAMS.find(p => p.id === selectedProgram)?.countryKey || "")}</h2>
                                 <p className="text-slate-400 text-sm font-bold opacity-80">{t("programSelection.initialRequest")}</p>
                              </div>
                              <div className="relative z-10 space-y-4">
                                 <div className="flex items-center gap-3 text-sm font-medium">
                                    <CheckCircle2 className="text-[#00C896]" size={16} /> {t("steps.choose")}
                                 </div>
                                 <div className="flex items-center gap-3 text-sm font-medium opacity-50">
                                    <div className="w-4 h-4 rounded-full border border-slate-600" /> {t("steps.profile")}
                                 </div>
                                 <div className="flex items-center gap-3 text-sm font-medium opacity-50">
                                    <div className="w-4 h-4 rounded-full border border-slate-600" /> {t("steps.documents")}
                                 </div>
                              </div>
                           </div>

                           {/* Right Side: Inputs */}
                           <div className="w-full md:w-2/3 p-10 md:p-14">
                              <div className="mb-8">
                                 <h3 className="text-2xl font-black text-slate-900 mb-1">{t("form.personalDetails")}</h3>
                                 {isPreFilled ? (
                                    <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                       {t("form.synced", { email: formData.email })}
                                    </div>
                                 ) : (
                                    <p className="text-xs text-slate-400 font-medium">{t("form.fillDetails")}</p>
                                 )}
                              </div>

                              <form onSubmit={handleSubmit} className="space-y-6">
                                 <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                       <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 flex justify-between">
                                          {t("form.firstName")}
                                          {isPreFilled && formData.firstName && <span className="text-[8px] text-emerald-500 font-black tracking-widest bg-emerald-50 px-1.5 rounded uppercase flex items-center gap-1">{t("form.verified")}</span>}
                                       </label>
                                       <input
                                          required
                                          value={formData.firstName}
                                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                          className="input"
                                       />
                                    </div>
                                    <div className="space-y-2">
                                       <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 flex justify-between">
                                          {t("form.lastName")}
                                          {isPreFilled && formData.lastName && <span className="text-[8px] text-emerald-500 font-black tracking-widest bg-emerald-50 px-1.5 rounded uppercase flex items-center gap-1">{t("form.verified")}</span>}
                                       </label>
                                       <input
                                          required
                                          value={formData.lastName}
                                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                          className="input"
                                       />
                                    </div>
                                 </div>

                                 <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                       <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 flex justify-between">
                                          {t("form.email")}
                                          {isPreFilled && <span className="text-[8px] text-[#0EA5E9] font-black tracking-widest bg-sky-50 px-1.5 rounded uppercase flex items-center gap-1"><Info size={8} /> {t("form.linked")}</span>}
                                       </label>
                                       <input
                                          type="email"
                                          required
                                          readOnly={isPreFilled}
                                          value={formData.email}
                                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                          className={`input ${isPreFilled ? "opacity-50 cursor-not-allowed" : ""}`}
                                       />
                                    </div>
                                    <div className="space-y-2">
                                       <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 flex justify-between">
                                          {t("form.phone")}
                                          {isPreFilled && formData.phone && <span className="text-[8px] text-emerald-500 font-black tracking-widest bg-emerald-50 px-1.5 rounded uppercase flex items-center gap-1">{t("form.verified")}</span>}
                                       </label>
                                       <input
                                          required
                                          value={formData.phone}
                                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                          className="input"
                                       />
                                    </div>
                                 </div>

                                 <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                       <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">{t("form.age")}</label>
                                       <input
                                          required
                                          type="number"
                                          value={formData.age}
                                          onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                          className="input"
                                       />
                                    </div>
                                    <div className="space-y-2">
                                       <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">{t("form.level")}</label>
                                       <select
                                          required
                                          value={formData.level}
                                          onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                          className="input"
                                       >
                                          <option value="A1">{t("levels.a1")}</option>
                                          <option value="A2">{t("levels.a2")}</option>
                                          <option value="B1">{t("levels.b1")}</option>
                                          <option value="B2">{t("levels.b2")}</option>
                                          <option value="C1">{t("levels.c1")}</option>
                                       </select>
                                    </div>
                                 </div>

                                 <div className="space-y-2 mb-6">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Select Program General *</label>
                                    <select
                                       required
                                       value={formData.generalId}
                                       onChange={(e) => setFormData({ ...formData, generalId: e.target.value })}
                                       className="input"
                                    >
                                       <option value="" disabled>Choose a coordinator...</option>
                                       {generals.map(g => (
                                          <option key={g._id} value={g._id}>{g.fullName} ({g.role.replace('general_', '').toUpperCase()})</option>
                                       ))}
                                    </select>
                                 </div>

                                 <div className="space-y-2 mb-8">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Letter to the General *</label>
                                    <textarea
                                       required
                                       rows={4}
                                       placeholder="Please explain why you want to join this program and answer the General's prerequisite questions here..."
                                       value={formData.message}
                                       onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                       className="input"
                                    />
                                 </div>

                                 <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn btn-primary btn-full"
                                 >
                                    {loading ? <Loader2 className="animate-spin" /> : <>{t("form.saveContinue")} <ArrowRight size={16} /></>}
                                 </button>
                              </form>
                           </div>
                        </motion.div>
                     )}
                  </div>
               </motion.div>
            ) : (
               <motion.div
                  key="step2"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="max-w-3xl mx-auto bg-white rounded-[3rem] p-16 text-center shadow-2xl border border-sky-100"
               >
                  <div className="w-24 h-24 bg-sky-50 text-sky-500 rounded-full flex items-center justify-center mx-auto mb-8 border border-sky-100 shadow-inner">
                     <CheckCircle2 size={48} />
                  </div>
                  <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Application Submitted</h2>
                  <p className="text-lg text-slate-500 mb-10 leading-relaxed">
                     Your application and Letter of Motivation have been securely forwarded to the Program General.
                  </p>
                  <Link href="/dashboard" className="bg-sky-600 text-white px-10 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-sky-600/20 hover:shadow-2xl hover:bg-sky-500 transition-all inline-flex items-center gap-3 active:scale-[0.98]">
                     Go to Dashboard <ArrowRight size={16} />
                  </Link>
               </motion.div>
            )}
         </AnimatePresence>
      </div>
   </div>
   );
}
