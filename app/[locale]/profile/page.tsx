"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Loader2, Mail, Phone, School, MapPin, 
  Activity, User, Edit3, Save, X, Lock, Eye, EyeOff,
  ChevronLeft, ShieldCheck, Star
} from "lucide-react";
import { Link } from "@/navigation";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [userData, setUserData] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [userApps, setUserApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Edit States
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    city: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.replace("/sign-in");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/user/dashboard");
        if (res.ok) {
          const data = await res.json();
          setUserData(data.user);
          setActivities(data.activity || []);
          setUserApps(data.applications || []);
          
          setEditForm({
            fullName: data.user.fullName || "",
            email: data.user.email || "",
            city: data.user.profile?.address?.city || "",
            password: "",
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [status, session, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/user/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      const result = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
        setUserData({
            ...userData,
            fullName: editForm.fullName,
            email: editForm.email,
            profile: {
                ...userData.profile,
                address: {
                    ...userData.profile?.address,
                    city: editForm.city
                }
            }
        });
        setIsEditing(false);
        setEditForm(prev => ({ ...prev, password: "" }));
      } else {
        setMessage({ type: "error", text: result.error || "Failed to update profile" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "An error occurred." });
    } finally {
      setUpdating(false);
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-dvh flex items-center justify-center" style={{ background: 'var(--bg)' }}> 
        <div className="ios-spinner" /> 
      </div>
    );
  }

  if (!userData) return null;

  return (
    <div className="page">
      <div className="page-inner space-y-6"> 
        
        {/* Header */}
        <div className="pt-2 flex justify-between items-start"> 
          <div>
            <h1 className="t-large-title">Профайл</h1> 
            <p className="t-subhead mt-1" style={{ color: 'var(--label2)' }}>Таны мэдээлэл</p> 
          </div>
          <Link href="/dashboard" className="icon-box-sm" style={{ background: 'var(--bg)' }}>
             <ChevronLeft size={20} style={{ color: 'var(--label2)' }} />
          </Link>
        </div> 

        {message.text && (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="card p-4 text-center"
                style={{ background: message.type === 'success' ? 'var(--emerald-dim)' : 'var(--red-dim)', color: message.type === 'success' ? 'var(--emerald)' : 'var(--red)' }}
            >
                <p className="t-caption font-bold">{message.text}</p>
            </motion.div>
        )}

        {/* PROFILE CARD */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
           <div className="card p-6">
              {isEditing ? (
                 <form onSubmit={handleUpdateProfile} className="space-y-5">
                    <div className="flex flex-col items-center mb-6">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4" style={{ background: 'var(--bg)' }}>
                            <User size={32} />
                        </div>
                        <h3 className="t-headline">Засварлах</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="input-group">
                            <div className="relative group border-b" style={{ borderColor: 'var(--label4)' }}>
                                <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--label3)' }}>
                                    <User size={16} />
                                </div>
                                <input 
                                    type="text" 
                                    value={editForm.fullName}
                                    onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                                    className="w-full bg-transparent py-4 pl-12 pr-4 t-body outline-none"
                                    placeholder="Full Name"
                                    required
                                />
                            </div>
                            
                            <div className="relative group border-b" style={{ borderColor: 'var(--label4)' }}>
                                <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--label3)' }}>
                                    <Mail size={16} />
                                </div>
                                <input 
                                    type="email" 
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                                    className="w-full bg-transparent py-4 pl-12 pr-4 t-body outline-none"
                                    placeholder="Email"
                                    required
                                />
                            </div>

                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--label3)' }}>
                                    <MapPin size={16} />
                                </div>
                                <input 
                                    type="text" 
                                    value={editForm.city}
                                    onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                                    className="w-full bg-transparent py-4 pl-12 pr-4 t-body outline-none"
                                    placeholder="City"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <p className="t-caption2 uppercase tracking-widest mb-2" style={{ color: 'var(--blue)' }}>Нууц үг солих (Сонголтоор)</p>
                            <div className="relative card !rounded-2xl overflow-hidden">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--label3)' }}>
                                    <Lock size={16} />
                                </div>
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    value={editForm.password}
                                    onChange={(e) => setEditForm({...editForm, password: e.target.value})}
                                    className="w-full bg-transparent py-4 pl-12 pr-12 t-body outline-none"
                                    placeholder="••••••••"
                                    minLength={6}
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2"
                                    style={{ color: 'var(--label3)' }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-4">
                        <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary btn-sm">Болих</button>
                        <button type="submit" disabled={updating} className="btn btn-primary btn-sm">
                            {updating ? <div className="ios-spinner !w-4 !h-4" /> : <Save size={16} />}
                            Хадгалах
                        </button>
                    </div>
                 </form>
              ) : (
                 <div className="flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-500/20" style={{ background: 'var(--blue)' }}>
                        <User size={32} />
                    </div>
                    <h2 className="t-headline !text-xl mb-1">{userData.fullName}</h2>
                    <div className="badge text-[10px] uppercase tracking-widest mb-8" style={{ background: 'var(--blue-dim)', color: 'var(--blue)' }}>
                        {userData.role.replace('_', ' ')}
                    </div>

                    <div className="w-full space-y-4">
                        <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: 'var(--bg)' }}>
                            <div className="icon-box-sm" style={{ background: 'white' }}>
                                <Mail size={16} style={{ color: 'var(--blue)' }} />
                            </div>
                            <div className="flex-1">
                                <p className="t-caption2 uppercase tracking-widest mb-0.5" style={{ color: 'var(--label3)' }}>Имэйл</p>
                                <p className="t-footnote font-bold truncate">{userData.email}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: 'var(--bg)' }}>
                            <div className="icon-box-sm" style={{ background: 'white' }}>
                                <Phone size={16} style={{ color: 'var(--blue)' }} />
                            </div>
                            <div className="flex-1">
                                <p className="t-caption2 uppercase tracking-widest mb-0.5" style={{ color: 'var(--label3)' }}>Утас</p>
                                <p className="t-footnote font-bold">{userData.phone || "Тохируулаагүй"}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: 'var(--bg)' }}>
                            <div className="icon-box-sm" style={{ background: 'white' }}>
                                <MapPin size={16} style={{ color: 'var(--blue)' }} />
                            </div>
                            <div className="flex-1">
                                <p className="t-caption2 uppercase tracking-widest mb-0.5" style={{ color: 'var(--label3)' }}>Байршил</p>
                                <p className="t-footnote font-bold">{userData.profile?.address?.city || "Тохируулаагүй"}</p>
                            </div>
                        </div>

                        <button onClick={() => setIsEditing(true)} className="btn btn-secondary btn-sm btn-full mt-4">
                            <Edit3 size={16} /> Мэдээлэл засах
                        </button>
                    </div>
                 </div>
              )}
           </div>

           {/* STATUS CARDS */}
           <div className="grid grid-cols-1 gap-4">
              <div className="card p-5">
                 <h3 className="t-headline mb-4 flex items-center gap-2">
                    <ShieldCheck size={18} style={{ color: 'var(--blue)' }} />
                    Хөтөлбөрийн төлөв
                 </h3>
                 {userApps.length === 0 ? (
                    <div className="text-center py-6">
                       <p className="t-footnote" style={{ color: 'var(--label3)' }}>Одоогоор өргөдөл байхгүй байна.</p>
                    </div>
                 ) : (
                    <div className="space-y-3">
                       {userApps.map((app: any, idx) => (
                          <div key={idx} className="flex justify-between items-center p-3 rounded-xl" style={{ background: 'var(--bg)' }}>
                             <span className="t-footnote font-bold">{app.programId}</span>
                             <span className="badge text-[9px] uppercase tracking-widest" style={{ background: 'var(--orange-dim)', color: 'var(--orange)' }}>
                                {app.status.replace('_', ' ')}
                             </span>
                          </div>
                       ))}
                    </div>
                 )}
              </div>

              <div className="card p-5">
                 <h3 className="t-headline mb-4 flex items-center gap-2">
                    <Activity size={18} style={{ color: 'var(--blue)' }} />
                    Сүүлийн үйл ажиллагаа
                 </h3>
                 {activities.length === 0 ? (
                    <div className="text-center py-6">
                       <p className="t-footnote" style={{ color: 'var(--label3)' }}>Түүх байхгүй байна.</p>
                    </div>
                 ) : (
                    <div className="space-y-6 pl-2 border-l" style={{ borderColor: 'var(--label4)' }}>
                       {activities.slice(0, 3).map((act: any, idx) => (
                          <div key={idx} className="relative pl-6">
                             <div className="absolute -left-[13px] top-1 w-2 h-2 rounded-full" style={{ background: 'var(--blue)' }} />
                             <p className="t-caption2 uppercase tracking-widest mb-0.5" style={{ color: 'var(--label3)' }}>{new Date(act.date).toLocaleDateString()}</p>
                             <p className="t-footnote font-bold">{act.title}</p>
                          </div>
                       ))}
                    </div>
                 )}
              </div>
           </div>
        </motion.div>

      </div>
    </div>
  );
}
