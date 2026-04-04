"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Check, X, User, MessageCircle, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";

export default function GeneralDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations("dashboard");

  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    const role = (session?.user as any)?.role;
    if (!role || (!role.startsWith('general_') && role !== 'admin')) {
      router.replace("/dashboard");
      return;
    }

    fetchApplications();
  }, [status, session]);

  const fetchApplications = async () => {
    try {
      const res = await fetch("/api/general/applications");
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (appId: string, action: 'accept' | 'reject') => {
    try {
      const res = await fetch("/api/general/applications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: appId, action }),
      });
      if (res.ok) {
        setApplications(prev => prev.filter(app => app._id !== appId));
      }
    } catch (e) {
      console.error("Action error:", e);
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <Loader2 className="w-10 h-10 animate-spin text-[#E31B23]" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#FDFBF7] pt-28 pb-12 px-6 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Program Manager Queue</h1>
          <p className="text-slate-500 font-medium">Review and recommend applicants to the Admin for final approval.</p>
        </div>

        {applications.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
            <AlertCircle className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No pending applications</p>
          </div>
        ) : (
          <div className="grid gap-6 text-slate-900">
            {applications.map((app) => (
              <motion.div
                key={app._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] text-left flex flex-col md:flex-row gap-8 justify-between"
              >
                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <User size={16} className="text-[#E31B23]" />
                        <h3 className="text-xl font-black">{app.firstName} {app.lastName}</h3>
                      </div>
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                        {app.email} • {app.age} years old • Level {app.level}
                      </p>
                    </div>
                    <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-md text-[10px] uppercase font-black tracking-widest">
                      New Application
                    </span>
                  </div>

                  <div className="bg-[#FDFBF7] p-5 rounded-2xl border border-slate-100">
                    <h4 className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-black text-slate-400 mb-2">
                       <MessageCircle size={14} /> Letter to the General
                    </h4>
                    <p className="text-sm font-medium leading-relaxed italic text-slate-600">
                       "{app.message || 'No motivation provided.'}"
                    </p>
                  </div>
                </div>

                <div className="w-full md:w-64 shrink-0 flex flex-col justify-center gap-3">
                   <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 text-center mb-1">Action</p>
                   <button
                     onClick={() => handleAction(app._id, 'accept')}
                     className="w-full bg-[#E31B23] text-white py-4 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest hover:bg-red-700 transition"
                   >
                     <Check size={16} /> Accept & Recommend
                   </button>
                   <button
                     onClick={() => handleAction(app._id, 'reject')}
                     className="w-full bg-slate-100 text-slate-500 py-4 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition"
                   >
                     <X size={16} /> Reject
                   </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
