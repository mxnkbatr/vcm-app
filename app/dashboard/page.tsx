"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { 
  Trophy, Clock, Calendar, MapPin, ArrowUpRight, Activity, 
  CheckCircle2, Shield, Zap, MoreHorizontal, ChevronRight, Loader2,
  Settings, Plane, Globe, Star, BookOpen, AlertCircle,
  Sparkles,
  FileText,
  Send
} from "lucide-react";
import { motion } from "framer-motion";

// --- CONSTANTS ---
const BRAND = {
  RED: "#E31B23",
  GREEN: "#00C896",
  DARK: "#0F172A"
};

const STEPS = ["Registration", "Documents", "Interview", "Matching", "Visa Process", "Departure"];

// --- TYPES ---
interface UserData {
  _id: string;
  fullName: string;
  email: string;
  role: 'student' | 'guest' | 'admin';
  studentId?: string;
  country?: string;
  step?: string; // Current step name
  badges: string[];
  points: number;
}

interface ActivityLog {
  title: string;
  date: string;
  points: number;
  type: 'event' | 'doc' | 'system';
}

// --- COMPONENTS ---
const DashboardCard = ({ children, className = "", delay = 0 }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className={`relative bg-white border border-slate-100 rounded-[2.5rem] p-6 overflow-hidden shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_60px_-15px_rgba(227,27,35,0.1)] hover:border-slate-200 transition-all duration-500 group ${className}`}
  >
    {children}
  </motion.div>
);

