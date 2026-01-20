"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Calendar, FileText, Settings, Plus, Search, Edit3, 
  Trash2, Check, X, Clock, Bell, Upload, UserCheck, ClipboardList,
  LayoutDashboard, Loader2, Globe, ImageIcon,
  ChevronDown
} from "lucide-react";
import { 
  FaPlus, FaTrash, FaEdit, FaCalendarAlt, FaHandsHelping, 
  FaTimes, FaCloudUploadAlt, FaImage, FaSpinner 
} from "react-icons/fa";
import { useLanguage } from "../context/LanguageContext"; // Import useLanguage

// --- BRAND CONSTANTS ---
const BRAND = {
  RED: "#E31B23",
  GREEN: "#00C896",
  DARK: "#0F172A",
  LIGHT_BG: "#FAFAFA"
};

const COUNTRIES_TRANSLATIONS = [
  { en: "Germany", mn: "Герман" }, 
  { en: "Belgium", mn: "Бельги" }, 
  { en: "Austria", mn: "Австри" }, 
  { en: "Switzerland", mn: "Швейцар" }, 
  { en: "General", mn: "Ерөнхий" }
];
const STEPS_TRANSLATIONS = [
  { en: "Registration", mn: "Бүртгэл" }, 
  { en: "Documents", mn: "Бичиг баримт" }, 
  { en: "Interview", mn: "Ярилцлага" }, 
  { en: "Matching", mn: "Тааруулалт" }, 
  { en: "Visa Process", mn: "Визний үйл явц" }, 
  { en: "Departure", mn: "Хөдлөх" }
];
const ROLES_TRANSLATIONS = [
  { en: "Admin", mn: "Админ" }, 
  { en: "Student", mn: "Оюутан" }, 
  { en: "Guest", mn: "Зочин" }
];
const STATUSES_TRANSLATIONS = [
  { en: "Active", mn: "Идэвхтэй" }, 
  { en: "Pending", mn: "Хүлээгдэж байна" }, 
  { en: "Suspended", mn: "Түдгэлзүүлсэн" }
];

// --- REUSABLE COMPONENTS ---
const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 font-bold text-sm mb-1 ${active ? `bg-slate-900 text-white shadow-lg shadow-slate-200` : "text-slate-500 hover:bg-white hover:text-slate-900"}`}>
    <Icon size={18} className={active ? "text-[#E31B23]" : ""} /> {label}
  </button>
);

const StatCard = ({ label, val, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
    <div><p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">{label}</p><h3 className="text-3xl font-black text-slate-900">{val}</h3></div>
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg`} style={{ backgroundColor: color }}><Icon size={20} /></div>
  </div>
);

const Input = ({ label, value, onChange, type = "text", placeholder }: any) => (
    <div>
        <label className="block text-xs font-bold text-slate-500 mb-1">{label}</label>
        <input 
            type={type} 
            value={value} 
            onChange={(e) => onChange(e.target.value)} 
            required 
            placeholder={placeholder}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#E31B23] outline-none transition" 
        />
    </div>
);

const TextArea = ({ label, value, onChange }: any) => (
    <div>
        <label className="block text-xs font-bold text-slate-500 mb-1">{label}</label>
        <textarea 
            value={value} 
            onChange={(e) => onChange(e.target.value)} 
            required 
            rows={3} 
            className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#E31B23] outline-none transition" 
        />
    </div>
);

const TabButton = ({ active, onClick, icon: Icon, label }: any) => (
    <button type="button" onClick={onClick} className={`flex items-center gap-2 px-6 py-2 rounded-md whitespace-nowrap transition-all ${active ? "bg-white text-[#E31B23] shadow-sm font-bold" : "text-slate-500 hover:text-slate-700"}`}>
        <Icon /> {label}
    </button>
);

