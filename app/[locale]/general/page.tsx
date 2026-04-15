"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Check, X, User, MessageCircle, AlertCircle, ShieldCheck, Mail, LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/navigation";

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
    if (!confirm(`Are you sure you want to ${action === 'accept' ? 'accept and recommend' : 'reject'} this application?`)) return;
    
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
      <div className="min-h-dvh flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="ios-spinner" />
      </div>
    );
  }

  const roleName = (session?.user as any)?.role?.replace('general_', '').toUpperCase() || "PROGRAM";

  return (
    <div className="page">
      <div className="page-inner space-y-8">
        <div className="flex flex-col gap-6">
          <div className="pt-2">
            <div className="flex items-center gap-2 mb-2">
               <ShieldCheck style={{ color: 'var(--blue)' }} size={16} />
               <span className="t-caption2 uppercase tracking-widest" style={{ color: 'var(--blue)' }}>{roleName} MANAGER</span>
            </div>
            <h1 className="t-large-title">Application Queue</h1>
            <p className="t-subhead mt-1" style={{ color: 'var(--label2)' }}>Review and recommend applicants.</p>
          </div>
          
          <Link href="/dashboard" className="btn btn-secondary btn-sm inline-flex">
              My Dashboard
          </Link>
        </div>

        {applications.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-12 text-center"
          >
            <div className="text-4xl mb-4">✅</div>
            <h3 className="t-headline mb-1">Queue Cleared!</h3>
            <p className="t-footnote" style={{ color: 'var(--label3)' }}>There are no pending applications.</p>
          </motion.div>
        ) : (
          <div className="space-y-6 stagger">
            {applications.map((app, idx) => (
              <motion.div
                key={app._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6 space-y-6"
              >
                <div className="flex items-center gap-4">
                  <div className="icon-box" style={{ background: 'var(--blue-dim)' }}>
                     <User size={24} style={{ color: 'var(--blue)' }} />
                  </div>
                  <div className="flex-1">
                     <h3 className="t-headline">{app.firstName} {app.lastName}</h3>
                     <div className="flex items-center gap-2 mt-0.5">
                         <span className="t-caption" style={{ color: 'var(--label3)' }}>{app.email}</span>
                         <span className="badge text-[9px] uppercase tracking-widest" style={{ background: 'var(--bg)', color: 'var(--blue)' }}>
                             {app.programId}
                         </span>
                     </div>
                  </div>
                  <div className="text-right">
                      <p className="t-caption2 uppercase tracking-widest" style={{ color: 'var(--label3)' }}>Submitted</p>
                      <p className="t-caption font-bold">{new Date(app.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl" style={{ background: 'var(--bg)' }}>
                    <div>
                        <p className="t-caption2 uppercase tracking-widest mb-0.5" style={{ color: 'var(--label3)' }}>Age</p>
                        <p className="t-footnote font-bold">{app.age} Years</p>
                    </div>
                    <div>
                        <p className="t-caption2 uppercase tracking-widest mb-0.5" style={{ color: 'var(--label3)' }}>Level</p>
                        <p className="t-footnote font-bold">Level {app.level}</p>
                    </div>
                    <div className="col-span-2">
                        <p className="t-caption2 uppercase tracking-widest mb-0.5" style={{ color: 'var(--label3)' }}>Contact</p>
                        <p className="t-footnote font-bold">{app.phone}</p>
                    </div>
                </div>

                <div className="card p-4 ring-1 ring-inset ring-black/5" style={{ background: 'var(--bg)' }}>
                  <h4 className="flex items-center gap-2 t-caption2 uppercase tracking-widest font-black mb-2" style={{ color: 'var(--blue)' }}>
                     <MessageCircle size={12} /> Statement
                  </h4>
                  <p className="t-footnote italic leading-relaxed" style={{ color: 'var(--label2)' }}>
                     &quot;{app.message || 'No statement provided.'}&quot;
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                   <button
                     onClick={() => handleAction(app._id, 'accept')}
                     className="btn btn-primary btn-sm"
                   >
                     <Check size={16} /> Accept
                   </button>
                   
                   <button
                     onClick={() => handleAction(app._id, 'reject')}
                     className="btn btn-secondary btn-sm"
                     style={{ color: 'var(--red)' }}
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
