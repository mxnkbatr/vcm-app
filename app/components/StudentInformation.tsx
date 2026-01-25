"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User as UserIcon,
  MapPin,
  Phone,
  GraduationCap,
  Globe,
  Briefcase,
  Heart,
  Calendar,
  Home,
  CheckCircle2,
  Loader2,
  Send,
  ArrowRight,
  Plane,
  Languages,
  Baby,
  Utensils
} from "lucide-react";

interface StudentInformationProps {
  onSuccess?: () => void;
}

export default function StudentInformation({ onSuccess }: StudentInformationProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    sex: "",
    dob: "",
    placeOfBirth: "",
    nationality: "",
    religion: "",
    email: "",
    phone: "",
    mobile: "",
    skype: "",
    bestTime: "",
    street: "",
    number: "",
    postalCode: "",
    city: "",
    country: "",
    fatherProfession: "",
    motherProfession: "",
    brothers: "",
    sisters: "",
    hobbies: "",
    canYou: "",
    driversLicense: "no",
    educationLevel: "",
    profession: "",
    languages: "",
    auPairBefore: "no",
    childcareExperience: [] as string[],
    householdTasks: [] as string[],
    earliestStart: "",
    latestStart: "",
    duration: "",
    placementCity: "",
    placementArea: "",
    motivation: ""
  });

  // Pre-fill user info from DB
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const { user } = await res.json();
          if (user) {
            // Flatten nested profile and address data
            const profile = user.profile || {};
            const address = profile.address || {};
            
            setFormData(prev => ({
              ...prev,
              email: user.email || prev.email,
              firstName: user.fullName?.split(" ")[0] || prev.firstName,
              lastName: user.fullName?.split(" ").slice(1).join(" ") || prev.lastName,
              // Map profile fields
              sex: profile.sex || prev.sex,
              nationality: profile.nationality || prev.nationality,
              religion: profile.religion || prev.religion,
              phone: profile.phone || prev.phone,
              mobile: profile.mobile || prev.mobile,
              skype: profile.skype || prev.skype,
              bestTime: profile.bestTime || prev.bestTime,
              // Map address fields (flattened)
              street: address.street || prev.street,
              number: address.number || prev.number,
              postalCode: address.postalCode || prev.postalCode,
              city: address.city || prev.city,
              country: address.country || prev.country,
              // Other fields
              fatherProfession: profile.fatherProfession || prev.fatherProfession,
              motherProfession: profile.motherProfession || prev.motherProfession,
              brothers: profile.brothers || prev.brothers,
              sisters: profile.sisters || prev.sisters,
              hobbies: profile.hobbies || prev.hobbies,
              educationLevel: profile.educationLevel || prev.educationLevel,
              languages: profile.languages || prev.languages,
              childcareExperience: profile.childcareExperience || prev.childcareExperience,
              householdTasks: profile.householdTasks || prev.householdTasks,
              motivation: profile.motivation || prev.motivation,
              // Format date
              dob: profile.dob ? new Date(profile.dob).toISOString().split('T')[0] : prev.dob,
            }));
          }
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };
    fetchUserData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, group: 'childcareExperience' | 'householdTasks') => {
    const { value, checked } = e.target;
    setFormData(prev => {
      const current = prev[group];
      if (checked) {
        return { ...prev, [group]: [...current, value] };
      } else {
        return { ...prev, [group]: current.filter(item => item !== value) };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
        const response = await fetch('/api/user/profile/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update profile');
        }
        
        setSuccess(true);
        if (onSuccess) onSuccess();
    } catch (error: any) {
        console.error(error);
        alert(error.message || "Something went wrong while saving your profile.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="w-full">
         <AnimatePresence mode="wait">
            {success ? (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="bg-white rounded-[3rem] p-16 text-center shadow-2xl border border-[#00C896]/20 max-w-2xl mx-auto"
               >
                  <div className="w-24 h-24 bg-[#00C896]/10 text-[#00C896] rounded-full flex items-center justify-center mx-auto mb-8">
                     <CheckCircle2 size={48} />
                  </div>
                  <h2 className="text-4xl font-black text-slate-900 mb-4">Profile Saved!</h2>
                  <p className="text-lg text-slate-500 max-w-md mx-auto mb-10">
                     Your information has been securely saved. You are now ready for the final step.
                  </p>
                  <button onClick={() => window.location.href = "/submit-documents"} className="bg-slate-900 text-white px-10 py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-[#E31B23] transition-colors inline-flex items-center gap-2">
                     Next: Documents <ArrowRight size={16} />
                  </button>
               </motion.div>
            ) : (
               <motion.div 
                 initial={{ opacity: 0, y: 30 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col lg:flex-row min-h-[800px]"
               >
                  {/* Left Side: Visual/Summary */}
                  <div className="w-full lg:w-1/3 bg-slate-900 text-white p-10 lg:p-14 flex flex-col relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-80 h-80 bg-[#E31B23] rounded-full blur-[120px] opacity-20 pointer-events-none" />
                     <div className="relative z-10">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/10">
                           <UserIcon className="text-[#E31B23]" size={32} />
                        </div>
                        <h2 className="text-3xl font-black mb-4 leading-tight">Student Information</h2>
                        <p className="text-slate-400 font-medium leading-relaxed mb-12 text-sm">
                           Please provide accurate details. This information will be used for matching you with potential hosts.
                        </p>
                        <div className="space-y-6">
                           <div className="flex items-start gap-4">
                              <div className="w-8 h-8 rounded-full bg-[#E31B23]/20 flex items-center justify-center flex-shrink-0 mt-1">
                                 <span className="text-[#E31B23] font-bold text-xs">01</span>
                              </div>
                              <div>
                                 <h4 className="font-bold text-sm mb-1">Personal & Contact</h4>
                                 <p className="text-[10px] text-slate-500">Your basic information.</p>
                              </div>
                           </div>
                           <div className="flex items-start gap-4">
                              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0 mt-1">
                                 <span className="text-slate-500 font-bold text-xs">02</span>
                              </div>
                              <div>
                                 <h4 className="font-bold text-sm mb-1 text-slate-400">Education & Family</h4>
                                 <p className="text-[10px] text-slate-600">Background details.</p>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Right Side: Form Inputs */}
                  <div className="w-full lg:w-2/3 bg-white p-8 md:p-14 lg:p-20">
                     <form onSubmit={handleSubmit} className="space-y-12">
                        <div className="space-y-6">
                           <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                              <UserIcon className="text-[#E31B23]" size={24} />
                              <h3 className="text-xl font-black text-slate-900">General & Contact</h3>
                           </div>
                           <div className="grid md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">First Name</label>
                                 <input name="firstName" required value={formData.firstName} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E31B23]" />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Last Name</label>
                                 <input name="lastName" required value={formData.lastName} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E31B23]" />
                              </div>
                           </div>
                           <div className="grid md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Sex</label>
                                 <select name="sex" value={formData.sex} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E31B23]">
                                    <option value="">Select...</option>
                                    <option value="female">Female</option>
                                    <option value="male">Male</option>
                                    <option value="other">Other</option>
                                 </select>
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Date of Birth</label>
                                 <input type="date" name="dob" required value={formData.dob} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E31B23]" />
                              </div>
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Email</label>
                              <input name="email" type="email" required value={formData.email} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E31B23]" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Full Address</label>
                              <div className="grid grid-cols-6 gap-3">
                                <input placeholder="Street" name="street" value={formData.street} onChange={handleInputChange} className="col-span-4 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E31B23]" />
                                <input placeholder="No." name="number" value={formData.number} onChange={handleInputChange} className="col-span-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E31B23]" />
                              </div>
                              <div className="grid grid-cols-2 gap-3 mt-2">
                                <input placeholder="City" name="city" value={formData.city} onChange={handleInputChange} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E31B23]" />
                                <input placeholder="Country" name="country" value={formData.country} onChange={handleInputChange} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E31B23]" />
                              </div>
                           </div>
                        </div>

                        <div className="space-y-6">
                           <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                              <Home className="text-[#E31B23]" size={24} />
                              <h3 className="text-xl font-black text-slate-900">Family & Education</h3>
                           </div>
                           <div className="grid md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Education Level</label>
                                 <select name="educationLevel" value={formData.educationLevel} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E31B23]">
                                    <option value="">Select...</option>
                                    <option value="highschool">High School</option>
                                    <option value="university">University</option>
                                    <option value="vocational">Vocational Training</option>
                                 </select>
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Languages Spoken</label>
                                 <input name="languages" placeholder="e.g. English, German" value={formData.languages} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E31B23]" />
                              </div>
                           </div>
                        </div>

                        <div className="space-y-6">
                           <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                              <Baby className="text-[#E31B23]" size={24} />
                              <h3 className="text-xl font-black text-slate-900">Experience & Skills</h3>
                           </div>
                           <div className="space-y-4">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Experience with Children (Age Groups)</label>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                 {['0-1 years', '1-3 years', '3-5 years', '5-12 years', '12-18 years'].map((age) => (
                                    <label key={age} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${formData.childcareExperience.includes(age) ? 'bg-[#E31B23]/5 border-[#E31B23] text-[#E31B23]' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                                       <input type="checkbox" value={age} checked={formData.childcareExperience.includes(age)} onChange={(e) => handleCheckboxChange(e, 'childcareExperience')} className="hidden" />
                                       <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.childcareExperience.includes(age) ? 'border-[#E31B23] bg-[#E31B23]' : 'border-slate-300'}`}>
                                          {formData.childcareExperience.includes(age) && <CheckCircle2 size={10} className="text-white" />}
                                       </div>
                                       <span className="text-xs font-bold">{age}</span>
                                    </label>
                                 ))}
                              </div>
                           </div>
                        </div>

                        <div className="pt-6">
                           <button type="submit" disabled={loading} className="w-full bg-[#E31B23] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.25em] shadow-xl shadow-red-200 hover:shadow-2xl hover:bg-red-700 transition-all flex items-center justify-center gap-3 active:scale-[0.98]">
                              {loading ? <Loader2 className="animate-spin" /> : <>Save & Continue <ArrowRight size={16} /></>}
                           </button>
                        </div>
                     </form>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>
    </div>
  );
}