// --- MAIN PAGE ---
export default function AdminDashboard() {
  const { t, language } = useLanguage(); // Use Language Context
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [users, setUsers] = useState<any[]>([]); 
  const [blogs, setBlogs] = useState<any[]>([]); 
  const [bookings, setBookings] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  
  const [stats, setStats] = useState({
    activeStudents: 0,
    pendingApps: 0,
    articles: 0,
    todaysBookings: 0
  });

  const [isEditingUser, setIsEditingUser] = useState<string | null>(null);
  const [userForm, setUserForm] = useState<any>({});

  // 1. FETCH ALL DATA
  const refreshData = async () => {
    try {
      const [usersRes, newsRes, bookingsRes, appsRes, statsRes, eventsRes, oppsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/news'),
        fetch('/api/admin/bookings'),
        fetch('/api/admin/applications'),
        fetch('/api/admin/stats'),
        fetch('/api/admin/events'),
        fetch('/api/admin/opportunities')
      ]);

      if (usersRes.ok) {
          const data = await usersRes.json();
          // FIX: Add fallback for name
          setUsers(data.map((u: any) => ({
              id: u._id, 
              name: u.fullName || u.firstName || "Unknown User", // Fallback added here
              role: u.role ? (u.role.charAt(0).toUpperCase() + u.role.slice(1)) : "Guest", 
              email: u.email || "No Email",
              status: u.status ? (u.status.charAt(0).toUpperCase() + u.status.slice(1)) : "Active",
              country: u.country || "-", 
              step: u.step || "-"
          })));
      }

      if (newsRes.ok) setBlogs(await newsRes.json());
      
      if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json();
          setBookings(bookingsData.map((b: any) => ({
            id: b._id,
            user: b.name || "Unknown",
            type: b.serviceTitle,
            time: b.time,
            date: b.date,
            status: b.status
          })));
      }
      if (appsRes.ok) setApplications(await appsRes.json());
      if (eventsRes.ok) setEvents(await eventsRes.json());
      if (oppsRes.ok) setOpportunities(await oppsRes.json());
      
      if (statsRes.ok) {
          const s = await statsRes.json();
          setStats({
            activeStudents: s.totalUsers || 0,
            pendingApps: s.pendingBookings || 0,
            articles: s.blogsPublished || 0,
            todaysBookings: 0
          });
      }

    } catch (error) {
      console.error("Failed to load admin data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // --- HANDLERS ---
  const handleEditUser = (user: any) => {
    setIsEditingUser(user.id);
    setUserForm({ 
        ...user,
        role: user.role, 
        country: user.country === "-" ? COUNTRIES[0] : user.country,
        step: user.step === "-" ? STEPS[0] : user.step,
        status: user.status || "Active"
    });
  };

  const handleSaveUser = async () => {
    try {
        const res = await fetch('/api/admin/users', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: isEditingUser,
                action: 'update_user',
                data: {
                    fullName: userForm.name,
                    role: userForm.role.toLowerCase(), 
                    country: userForm.role === "Student" ? userForm.country : null,
                    step: userForm.role === "Student" ? userForm.step : "Registration",
                    status: userForm.status.toLowerCase()
                }
            })
        });

        if (!res.ok) throw new Error("Failed to save to DB");
        setIsEditingUser(null);
        refreshData();
    } catch (error) {
        console.error("Save failed:", error);
        alert("Failed to save changes.");
    }
  };

  const handleDeleteUser = async (id: any) => {
    if(confirm("Delete this user?")) {
      await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
      refreshData();
    }
  };

  const handleUpdateBooking = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: id, status })
      });
      if (res.ok) refreshData();
    } catch (e) {
      console.error("Failed to update booking", e);
    }
  };

  const handleUpdateApplication = async (id: string, status: string) => {
     try {
        const res = await fetch('/api/admin/applications', {
           method: 'PUT',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ applicationId: id, status })
        });
        if (res.ok) refreshData();
     } catch (e) {
        console.error("Failed to update app", e);
     }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex font-sans text-slate-900 selection:bg-[#E31B23] selection:text-white overflow-hidden">
      
      {/* ─── SIDEBAR ─── */}
      <aside className="w-72 bg-[#F5F5F5] h-screen sticky top-0 p-6 flex flex-col justify-between hidden lg:flex border-r border-slate-200">
        <div>
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-8 h-8 bg-[#E31B23] rounded-lg shadow-sm" />
            <span className="font-black text-xl tracking-tight">AuPair<span className="text-[#E31B23]">Admin</span></span>
          </div>
          <nav className="space-y-1">
            <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")} />
            <SidebarItem icon={Users} label="Members & Roles" active={activeTab === "users"} onClick={() => setActiveTab("users")} />
            <SidebarItem icon={ClipboardList} label="Applications" active={activeTab === "applications"} onClick={() => setActiveTab("applications")} />
            <SidebarItem icon={Calendar} label="Events & Jobs" active={activeTab === "events"} onClick={() => setActiveTab("events")} />
            <SidebarItem icon={FileText} label="Blog & Content" active={activeTab === "blog"} onClick={() => setActiveTab("blog")} />
          </nav>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
           <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold">A</div>
           <div>
              <p className="text-sm font-bold">Administrator</p>
              <p className="text-[10px] text-[#00C896] font-bold uppercase">Online</p>
           </div>
        </div>
      </aside>

      {/* ─── MAIN CONTENT ─── */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
           <div>
              <h1 className="text-3xl font-black text-slate-900 mb-1 capitalize tracking-tight">
                {activeTab === "blog" ? "Blog & Content Library" : activeTab}
              </h1>
              <p className="text-slate-400 text-sm font-bold">Overview and management.</p>
           </div>
           <div className="flex gap-4">
              <button className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#E31B23] hover:shadow-md transition-all relative">
                 <Bell size={18} />
                 <span className="absolute top-2 right-2 w-2 h-2 bg-[#E31B23] rounded-full border-2 border-white" />
              </button>
           </div>
        </header>

        {/* ─── DASHBOARD VIEW ─── */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Active Students" val={stats.activeStudents} icon={Users} color={BRAND.RED} />
                <StatCard label="Pending Applications" val={stats.pendingApps} icon={UserCheck} color={BRAND.GREEN} />
                <StatCard label="Articles" val={stats.articles} icon={FileText} color="#F59E0B" />
                <StatCard label="Today's Bookings" val={stats.todaysBookings} icon={Clock} color="#3B82F6" />
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                   <div className="flex justify-between items-center mb-6">
                      <h3 className="font-black text-lg text-slate-800">Booking Queue</h3>
                      <button onClick={() => setActiveTab("dashboard")} className="text-[10px] font-black bg-slate-50 px-3 py-1 rounded-lg uppercase text-slate-400">View All</button>
                   </div>
                   <div className="space-y-3">
                      {bookings.filter(b => b.status === 'pending').slice(0, 5).map((b) => (
                         <div key={b.id} className="flex items-center justify-between p-4 bg-[#FAFAFA] rounded-2xl border border-slate-50 hover:bg-white hover:shadow-md transition-all group">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 font-bold shadow-sm">{b.user.charAt(0)}</div>
                               <div>
                                  <p className="font-bold text-slate-900 text-sm">{b.user}</p>
                                  <p className="text-xs text-slate-400 font-medium">{b.type} • <span className="text-[#E31B23]">{b.time}</span></p>
                               </div>
                            </div>
                            <div className="flex gap-2">
                               <button onClick={() => handleUpdateBooking(b.id, 'confirmed')} className="p-2 rounded-xl bg-green-50 text-[#00C896] hover:bg-[#00C896] hover:text-white transition-colors"><Check size={16} /></button>
                               <button onClick={() => handleUpdateBooking(b.id, 'rejected')} className="p-2 rounded-xl bg-red-50 text-[#E31B23] hover:bg-[#E31B23] hover:text-white transition-colors"><X size={16} /></button>
                            </div>
                         </div>
                      ))}
                      {bookings.filter(b => b.status === 'pending').length === 0 && (
                        <p className="text-center py-10 text-slate-400 text-sm font-medium">No pending bookings.</p>
                      )}
                   </div>
                </div>

                <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 relative overflow-hidden flex flex-col justify-center">
                   <div className="absolute top-0 right-0 w-48 h-48 bg-[#E31B23] rounded-full blur-[90px] opacity-20" />
                   <h3 className="font-black text-lg mb-6 relative z-10">Quick Actions</h3>
                   <div className="space-y-3 relative z-10">
                      <button onClick={() => setActiveTab("blog")} className="w-full py-4 rounded-2xl bg-white/5 hover:bg-[#E31B23] text-sm font-bold flex items-center justify-center gap-2 transition-all border border-white/10">
                         <Plus size={16} /> Write Blog Post
                      </button>
                      <button onClick={() => setActiveTab("applications")} className="w-full py-4 rounded-2xl bg-white/5 hover:bg-[#00C896] text-sm font-bold flex items-center justify-center gap-2 transition-all border border-white/10">
                         <Users size={16} /> Verify New Users
                      </button>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* ─── APPLICATIONS MANAGEMENT ─── */}
        {activeTab === "applications" && (
           <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-50">
                 <h2 className="text-xl font-black text-slate-900">Program Applications</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                   <thead className="bg-[#FAFAFA] text-slate-400 text-[10px] uppercase font-black tracking-widest">
                      <tr>
                         <th className="px-8 py-4">Applicant</th>
                         <th className="px-8 py-4">Program</th>
                         <th className="px-8 py-4">Status</th>
                         <th className="px-8 py-4 text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {applications.map((app) => (
                         <tr key={app._id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-8 py-5 font-bold text-sm text-slate-900">{app.firstName} {app.lastName}</td>
                            <td className="px-8 py-5 text-sm">{app.programId}</td>
                            <td className="px-8 py-5"><span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${app.status === 'approved' ? 'bg-green-50 text-[#00C896]' : app.status === 'rejected' ? 'bg-red-50 text-[#E31B23]' : 'bg-amber-50 text-amber-500'}`}>{app.status}</span></td>
                            <td className="px-8 py-5 text-right">
                               {app.status === 'pending' && (
                                  <div className="flex justify-end gap-2">
                                     <button onClick={() => handleUpdateApplication(app._id, 'approved')} className="p-2 bg-green-50 text-[#00C896] hover:bg-[#00C896] hover:text-white rounded-xl transition-colors"><Check size={16}/></button>
                                     <button onClick={() => handleUpdateApplication(app._id, 'rejected')} className="p-2 bg-red-50 text-[#E31B23] hover:bg-[#E31B23] hover:text-white rounded-xl transition-colors"><X size={16}/></button>
                                  </div>
                               )}
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
              </div>
           </div>
        )}

        {/* ─── USERS MANAGEMENT ─── */}
        {activeTab === "users" && (
           <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                 <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="text" placeholder="Search members..." className="pl-12 pr-4 py-3 bg-[#FAFAFA] rounded-xl text-sm font-bold w-64 focus:outline-none focus:ring-2 focus:ring-[#E31B23]/20 transition-all" />
                 </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                   <thead className="bg-[#FAFAFA] text-slate-400 text-[10px] uppercase font-black tracking-widest">
                      <tr>
                         <th className="px-8 py-4">User</th>
                         <th className="px-8 py-4">Role</th>
                         <th className="px-8 py-4">Status</th>
                         <th className="px-8 py-4">Journey</th>
                         <th className="px-8 py-4 text-right">Edit</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {users.map((u) => (
                         <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-8 py-5">
                               <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm shadow-sm">
                                    {(u.name && u.name.length > 0) ? u.name.charAt(0) : "U"}
                                  </div>
                                  <div>
                                     <p className="font-bold text-sm text-slate-900">{u.name}</p>
                                     <p className="text-xs text-slate-400 font-medium">{u.email}</p>
                                  </div>
                               </div>
                            </td>
                            <td className="px-8 py-5"><span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${u.role === 'Admin' ? 'bg-slate-800 text-white' : u.role === 'Student' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>{u.role}</span></td>
                            <td className="px-8 py-5"><span className={`text-[10px] font-bold uppercase tracking-widest ${u.status === 'Active' ? 'text-[#00C896]' : u.status === 'Suspended' ? 'text-red-500' : 'text-amber-500'}`}>{u.status}</span></td>
                            <td className="px-8 py-5">
                               {u.role === 'Student' ? (
                                 <div className="flex items-center gap-4 text-xs font-medium text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                                    <div className="flex items-center gap-1.5 font-bold"><Globe size={14} className="text-[#00C896]"/> {u.country}</div>
                                    <div className="w-px h-3 bg-slate-300"/>
                                    <div className="flex items-center gap-1.5 font-bold"><Clock size={14} className="text-[#E31B23]"/> {u.step}</div>
                                 </div>
                               ) : <span className="text-slate-300 text-xs italic">N/A</span>}
                            </td>
                            <td className="px-8 py-5 text-right">
                               <button onClick={() => handleEditUser(u)} className="p-2 bg-slate-100 hover:bg-slate-900 hover:text-white rounded-lg transition-all"><Edit3 size={16} /></button>
                               <button onClick={() => handleDeleteUser(u.id)} className="p-2 text-slate-300 hover:text-[#E31B23] transition-colors ml-1"><Trash2 size={16} /></button>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
              </div>
           </div>
        )}

        {/* ─── EVENTS & JOBS MANAGEMENT ─── */}
        {activeTab === "events" && (
           <EventsManager 
              events={events} 
              opportunities={opportunities} 
              onRefresh={refreshData} 
           />
        )}

        {/* ─── CONTENT LIBRARY MANAGEMENT ─── */}
        {activeTab === "blog" && (
           <ContentManager 
              blogs={blogs} 
              onRefresh={refreshData} 
           />
        )}

        {/* --- USER EDIT MODAL --- */}
        <AnimatePresence>
          {isEditingUser !== null && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
               <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[2rem] w-full max-w-lg p-8 shadow-2xl border border-slate-100">
                  <div className="flex justify-between items-center mb-8">
                     <h3 className="text-2xl font-black">Edit Member</h3>
                     <button onClick={() => setIsEditingUser(null)} className="p-2 hover:bg-slate-50 rounded-full"><X size={20} /></button>
                  </div>
                  
                  <div className="space-y-6">
                     <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">User Role</label>
                        <div className="grid grid-cols-3 gap-3">
                           {ROLES.map(role => (
                              <button key={role} onClick={() => setUserForm({...userForm, role})}
                                className={`py-3 rounded-xl text-xs font-bold border-2 transition-all 
                                ${userForm.role === role 
                                  ? 'bg-slate-900 text-white border-slate-900 shadow-lg' 
                                  : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'}`}>
                                {role}
                              </button>
                           ))}
                        </div>
                     </div>

                     <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Account Status</label>
                        <div className="grid grid-cols-3 gap-3">
                           {STATUSES.map(status => (
                              <button key={status} onClick={() => setUserForm({...userForm, status})}
                                className={`py-3 rounded-xl text-xs font-bold border-2 transition-all 
                                ${userForm.status === status 
                                  ? 'bg-slate-900 text-white border-slate-900 shadow-lg' 
                                  : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'}`}>
                                {status}
                              </button>
                           ))}
                        </div>
                     </div>

                     {userForm.role === "Student" && (
                        <div className="space-y-4 bg-[#FAFAFA] p-5 rounded-2xl border border-slate-100">
                           <div>
                              <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Target Country</label>
                              <div className="relative">
                                <select value={userForm.country} onChange={e => setUserForm({...userForm, country: e.target.value})}
                                   className="w-full bg-white border-2 border-slate-200 rounded-xl p-3 text-sm font-bold outline-none focus:border-[#00C896] appearance-none">
                                   {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                              </div>
                           </div>
                           <div>
                              <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Progress Step</label>
                              <div className="relative">
                                <select value={userForm.step} onChange={e => setUserForm({...userForm, step: e.target.value})}
                                   className="w-full bg-white border-2 border-slate-200 rounded-xl p-3 text-sm font-bold outline-none focus:border-[#E31B23] appearance-none">
                                   {STEPS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                              </div>
                           </div>
                        </div>
                     )}
                  </div>

                  <button onClick={handleSaveUser} className="w-full bg-[#E31B23] text-white font-black py-4 rounded-xl mt-8 shadow-xl shadow-red-100 hover:bg-red-700 transition-all uppercase text-xs tracking-[0.2em] hover:-translate-y-1">
                     Save & Update DB
                  </button>
               </motion.div>
            </div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}

// --- NEW COMPONENT: EVENTS & JOBS MANAGER ---
function EventsManager({ events, opportunities, onRefresh }: any) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<"event" | "opportunity">("event");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    id: "",
    titleMn: "", titleEn: "",
    descMn: "", descEn: "",
    locationMn: "", locationEn: "",
    providerMn: "", providerEn: "", 
    date: "", 
    category: "workshop",
    type: "volunteer", 
    link: "#",
    imageUrl: "" 
  });

  const activeList = activeTab === "event" ? events : opportunities;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
    try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: data });
        const uploadedImage = await res.json();
        if (uploadedImage.secure_url) setFormData(prev => ({ ...prev, imageUrl: uploadedImage.secure_url }));
    } catch (err) { alert("Upload failed."); } 
    finally { setUploadingImage(false); }
  };

  const handleEdit = (item: any) => {
    if (activeTab === "event") {
        setFormData({
            id: item._id,
            titleMn: item.title?.mn || "",
            titleEn: item.title?.en || "",
            descMn: item.description?.mn || "",
            descEn: item.description?.en || "",
            locationMn: item.location?.mn || "",
            locationEn: item.location?.en || "",
            providerMn: "", providerEn: "",
            date: item.date ? new Date(item.date).toISOString().split('T')[0] : "",
            category: item.category || "workshop",
            type: "volunteer",
            link: "#",
            imageUrl: item.image || ""
        });
    } else {
        setFormData({
            id: item._id,
            titleMn: item.title?.mn || "",
            titleEn: item.title?.en || "",
            descMn: item.description?.mn || "",
            descEn: item.description?.en || "",
            locationMn: item.location?.mn || "",
            locationEn: item.location?.en || "",
            providerMn: item.provider?.mn || "",
            providerEn: item.provider?.en || "",
            date: item.deadline || "",
            category: "workshop",
            type: item.type || "volunteer",
            link: item.link || "#",
            imageUrl: item.image || ""
        });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    setLoading(true);
    try {
        const url = activeTab === "event" ? `/api/admin/events?id=${id}` : `/api/admin/opportunities?id=${id}`;
        await fetch(url, { method: "DELETE" });
        onRefresh();
    } catch (e) { alert("Delete failed"); } 
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id && !formData.imageUrl) {
        alert("Please upload a cover image first.");
        return;
    }
    setLoading(true);
    try {
        const url = activeTab === "event" ? "/api/admin/events" : "/api/admin/opportunities";
        const method = formData.id ? "PUT" : "POST";
        
        let body: any;
        if (activeTab === "event") {
            body = {
                id: formData.id,
                title: { en: formData.titleEn, mn: formData.titleMn },
                description: { en: formData.descEn, mn: formData.descMn },
                date: formData.date,
                location: { en: formData.locationEn, mn: formData.locationMn },
                image: formData.imageUrl,
                category: formData.category,
                timeString: "All Day"
            };
        } else {
            body = {
                id: formData.id,
                type: formData.type,
                title: { en: formData.titleEn, mn: formData.titleMn },
                provider: { en: formData.providerEn, mn: formData.providerMn },
                location: { en: formData.locationEn, mn: formData.locationMn },
                description: { en: formData.descEn, mn: formData.descMn },
                deadline: formData.date,
                link: formData.link,
                image: formData.imageUrl
            };
        }

        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        
        if (res.ok) {
            setIsModalOpen(false);
            onRefresh();
        }
    } catch (e) { alert("Operation failed"); } 
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex bg-slate-100 p-1 rounded-lg">
            <TabButton active={activeTab === "event"} onClick={() => setActiveTab("event")} icon={FaCalendarAlt} label="Events" />
            <TabButton active={activeTab === "opportunity"} onClick={() => setActiveTab("opportunity")} icon={FaHandsHelping} label="Jobs & Opps" />
        </div>
        <button onClick={() => { setFormData({ id: "", titleMn: "", titleEn: "", descMn: "", descEn: "", locationMn: "", locationEn: "", providerMn: "", providerEn: "", date: "", category: "workshop", type: "volunteer", link: "#", imageUrl: "" }); setIsModalOpen(true); }} className="flex items-center gap-2 bg-[#E31B23] text-white px-6 py-2.5 rounded-lg font-bold shadow-lg">
            <FaPlus /> Post New {activeTab === "event" ? "Event" : "Opportunity"}
        </button>
      </div>

      <AnimatePresence>
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 className="text-xl font-bold">{formData.id ? "Edit Item" : "Create Item"}</h3>
                        <button onClick={() => setIsModalOpen(false)}><FaTimes /></button>
                    </div>
                    <div className="overflow-y-auto p-6 space-y-6">
                        <div className="col-span-2">
                            <h4 className="text-sm font-bold text-red-600 uppercase mb-2">1. Cover Image</h4>
                            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 transition-colors relative" onClick={() => fileInputRef.current?.click()}>
                                {uploadingImage ? <FaSpinner className="animate-spin text-3xl text-red-500" /> : formData.imageUrl ? <img src={formData.imageUrl} className="h-48 w-full object-cover rounded-lg" /> : <div className="py-4"><FaCloudUploadAlt className="text-4xl text-slate-400 mx-auto" /><p>Click to upload</p></div>}
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Title (MN)" value={formData.titleMn} onChange={(v:any) => setFormData({...formData, titleMn: v})} />
                            <Input label="Title (EN)" value={formData.titleEn} onChange={(v:any) => setFormData({...formData, titleEn: v})} />
                            {activeTab === "opportunity" && (
                                <>
                                    <Input label="Provider (MN)" value={formData.providerMn} onChange={(v:any) => setFormData({...formData, providerMn: v})} />
                                    <Input label="Provider (EN)" value={formData.providerEn} onChange={(v:any) => setFormData({...formData, providerEn: v})} />
                                    <Input label="Type (volunteer/internship/scholarship)" value={formData.type} onChange={(v:any) => setFormData({...formData, type: v})} />
                                    <Input label="External Link" value={formData.link} onChange={(v:any) => setFormData({...formData, link: v})} />
                                </>
                            )}
                            <Input label="Location (MN)" value={formData.locationMn} onChange={(v:any) => setFormData({...formData, locationMn: v})} />
                            <Input label="Location (EN)" value={formData.locationEn} onChange={(v:any) => setFormData({...formData, locationEn: v})} />
                            <Input type="date" label={activeTab === "event" ? "Event Date" : "Deadline"} value={formData.date} onChange={(v:any) => setFormData({...formData, date: v})} />
                            {activeTab === "event" && <Input label="Category" value={formData.category} onChange={(v:any) => setFormData({...formData, category: v})} />}
                        </div>
                        <TextArea label="Description (MN)" value={formData.descMn} onChange={(v:any) => setFormData({...formData, descMn: v})} />
                        <TextArea label="Description (EN)" value={formData.descEn} onChange={(v:any) => setFormData({...formData, descEn: v})} />
                    </div>
                    <div className="p-6 border-t flex justify-end gap-3">
                        <button onClick={() => setIsModalOpen(false)} className="px-6 py-2">Cancel</button>
                        <button onClick={handleSubmit} disabled={loading || uploadingImage} className="px-6 py-2 bg-[#E31B23] text-white rounded-lg">{loading ? "Saving..." : "Save Now"}</button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-sm uppercase">
                <tr><th className="p-4">Image</th><th className="p-4">Title</th><th className="p-4">Date/Deadline</th><th className="p-4 text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {activeList.map((item: any) => (
                    <tr key={item._id} className="hover:bg-slate-50">
                        <td className="p-4"><img src={item.image} className="w-12 h-12 object-cover rounded" /></td>
                        <td className="p-4 font-bold">{item.title?.en}</td>
                        <td className="p-4">{activeTab === "event" ? (item.date ? new Date(item.date).toLocaleDateString() : "-") : item.deadline}</td>
                        <td className="p-4 text-right">
                            <button onClick={() => handleEdit(item)} className="p-2 text-blue-500"><FaEdit /></button>
                            <button onClick={() => handleDelete(item._id)} className="p-2 text-red-500"><FaTrash /></button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}

