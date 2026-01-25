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
import StudentInformation from "@/app/components/StudentInformation";

// --- BRAND CONFIG ---
const BRAND = {
  RED: "#E31B23",
  GREEN: "#00C896",
  DARK: "#0F172A",
};

// --- PROGRAMS DATA ---
const PROGRAMS = [
  {
    id: "DE",
    country: "Germany",
    title: "Au Pair Germany",
    image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=800&q=80",
    allowance: "280€ / month",
    hours: "30h / week",
    requirements: ["Age 18-26", "Basic German (A1)", "Single"],
    color: "from-red-500 to-yellow-500"
  },
  {
    id: "BE",
    country: "Belgium",
    title: "Au Pair Belgium",
    image: "https://images.unsplash.com/photo-1549144511-f099e773c147?auto=format&fit=crop&w=800&q=80",
    allowance: "450€ / month",
    hours: "20h / week",
    requirements: ["Age 18-25", "English or French", "High School Diploma"],
    color: "from-yellow-400 to-red-500"
  },
  {
    id: "AT",
    country: "Austria",
    title: "Au Pair Austria",
    image: "https://images.unsplash.com/photo-1516550893923-42d28e5677af?auto=format&fit=crop&w=800&q=80",
    allowance: "500€ / month",
    hours: "18h / week",
    requirements: ["Age 18-27", "Basic German", "Experience with kids"],
    color: "from-red-600 to-red-400"
  },
  {
    id: "CH",
    country: "Switzerland",
    title: "Au Pair Switzerland",
    image: "https://images.unsplash.com/photo-1527668752968-14dc70a27c95?auto=format&fit=crop&w=800&q=80",
    allowance: "990 CHF / month",
    hours: "30h / week",
    requirements: ["Age 18-25", "German/French", "Driving License"],
    color: "from-red-600 to-white"
  },
];

