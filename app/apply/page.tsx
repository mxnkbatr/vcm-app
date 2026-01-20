"use client";

import React, { useState, useRef } from "react";
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
  const [success, setSuccess] = useState(false);
  
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
      // API Call to send request to Admin
      const response = await fetch('/api/applications/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programId: selectedProgram,
          ...formData,
          status: 'pending',
          submittedAt: new Date(),
        })
      });

      // Simulate network delay for effect
      await new Promise(r => setTimeout(r, 1500));
      setSuccess(true);
      
    } catch (error) {
      console.error("Submission failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-900 font-sans selection:bg-[#E31B23] selection:text-white pt-28 pb-20 px-6">
      
      {/* ─── 1. HERO SECTION ─── */}
      <div className="max-w-7xl mx-auto mb-20 text-center relative z-10">
         <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white border border-slate-200 text-slate-500 shadow-sm mb-6"
         >
            <Plane size={16} className="text-[#E31B23]" />
            <span className="text-xs font-black uppercase tracking-widest">Applications Open</span>
         </motion.div>
         
         <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter leading-tight">
            Start Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E31B23] to-rose-500">Journey.</span>
         </h1>
         <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
            Select a program below and submit your application. Our team will review your profile and contact you within 24 hours.
         </p>
      </div>

      {/* ─── 2. PROGRAM SELECTION GRID ─── */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24 relative z-10">
         {PROGRAMS.map((prog, i) => (
            <motion.div
               key={prog.id}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               onClick={() => handleSelectProgram(prog.id)}
               className={`group relative rounded-[2.5rem] overflow-hidden cursor-pointer border-4 transition-all duration-300 h-[450px]
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
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-80" />
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
         <AnimatePresence mode="wait">
            {!selectedProgram ? (
               <motion.div 
                 initial={{ opacity: 0 }} 
                 animate={{ opacity: 1 }}
                 className="text-center py-20 border-2 border-dashed border-slate-200 rounded-[3rem] bg-white/50"
               >
                  <MapPin className="mx-auto text-slate-300 mb-4" size={48} />
                  <h3 className="text-xl font-bold text-slate-400">Please select a program above to continue</h3>
               </motion.div>
            ) : success ? (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="bg-white rounded-[3rem] p-16 text-center shadow-2xl border border-[#00C896]/20"
               >
                  <div className="w-24 h-24 bg-[#00C896]/10 text-[#00C896] rounded-full flex items-center justify-center mx-auto mb-8">
                     <CheckCircle2 size={48} />
                  </div>
                  <h2 className="text-4xl font-black text-slate-900 mb-4">Request Sent!</h2>
                  <p className="text-lg text-slate-500 max-w-md mx-auto mb-10">
                     We have received your application for <span className="font-bold text-[#E31B23]">{PROGRAMS.find(p => p.id === selectedProgram)?.title}</span>. Check your dashboard for updates.
                  </p>
                  <button onClick={() => window.location.href = "/dashboard"} className="bg-slate-900 text-white px-10 py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-[#E31B23] transition-colors">
                     Go to Dashboard
                  </button>
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
                           Applying For
                        </span>
                        <h2 className="text-4xl font-black mb-2">{PROGRAMS.find(p => p.id === selectedProgram)?.country}</h2>
                        <p className="text-slate-400 text-sm font-bold opacity-80">Full Program</p>
                     </div>
                     <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-3 text-sm font-medium">
                           <FaPassport className="text-slate-500" /> Verify Identity
                        </div>
                        <div className="flex items-center gap-3 text-sm font-medium">
                           <FaGraduationCap className="text-slate-500" /> Language Check
                        </div>
                        <div className="flex items-center gap-3 text-sm font-medium">
                           <Info className="text-slate-500" /> Admin Review
                        </div>
                     </div>
                  </div>

                  {/* Right Side: Inputs */}
                  <div className="w-full md:w-2/3 p-10 md:p-14">
                     <h3 className="text-2xl font-black text-slate-900 mb-8">Personal Details</h3>
                     <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                           <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">First Name</label>
                              <input 
                                required
                                value={formData.firstName}
                                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E31B23]" 
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Last Name</label>
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
                              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Email</label>
                              <input 
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E31B23]" 
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Phone</label>
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
                                type="number"
                                required
                                value={formData.age}
                                onChange={(e) => setFormData({...formData, age: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E31B23]" 
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Language Level</label>
                              <select 
                                value={formData.level}
                                onChange={(e) => setFormData({...formData, level: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E31B23]"
                              >
                                 <option value="A1">Beginner (A1)</option>
                                 <option value="A2">Elementary (A2)</option>
                                 <option value="B1">Intermediate (B1)</option>
                                 <option value="B2">Upper Intermediate (B2)</option>
                              </select>
                           </div>
                        </div>

                        <div className="space-y-2">
                           <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Motivation (Optional)</label>
                           <textarea 
                              value={formData.message}
                              onChange={(e) => setFormData({...formData, message: e.target.value})}
                              placeholder="Why do you want to be an Au Pair?"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E31B23] h-24 resize-none" 
                           />
                        </div>

                        <button 
                           type="submit" 
                           disabled={loading}
                           className="w-full bg-[#E31B23] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.25em] shadow-xl shadow-red-200 hover:shadow-2xl hover:bg-red-700 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                        >
                           {loading ? <Loader2 className="animate-spin" /> : <>Send Request <Send size={16} /></>}
                        </button>
                     </form>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>
      </div>

    </div>
  );
}