// --- NEW COMPONENT: CONTENT MANAGER ---
function ContentManager({ blogs, onRefresh }: any) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    titleMn: "", titleEn: "",
    descMn: "", descEn: "",
    summaryMn: "", summaryEn: "",
    author: "Admin", 
    status: "published",
    imageUrl: "" 
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
    try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: data });
        const json = await res.json();
        if (json.secure_url) setFormData(prev => ({ ...prev, imageUrl: json.secure_url }));
    } catch (err) { alert("Image upload failed"); } 
    finally { setUploadingImage(false); }
  };

  const handleEdit = (item: any) => {
    setFormData({
        id: item._id,
        titleMn: item.title?.mn || "",
        titleEn: item.title?.en || "",
        descMn: item.content?.mn || "",
        descEn: item.content?.en || "",
        summaryMn: item.summary?.mn || "",
        summaryEn: item.summary?.en || "",
        author: item.author || "Admin",
        status: item.status || "published",
        imageUrl: item.image || ""
    });
    setIsCreating(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    setLoading(true);
    try {
        await fetch(`/api/admin/news?id=${id}`, { method: "DELETE" });
        onRefresh();
    } catch (e) { alert("Delete failed"); } 
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        const method = formData.id ? "PUT" : "POST";
        const body = {
            id: formData.id,
            title: { en: formData.titleEn, mn: formData.titleMn },
            content: { en: formData.descEn, mn: formData.descMn },
            summary: { en: formData.summaryEn, mn: formData.summaryMn },
            author: formData.author,
            status: formData.status,
            image: formData.imageUrl
        };

        const res = await fetch("/api/admin/news", {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (res.ok) {
            setIsCreating(false);
            onRefresh();
        }
    } catch (e) { alert("Save failed"); } 
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800">Articles & Content</h2>
        <button onClick={() => { setFormData({ id: "", titleMn: "", titleEn: "", descMn: "", descEn: "", summaryMn: "", summaryEn: "", author: "Admin", status: "published", imageUrl: "" }); setIsCreating(true); }} className="flex items-center gap-2 bg-[#E31B23] text-white px-6 py-2.5 rounded-lg font-bold shadow-lg">
            <FaPlus /> Add Content
        </button>
      </div>

      <AnimatePresence>
        {isCreating && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 className="text-xl font-bold">Manage Article</h3>
                        <button onClick={() => setIsCreating(false)}><FaTimes /></button>
                    </div>
                    <div className="overflow-y-auto p-6 space-y-6">
                        <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed rounded-xl p-4 flex items-center justify-center cursor-pointer hover:bg-slate-50">
                            {uploadingImage ? <FaSpinner className="animate-spin" /> : formData.imageUrl ? <img src={formData.imageUrl} className="h-32 object-cover rounded" /> : <div className="text-center"><FaImage className="text-2xl mx-auto" /><p>Upload Image</p></div>}
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Title (MN)" value={formData.titleMn} onChange={(v:any) => setFormData({...formData, titleMn: v})} />
                            <Input label="Title (EN)" value={formData.titleEn} onChange={(v:any) => setFormData({...formData, titleEn: v})} />
                            <Input label="Summary (MN)" value={formData.summaryMn} onChange={(v:any) => setFormData({...formData, summaryMn: v})} />
                            <Input label="Summary (EN)" value={formData.summaryEn} onChange={(v:any) => setFormData({...formData, summaryEn: v})} />
                        </div>
                        <TextArea label="Content (MN)" value={formData.descMn} onChange={(v:any) => setFormData({...formData, descMn: v})} />
                        <TextArea label="Content (EN)" value={formData.descEn} onChange={(v:any) => setFormData({...formData, descEn: v})} />
                    </div>
                    <div className="p-6 border-t flex justify-end gap-3">
                        <button onClick={() => setIsCreating(false)} className="px-6 py-2">Cancel</button>
                        <button onClick={handleSubmit} disabled={loading || uploadingImage} className="px-6 py-2 bg-[#E31B23] text-white rounded-lg">Save Article</button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-sm uppercase">
                <tr><th className="p-4">Media</th><th className="p-4">Title</th><th className="p-4 text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {blogs.map((item: any) => (
                    <tr key={item._id} className="hover:bg-slate-50">
                        <td className="p-4"><img src={item.image} className="w-12 h-12 object-cover rounded" /></td>
                        <td className="p-4 font-bold">{item.title?.en}</td>
                        <td className="p-4 text-right">
                            <button onClick={() => handleEdit(item)} className="p-2 text-blue-500"><FaEdit /></button>
                            <button onClick={() => handleDelete(item._id)} className="p-2 text-red-500"><FaTrash /></button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}