export default function ApplyPage() {
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
    message: ""
  });

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
    fetchUserData();
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
    <div className="min-h-dvh bg-[#FDFBF7] text-slate-900 font-sans selection:bg-[#E31B23] selection:text-white pt-28 pb-20 px-6">
      
      {/* ─── 1. HERO SECTION ─── */}
      <div className="max-w-7xl mx-auto mb-20 text-center relative z-10">
         <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white border border-slate-200 text-slate-500 shadow-sm mb-6"
         >
            <Plane size={16} className="text-[#E31B23]" />
            <span className="text-xs font-black uppercase tracking-widest">Step {step} of 3</span>
         </motion.div>
         
         <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter leading-tight">
            {step === 1 ? <>Start Your <span className="text-transparent bg-clip-text bg-linear-to-r from-[#E31B23] to-rose-500">Journey.</span></> : "Detailed Profile"}
         </h1>
         {step === 1 && (
            <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium transition-all">
               Select a program below and submit your application. Our team will review your profile and contact you within 24 hours.
            </p>
         )}
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
                     className={`group relative rounded-[2.5rem] overflow-hidden cursor-pointer border-4 transition-all duration-300 h-112.5
                        ${selectedProgram === prog.id 
                          ? "border-[#E31B23] shadow-2xl scale-105 z-20" 
                          : "border-transparent hover:border-slate-200 hover:shadow-xl hover:scale-[1.02]"}`
                     }
                  >
                     {/* Background Image */}
                     <div className="absolute inset-0">
                        <Image 
                          src={prog.image} 
                          alt={prog.country} 
                          fill 
                          className="object-cover transition-transform duration-700 group-hover:scale-110" 
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-slate-900/40 to-transparent opacity-80" />
                     </div>

                     {/* Selected Checkmark */}
                     {selectedProgram === prog.id && (
                        <div className="absolute top-4 right-4 bg-[#E31B23] text-white p-2 rounded-full shadow-lg z-30">
                           <CheckCircle2 size={24} />
                        </div>
                     )}

                     {/* Content */}
                     <div className="absolute bottom-0 left-0 w-full p-8 text-white z-10">
                        <h3 className="text-3xl font-black mb-2">{prog.country}</h3>
                        <div className="space-y-2 mb-6 text-sm font-medium text-slate-200">
                           <div className="flex items-center gap-2">
                              <Euro size={16} className="text-[#00C896]" /> {prog.allowance}
                           </div>
                           <div className="flex items-center gap-2">
                              <Clock size={16} className="text-amber-400" /> {prog.hours}
                           </div>
                        </div>
                        
                        <div className="border-t border-white/20 pt-4">
                           <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-2">Requirements</p>
                           <div className="flex flex-wrap gap-2">
                              {prog.requirements.map(r => (
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
                     <h3 className="text-xl font-bold text-slate-400">Please select a program above to continue</h3>
                  </motion.div>
               ) : (
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col md:flex-row"
                  >
                     {/* Left Side: Summary */}
                     <div className="w-full md:w-1/3 bg-slate-900 text-white p-10 flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#E31B23] rounded-full blur-[100px] opacity-20" />
                        <div className="relative z-10">
                           <span className="inline-block bg-[#E31B23] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md mb-6">
                              Step 1
                           </span>
                           <h2 className="text-4xl font-black mb-2">{PROGRAMS.find(p => p.id === selectedProgram)?.country}</h2>
                           <p className="text-slate-400 text-sm font-bold opacity-80">Initial Request</p>
                        </div>
                        <div className="relative z-10 space-y-4">
                           <div className="flex items-center gap-3 text-sm font-medium">
                              <CheckCircle2 className="text-[#00C896]" size={16} /> Choose Program
                           </div>
                           <div className="flex items-center gap-3 text-sm font-medium opacity-50">
                              <div className="w-4 h-4 rounded-full border border-slate-600" /> Detailed Profile
                           </div>
                           <div className="flex items-center gap-3 text-sm font-medium opacity-50">
                              <div className="w-4 h-4 rounded-full border border-slate-600" /> Documents
                           </div>
                        </div>
                     </div>

                     {/* Right Side: Inputs */}
                     <div className="w-full md:w-2/3 p-10 md:p-14">
                        <div className="mb-8">
                           <h3 className="text-2xl font-black text-slate-900 mb-1">Personal Details</h3>
                           {isPreFilled ? (
                              <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                 Automatically synced with your account: {formData.email}
                              </div>
                           ) : (
                              <p className="text-xs text-slate-400 font-medium">Please fill in your details to continue.</p>
                           )}
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                           <div className="grid md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 flex justify-between">
                                    First Name
                                    {isPreFilled && formData.firstName && <span className="text-[8px] text-emerald-500 font-black tracking-widest bg-emerald-50 px-1.5 rounded uppercase flex items-center gap-1">Verified from Profile</span>}
                                 </label>
                                 <input 
                                   required
                                   value={formData.firstName}
                                   onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                   className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E31B23]" 
                                 />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 flex justify-between">
                                    Last Name
                                    {isPreFilled && formData.lastName && <span className="text-[8px] text-emerald-500 font-black tracking-widest bg-emerald-50 px-1.5 rounded uppercase flex items-center gap-1">Verified from Profile</span>}
                                 </label>
                                 <input 
                                   required
                                   value={formData.lastName}
                                   onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                   className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E31B23]" 
                                 />
                              </div>
                           </div>

                           <div className="grid md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 flex justify-between">
                                    Email Address
                                    {isPreFilled && <span className="text-[8px] text-[#E31B23] font-black tracking-widest bg-red-50 px-1.5 rounded uppercase flex items-center gap-1"><Info size={8} /> Linked to your profile</span>}
                                 </label>
                                 <input 
                                   type="email"
                                   required
                                   readOnly={isPreFilled}
                                   value={formData.email}
                                   onChange={(e) => setFormData({...formData, email: e.target.value})}
                                   className={`w-full border border-slate-200 rounded-xl px-4 py-3 font-bold transition-all focus:outline-none focus:ring-2 focus:ring-[#E31B23] 
                                     ${isPreFilled ? "bg-slate-100 text-slate-500 cursor-not-allowed border-dashed" : "bg-slate-50 text-slate-900"}`}
                                 />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 flex justify-between">
                                    Phone Number
                                    {isPreFilled && formData.phone && <span className="text-[8px] text-emerald-500 font-black tracking-widest bg-emerald-50 px-1.5 rounded uppercase flex items-center gap-1">Verified from Profile</span>}
                                 </label>
                                 <input 
                                   required
                                   value={formData.phone}
                                   onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                   className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E31B23]" 
                                 />
                              </div>
                           </div>

                           <div className="grid md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Age</label>
                                 <input 
                                   required
                                   type="number"
                                   value={formData.age}
                                   onChange={(e) => setFormData({...formData, age: e.target.value})}
                                   className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E31B23]" 
                                 />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Language Level</label>
                                 <select 
                                   required
                                   value={formData.level}
                                   onChange={(e) => setFormData({...formData, level: e.target.value})}
                                   className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E31B23]" 
                                 >
                                    <option value="A1">A1 (Beginner)</option>
                                    <option value="A2">A2 (Elementary)</option>
                                    <option value="B1">B1 (Intermediate)</option>
                                    <option value="B2">B2 (Upper Intermediate)</option>
                                    <option value="C1">C1 (Advanced)</option>
                                 </select>
                              </div>
                           </div>

                           <button 
                              type="submit" 
                              disabled={loading}
                              className="w-full bg-[#E31B23] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.25em] shadow-xl shadow-red-200 hover:shadow-2xl hover:bg-red-700 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                           >
                              {loading ? <Loader2 className="animate-spin" /> : <>Save & Continue <ArrowRight size={16} /></>}
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
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-6xl mx-auto"
          >
             <StudentInformation onSuccess={() => setStep(3)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
