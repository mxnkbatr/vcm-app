"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
   Calendar as CalendarIcon,
   Clock,
   CheckCircle2,
   ChevronRight,
   ChevronLeft,
   User,
   Mail,
   Phone,
   MapPin,
   Globe,
   LucideIcon,
   Video,
   Loader2
} from "lucide-react";
import { FaWhatsapp, FaSkype } from "react-icons/fa";

// --- TYPES ---
interface Service {
   id: string;
   title: string;
   duration: string;
   price: string;
   desc: string;
   icon: LucideIcon;
}

interface DateOption {
   day: string;
   date: string;
   full: string;
}

interface BookingFormData {
   service: Service | null;
   date: DateOption | null;
   time: string | null;
   name: string;
   phone: string;
   email: string;
   note: string;
}

interface Booking {
   _id: string;
   serviceTitle: string;
   date: string;
   time: string;
   status: string;
   livekitRoom: string;
}

// --- DATA ---
const SERVICES: Service[] = [
   {
      id: "consultation",
      title: "Ерөнхий Зөвлөгөө",
      duration: "30 мин",
      price: "Үнэгүй",
      desc: "Хөтөлбөрийн талаарх ерөнхий мэдээлэл авах, асуулт хариулт.",
      icon: Globe
   },
   {
      id: "interview",
      title: "Элсэлтийн Ярилцлага",
      duration: "45 мин",
      price: "20,000₮",
      desc: "Хэлний түвшин тогтоох болон бүртгэлийн анхан шатны ярилцлага.",
      icon: User
   },
   {
      id: "visa",
      title: "Визний Зөвлөгөө",
      duration: "60 мин",
      price: "50,000₮",
      desc: "Визний материал бүрдүүлэлт, хяналт болон зөвлөмж.",
      icon: MapPin
   }
];

const DATES: DateOption[] = [
   { day: "Дав", date: "20", full: "2025-01-20" },
   { day: "Мяг", date: "21", full: "2025-01-21" },
   { day: "Лха", date: "22", full: "2025-01-22" },
   { day: "Пүр", date: "23", full: "2025-01-23" },
   { day: "Баа", date: "24", full: "2025-01-24" },
   { day: "Бям", date: "25", full: "2025-01-25" },
];

const TIMES = [
   "10:00", "11:00", "13:00", "14:00", "15:30", "16:30", "18:00"
];

// --- ANIMATION VARIANTS ---
const stepVar = {
   hidden: { opacity: 0, x: 20 },
   visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
   exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
};