export default function MemberDashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  
  const [userData, setUserData] = useState<UserData | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [userApps, setUserApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. FETCH DATA & HANDLE REDIRECTION
  useEffect(() => {
    const init = async () => {
      if (!isLoaded || !user) return;
      try {
        const [profileRes, appsRes] = await Promise.all([
          fetch(`/api/user/profile?clerkId=${user.id}`),
          fetch(`/api/user/applications`)
        ]);

        if (profileRes.ok) {
          const data = await profileRes.json();
          const userRole = data.user.role;

          if (userRole === 'admin') {
             router.replace('/admin');
             return;
          }

          setUserData(data.user);
          setActivities(data.activity || []);
        } else {
          setUserData({
            _id: "new",
            fullName: user.fullName || "Guest",
            email: user.primaryEmailAddress?.emailAddress || "",
            role: "guest",
            badges: [],
            points: 0
          });
        }

        if (appsRes.ok) {
           const appsData = await appsRes.json();
           setUserApps(appsData);
        }

      } catch (e) {
        console.error("Dashboard Error:", e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [isLoaded, user, router]);

  if (!isLoaded || loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#E31B23]" />
        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Loading Profile...</p>
      </div>
    </div>
  );

  if (!userData) return null; 

  // --- DERIVED STATE ---
  const isStudent = userData.role === 'student';
  const currentStepIndex = userData.step ? STEPS.indexOf(userData.step) : -1;
  const progressPercent = Math.max(5, ((currentStepIndex + 1) / STEPS.length) * 100);
  
  const pendingApp = userApps.find(a => a.status === 'pending');
  
  // Format Date Helper
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-900 selection:bg-[#E31B23] selection:text-white pt-28 pb-12 px-6">
      
      {/* ATMOSPHERE */}
      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#E31B23] rounded-full blur-[200px] opacity-[0.03]" />
         <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#00C896] rounded-full blur-[200px] opacity-[0.03]" />
         <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
           <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="flex items-center gap-3 mb-2">
                 <div className={`w-2 h-2 rounded-full animate-pulse shadow-[0_0_10px] ${isStudent ? 'bg-[#00C896] shadow-[#00C896]' : 'bg-slate-400 shadow-slate-400'}`} />
                 <p className={`text-[10px] font-black uppercase tracking-[0.25em] ${isStudent ? 'text-[#00C896]' : 'text-slate-400'}`}>
                    {isStudent ? 'ACTIVE STUDENT' : 'GUEST ACCOUNT'}
                 </p>
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none mb-1 text-slate-900">
                 Hello, <br/>
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E31B23] to-rose-400">
                    {userData.fullName}
                 </span>
              </h1>
           </motion.div>

           <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3">
              <Link href="/events" className="group relative px-8 py-4 rounded-2xl overflow-hidden transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 bg-[#E31B23]">
                 <span className="relative z-10 text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                    <Calendar size={14} /> Find Events
                 </span>
              </Link>
              <button className="p-4 border border-slate-200 bg-white text-slate-400 hover:text-slate-900 rounded-2xl transition-all active:scale-95">
                 <Settings size={18} />
              </button>
           </motion.div>
        </div>

        {/* --- GRID LAYOUT --- */}
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-4 gap-6">
           
           {/* 1. MAIN PROFILE CARD */}
           <DashboardCard className="md:col-span-3 lg:col-span-2 row-span-2 !p-0 border-t-4 border-t-[#E31B23]">
              <div className="relative h-full p-8 flex flex-col justify-between z-10">
                 
                 {/* Top Row */}
                 <div className="flex justify-between items-start">
                    <div className="flex items-center gap-6">
                       <div className="relative">
                          <div className="w-20 h-20 rounded-[1.5rem] p-1 shadow-xl bg-white ring-4 ring-slate-50 rotate-[-3deg]">
                             <Image src={user?.imageUrl || "/logo.jpg"} alt="User" width={80} height={80} className="rounded-[1.2rem] w-full h-full object-cover" />
                          </div>
                          {isStudent && (
                            <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1.5 shadow-lg border border-slate-100">
                               <Shield size={14} className="text-[#00C896] fill-[#00C896]/20" />
                            </div>
                          )}
                       </div>
                       <div>
                          <h2 className="text-xl font-black text-slate-900 mb-1">{userData.fullName}</h2>
                          {isStudent ? (
                             <p className="text-[10px] font-black uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-md text-slate-500 inline-block">
                               {userData.studentId || "NO-ID"}
                             </p>
                          ) : (
                             <Link href="/apply" className="text-[10px] font-bold text-[#E31B23] hover:underline flex items-center gap-1">
                                Complete Application <ArrowUpRight size={10} />
                             </Link>
                          )}
                       </div>
                    </div>
                    {isStudent && userData.country && (
                        <div className="text-right hidden sm:block">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Destination</p>
                            <div className="flex items-center justify-end gap-1.5 text-sm font-bold text-[#E31B23]">
                               <Plane size={14} /> {userData.country}
                            </div>
                        </div>
                    )}
                 </div>

                 {/* Middle: Progress Bar (Student Only) */}
                 {isStudent ? (
                    <div className="space-y-8 mt-12">
                       <div className="space-y-3">
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                             <span className="flex items-center gap-2">Current Step: <span className="text-white bg-slate-900 px-2 py-0.5 rounded ml-1">{userData.step || "Start"}</span></span>
                             <span className="text-[#E31B23]">{Math.round(progressPercent)}% Ready</span>
                          </div>
                          
                          {/* Animated Bar */}
                          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden relative">
                             <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercent}%` }}
                                transition={{ duration: 1.5, ease: "circOut" }}
                                className="h-full bg-[#E31B23] relative overflow-hidden"
                             >
                                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[progress_1s_linear_infinite]" />
                             </motion.div>
                          </div>
                          
                          <div className="flex justify-between mt-2">
                             {STEPS.map((s, i) => (
                                <div key={s} className={`h-1.5 w-1.5 rounded-full ${i <= currentStepIndex ? 'bg-[#E31B23]' : 'bg-slate-200'}`} />
                             ))}
                          </div>
                       </div>
                    </div>
                 ) : (
                    // Guest View CTA
                    <div className="mt-10 p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center">
                       {pendingApp ? (
                          <>
                             <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Clock size={24} />
                             </div>
                             <h3 className="text-lg font-black text-slate-900 mb-1">Application Pending</h3>
                             <p className="text-xs text-slate-500 mb-4">You applied for <b>{pendingApp.programId}</b> on {formatDate(pendingApp.createdAt)}</p>
                             <div className="bg-amber-100 text-amber-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest inline-block">
                                Under Review
                             </div>
                          </>
                       ) : (
                          <>
                             <Sparkles size={24} className="text-[#E31B23] mx-auto mb-3" />
                             <h3 className="text-lg font-black text-slate-900 mb-2">Start Your Journey</h3>
                             <p className="text-sm text-slate-500 mb-4">You are currently a Guest. Apply now to become a Student and unlock full features.</p>
                             <Link href="/apply" className="inline-block bg-slate-900 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#E31B23] transition-colors">
                                Apply Now
                             </Link>
                          </>
                       )}
                    </div>
                 )}
              </div>
           </DashboardCard>

           {/* 2. NEXT ACTION / INFO */}
           <DashboardCard className="md:col-span-3 lg:col-span-2 !p-0 group relative overflow-hidden bg-slate-900" delay={0.1}>
              {/* Conditional Background Image based on Country */}
              <div className="absolute inset-0 z-0 opacity-40 group-hover:opacity-30 transition-opacity duration-500">
                 {userData.country === "Germany" && <Image src="https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=800&q=80" alt="Germany" fill className="object-cover" />}
                 {userData.country === "Belgium" && <Image src="https://images.unsplash.com/photo-1572084682035-c54363297371?auto=format&fit=crop&w=800&q=80" alt="Belgium" fill className="object-cover" />}
                 {!userData.country && <Image src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80" alt="Travel" fill className="object-cover" />}
              </div>
              
              <div className="relative z-10 h-full p-8 flex flex-col justify-between text-white">
                 <div className="flex justify-between items-center">
                    <span className="bg-[#E31B23] text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-md shadow-lg">
                       {isStudent ? "Next Step" : (pendingApp ? "Application Status" : "Program Info")}
                    </span>
                    <Globe size={18} className="opacity-80" />
                 </div>
                 
                 <div>
                    <h3 className="text-3xl font-black tracking-tight leading-none mb-3">
                       {isStudent 
                         ? (userData.step === "Registration" ? "Upload Docs" : (userData.step === "Documents" ? "Schedule Interview" : userData.step)) 
                         : (pendingApp ? "Reviewing Profile" : "Explore Europe")}
                    </h3>
                    <p className="text-xs font-bold text-slate-300 opacity-90 max-w-xs leading-relaxed">
                       {isStudent 
                         ? "Please complete your current stage requirements to proceed to the next level."
                         : (pendingApp ? "Our team is currently reviewing your application for the Au Pair program." : "Discover our Au Pair programs in Germany, Belgium, and more.")}
                    </p>
                 </div>
                 
                 {isStudent && (
                    <button className="mt-6 w-full py-3 bg-white/10 backdrop-blur border border-white/20 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all flex items-center justify-center gap-2">
                       View Requirements <ArrowUpRight size={14} />
                    </button>
                 )}
              </div>
           </DashboardCard>

           {/* 3. GAMIFICATION STATS (Student) / BENEFITS (Guest) */}
           {isStudent ? (
             <>
               <DashboardCard className="md:col-span-2 lg:col-span-1 flex flex-col justify-between group hover:-translate-y-1" delay={0.2}>
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 transition-transform group-hover:scale-110">
                     <Trophy size={24} />
                  </div>
                  <div className="mt-6">
                     <h4 className="text-4xl font-black text-slate-900">#{userData.points || 0}</h4>
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">XP Points</p>
                  </div>
               </DashboardCard>

               <DashboardCard className="md:col-span-2 lg:col-span-1 flex flex-col justify-between group hover:-translate-y-1" delay={0.3}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 bg-emerald-50 text-[#00C896]">
                     <CheckCircle2 size={24} />
                  </div>
                  <div className="mt-6">
                     <h4 className="text-4xl font-black text-slate-900">{userData.badges.length || 0}</h4>
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Badges Earned</p>
                  </div>
               </DashboardCard>
             </>
           ) : (
             <DashboardCard className="md:col-span-4 lg:col-span-2 bg-[#F0FDFA] border-emerald-100 flex items-center justify-between" delay={0.2}>
                <div>
                   <h3 className="font-black text-xl text-[#00C896] mb-2">Why Become a Member?</h3>
                   <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-xs font-bold text-slate-600"><CheckCircle2 size={14} className="text-[#00C896]" /> Full Process Tracking</li>
                      <li className="flex items-center gap-2 text-xs font-bold text-slate-600"><CheckCircle2 size={14} className="text-[#00C896]" /> Exclusive Events Access</li>
                      <li className="flex items-center gap-2 text-xs font-bold text-slate-600"><CheckCircle2 size={14} className="text-[#00C896]" /> Direct Agency Support</li>
                   </ul>
                </div>
                <Shield size={64} className="text-[#00C896] opacity-20" />
             </DashboardCard>
           )}

           {/* 4. ACTIVITY / NOTIFICATIONS */}
           <DashboardCard className="md:col-span-2 lg:col-span-2 row-span-2 !p-0" delay={0.4}>
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <h3 className="font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 text-slate-900">
                    <Activity size={14} className="text-[#E31B23]" /> History
                 </h3>
                 < MoreHorizontal size={16} className="text-slate-400 cursor-pointer hover:text-slate-900" />
              </div>
              
              <div className="p-4 space-y-2 h-[200px] overflow-y-auto custom-scrollbar">
                 {activities.length > 0 ? activities.map((act, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-3xl transition-all cursor-default hover:bg-slate-50 group">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors bg-white border border-slate-100 shadow-sm text-slate-500 group-hover:text-[#E31B23] group-hover:border-red-100`}>
                            {act.type === 'event' ? <Calendar size={16}/> : <FileText
                            
                            size={16}/>}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold truncate text-slate-900">{act.title}</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{formatDate(act.date)}</p>
                        </div>
                        <span className="text-[10px] font-black px-3 py-1.5 rounded-full bg-emerald-50 text-[#00C896]">
                            +{act.points}
                        </span>
                    </div>
                 )) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                       <AlertCircle size={32} className="mb-2" />
                       <p className="text-xs font-bold uppercase tracking-wide">No Recent Activity</p>
                    </div>
                 )}
              </div>
           </DashboardCard>

           {/* 5. HELPFUL LINKS (For Students) */}
           {isStudent && (
             <DashboardCard className="md:col-span-4 lg:col-span-2 !p-0 overflow-hidden bg-[#FFF5F5] border-red-100" delay={0.5}>
                <div className="p-8 h-full flex flex-col justify-center relative">
                   <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-white to-transparent opacity-50" />
                   <h3 className="font-black text-xl text-[#E31B23] mb-4">Study Material</h3>
                   <div className="grid grid-cols-2 gap-4 relative z-10">
                      <button className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-all text-left group">
                         <BookOpen size={20} className="text-slate-400 mb-2 group-hover:text-[#E31B23] transition-colors" />
                         <span className="text-xs font-bold text-slate-900 block">Language Tips</span>
                      </button>
                      <button className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-all text-left group">
                         <Globe size={20} className="text-slate-400 mb-2 group-hover:text-[#E31B23] transition-colors" />
                         <span className="text-xs font-bold text-slate-900 block">Culture Guide</span>
                      </button>
                   </div>
                </div>
             </DashboardCard>
           )}

        </div>
      </div>
    </div>
  );
}