export default function BookingPage() {
   const { user, isLoaded, isSignedIn } = useUser();
   const router = useRouter();

   const [step, setStep] = useState(1);
   const [formData, setFormData] = useState<BookingFormData>({
      service: null,
      date: null,
      time: null,
      name: "",
      phone: "",
      email: "",
      note: ""
   });

   const [myBookings, setMyBookings] = useState<any[]>([]);
   const [isSubmitting, setIsSubmitting] = useState(false);

   // Autofill form when user loads
   useEffect(() => {
      if (user) {
         setFormData(prev => ({
            ...prev,
            name: user.fullName || "",
            email: user.primaryEmailAddress?.emailAddress || ""
         }));
      }
   }, [user]);

   // Fetch user's bookings
   useEffect(() => {
      if (isSignedIn) {
         fetch('/api/bookings')
            .then(res => res.json())
            .then(data => {
               if (Array.isArray(data)) setMyBookings(data);
            })
            .catch(err => console.error(err));
      }
   }, [isSignedIn]);

   const handleSelect = (key: keyof BookingFormData, value: any) => {
      setFormData(prev => ({ ...prev, [key]: value }));
   };

   const nextStep = () => setStep(prev => prev + 1);
   const prevStep = () => setStep(prev => prev - 1);

   const handleSubmit = async () => {
      if (!isSignedIn) {
         router.push("/sign-in");
         return;
      }

      setIsSubmitting(true);
      try {
         const res = await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
         });

         if (res.ok) {
            const newBooking = await res.json();
            setMyBookings(prev => [newBooking, ...prev]);
            // Reset form
            setStep(1);
            setFormData({
               service: null,
               date: null,
               time: null,
               name: user?.fullName || "",
               phone: "",
               email: user?.primaryEmailAddress?.emailAddress || "",
               note: ""
            });
            alert("Амжилттай захиалагдлаа! Админ баталгаажуулахыг хүлээнэ үү.");
         } else {
            alert("Алдаа гарлаа. Дахин оролдоно уу.");
         }
      } catch (error) {
         console.error("Booking error:", error);
      } finally {
         setIsSubmitting(false);
      }
   };

   return (
      <div className="min-h-screen bg-[#F8F9FC] text-slate-800 font-sans selection:bg-red-500 selection:text-white pt-32 pb-20 px-4 md:px-8">

         <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
               <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 shadow-sm mb-4">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-widest">Online Booking</span>
               </div>
               <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
                  Цаг <span className="text-red-600 underline decoration-wavy decoration-emerald-200">Захиалах</span>
               </h1>
               <p className="text-slate-500 font-medium max-w-xl mx-auto">
                  Та өөрт тохирох үйлчилгээ болон цагийг сонгоно уу. Бид тантай цаг алдалгүй холбогдох болно.
               </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 items-start">

               {/* ─── LEFT: BOOKING WIZARD ─── */}
               <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-6 md:p-10 overflow-hidden relative">

                  {/* Progress Bar */}
                  <div className="flex items-center justify-between mb-10 relative z-10">
                     {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center gap-2">
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${step >= s ? "bg-red-600 text-white" : "bg-slate-100 text-slate-400"}`}>
                              {step > s ? <CheckCircle2 size={16} /> : s}
                           </div>
                           <span className={`text-sm font-bold hidden md:block ${step >= s ? "text-slate-900" : "text-slate-400"}`}>
                              {s === 1 ? "Үйлчилгээ" : s === 2 ? "Цаг Сонгох" : "Мэдээлэл"}
                           </span>
                        </div>
                     ))}
                     <div className="absolute top-4 left-0 w-full h-0.5 bg-slate-100 -z-10" />
                  </div>

                  <AnimatePresence mode="wait">

                     {/* STEP 1: SERVICE */}
                     {step === 1 && (
                        <motion.div key="step1" variants={stepVar} initial="hidden" animate="visible" exit="exit" className="space-y-4">
                           <h2 className="text-2xl font-black text-slate-900 mb-6">Үйлчилгээгээ сонгоно уу</h2>
                           <div className="grid gap-4">
                              {SERVICES.map((srv) => (
                                 <div
                                    key={srv.id}
                                    onClick={() => handleSelect('service', srv)}
                                    className={`p-6 rounded-3xl border-2 cursor-pointer transition-all duration-300 flex items-start gap-4 hover:shadow-lg ${formData.service?.id === srv.id ? "border-emerald-500 bg-emerald-50/30" : "border-slate-100 bg-white hover:border-red-200"}`}
                                 >
                                    <div className={`p-4 rounded-2xl ${formData.service?.id === srv.id ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"}`}>
                                       <srv.icon size={24} />
                                    </div>
                                    <div className="flex-1">
                                       <div className="flex justify-between items-center mb-1">
                                          <h3 className="font-bold text-lg text-slate-900">{srv.title}</h3>
                                          <span className={`font-black text-sm px-3 py-1 rounded-full ${formData.service?.id === srv.id ? "bg-emerald-200 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                                             {srv.price}
                                          </span>
                                       </div>
                                       <p className="text-sm text-slate-500 font-medium mb-2">{srv.desc}</p>
                                       <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                          <Clock size={14} /> {srv.duration}
                                       </div>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </motion.div>
                     )}

                     {/* STEP 2: DATE & TIME */}
                     {step === 2 && (
                        <motion.div key="step2" variants={stepVar} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                           <div>
                              <h2 className="text-2xl font-black text-slate-900 mb-6">Өдрөө сонгоно уу</h2>
                              <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                                 {DATES.map((d) => (
                                    <button
                                       key={d.date}
                                       onClick={() => handleSelect('date', d)}
                                       className={`min-w-20 p-4 rounded-3xl border-2 flex flex-col items-center justify-center transition-all ${formData.date?.date === d.date
                                          ? "border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-200"
                                          : "border-slate-100 bg-white hover:border-emerald-200"
                                          }`}
                                    >
                                       <span className={`text-xs font-bold uppercase mb-1 ${formData.date?.date === d.date ? "text-emerald-100" : "text-slate-400"}`}>{d.day}</span>
                                       <span className="text-2xl font-black">{d.date}</span>
                                    </button>
                                 ))}
                              </div>
                           </div>

                           <div>
                              <h2 className="text-2xl font-black text-slate-900 mb-6">Цагаа сонгоно уу</h2>
                              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                 {TIMES.map((t) => (
                                    <button
                                       key={t}
                                       onClick={() => handleSelect('time', t)}
                                       className={`py-3 rounded-2xl font-bold text-sm border-2 transition-all ${formData.time === t
                                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                          : "border-slate-100 text-slate-600 hover:border-red-200"
                                          }`}
                                    >
                                       {t}
                                    </button>
                                 ))}
                              </div>
                           </div>
                        </motion.div>
                     )}

                     {/* STEP 3: CONTACT FORM */}
                     {step === 3 && (
                        <motion.div key="step3" variants={stepVar} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                           <h2 className="text-2xl font-black text-slate-900 mb-6">Хувийн мэдээлэл</h2>

                           <div className="space-y-4">
                              <div>
                                 <label className="block text-xs font-bold uppercase text-slate-500 mb-2 ml-2">Таны Нэр</label>
                                 <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                       type="text"
                                       value={formData.name}
                                       className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-800 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all"
                                       placeholder="Бат-Эрдэнэ"
                                       onChange={(e) => handleSelect('name', e.target.value)}
                                    />
                                 </div>
                              </div>

                              <div className="grid md:grid-cols-2 gap-4">
                                 <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2 ml-2">Утасны Дугаар</label>
                                    <div className="relative">
                                       <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                       <input
                                          type="tel"
                                          value={formData.phone}
                                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-800 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all"
                                          placeholder="8888-8888"
                                          onChange={(e) => handleSelect('phone', e.target.value)}
                                       />
                                    </div>
                                 </div>
                                 <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2 ml-2">И-мэйл</label>
                                    <div className="relative">
                                       <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                       <input
                                          type="email"
                                          value={formData.email}
                                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-800 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all"
                                          placeholder="name@example.com"
                                          onChange={(e) => handleSelect('email', e.target.value)}
                                       />
                                    </div>
                                 </div>
                              </div>

                              <div>
                                 <label className="block text-xs font-bold uppercase text-slate-500 mb-2 ml-2">Нэмэлт тайлбар (Заавал биш)</label>
                                 <textarea
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-4 font-medium text-slate-800 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all h-32 resize-none"
                                    placeholder="Тодруулах зүйл..."
                                    onChange={(e) => handleSelect('note', e.target.value)}
                                 />
                              </div>
                           </div>
                        </motion.div>
                     )}

                  </AnimatePresence>

                  {/* Navigation Buttons */}
                  <div className="flex justify-between mt-10 pt-6 border-t border-slate-100">
                     {step > 1 ? (
                        <button onClick={prevStep} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all flex items-center gap-2">
                           <ChevronLeft size={20} /> Буцах
                        </button>
                     ) : (
                        <div /> /* Spacer */
                     )}

                     {step < 3 ? (
                        <button
                           onClick={nextStep}
                           disabled={step === 1 && !formData.service || step === 2 && (!formData.date || !formData.time)}
                           className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg flex items-center gap-2 transition-all ${(step === 1 && !formData.service) || (step === 2 && (!formData.date || !formData.time))
                              ? "bg-slate-300 cursor-not-allowed"
                              : "bg-red-600 hover:bg-red-700 hover:scale-105"
                              }`}
                        >
                           Үргэлжлүүлэх <ChevronRight size={20} />
                        </button>
                     ) : (
                        <button onClick={handleSubmit} disabled={isSubmitting} className="px-10 py-3 rounded-xl bg-emerald-500 text-white font-black uppercase tracking-wider shadow-lg hover:bg-emerald-600 hover:scale-105 transition-all flex items-center gap-2">
                           {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Баталгаажуулах"} <CheckCircle2 size={20} />
                        </button>
                     )}
                  </div>

               </div>

               {/* ─── RIGHT: SUMMARY SIDEBAR ─── */}
               <div className="lg:col-span-1 sticky top-24">
                  <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-40 h-40 bg-red-600 rounded-bl-full opacity-20 blur-xl" />
                     <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500 rounded-tr-full opacity-20 blur-xl" />

                     <h3 className="text-xl font-black mb-6 relative z-10">Захиалгын <br /> Мэдээлэл</h3>

                     <div className="space-y-6 relative z-10">
                        {/* Service Summary */}
                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                           <p className="text-xs font-bold uppercase text-slate-400 mb-1">Үйлчилгээ</p>
                           <div className="flex items-center gap-3">
                              {formData.service ? (
                                 <>
                                    <div className="bg-emerald-500 p-2 rounded-lg"><CheckCircle2 size={16} /></div>
                                    <div>
                                       <p className="font-bold text-sm">{formData.service.title}</p>
                                       <p className="text-xs text-slate-300">{formData.service.price}</p>
                                    </div>
                                 </>
                              ) : (
                                 <p className="text-sm font-bold text-slate-500 italic">Сонгогдоогүй...</p>
                              )}
                           </div>
                        </div>

                        {/* Date Summary */}
                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                           <p className="text-xs font-bold uppercase text-slate-400 mb-1">Огноо & Цаг</p>
                           {formData.date && formData.time ? (
                              <div className="flex items-center gap-3">
                                 <div className="bg-red-500 p-2 rounded-lg"><CalendarIcon size={16} /></div>
                                 <div>
                                    <p className="font-bold text-sm">{formData.date.full}</p>
                                    <p className="text-xs text-slate-300">{formData.time}</p>
                                 </div>
                              </div>
                           ) : (
                              <p className="text-sm font-bold text-slate-500 italic">Сонгогдоогүй...</p>
                           )}
                        </div>
                     </div>

                     {/* Quick Contacts */}
                     <div className="mt-8 pt-8 border-t border-white/10">
                        <p className="text-xs font-bold text-center text-slate-400 mb-4 uppercase">Шууд Холбогдох</p>
                        <div className="flex justify-center gap-4">
                           <button className="p-3 bg-green-500 rounded-full hover:scale-110 transition-transform"><FaWhatsapp size={20} /></button>
                           <button className="p-3 bg-blue-500 rounded-full hover:scale-110 transition-transform"><FaSkype size={20} /></button>
                        </div>
                     </div>
                  </div>
               </div>

            </div>
         </div>
      </div>
   );
}