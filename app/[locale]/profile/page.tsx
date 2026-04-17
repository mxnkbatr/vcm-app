"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Phone, MapPin, Edit3, Save, X,
  Lock, Eye, EyeOff, ChevronRight, ShieldCheck,
  ClipboardList, CheckCircle2, Camera
} from "lucide-react";
import { Link } from "@/navigation";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [userData, setUserData] = useState<any>(null);
  const [userApps, setUserApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: "", email: "", city: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) { router.replace("/sign-in"); return; }
    fetch("/api/user/dashboard")
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) return;
        setUserData(d.user);
        setUserApps(d.applications || []);
        setEditForm({ fullName: d.user.fullName || "", email: d.user.email || "", city: d.user.profile?.address?.city || "", password: "" });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [status, session, router]);

  const showToast = (ok: boolean, msg: string) => {
    setToast({ ok, msg });
    setTimeout(() => setToast(null), 2800);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await fetch("/api/user/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (res.ok) {
        setUserData((prev: any) => ({ ...prev, fullName: editForm.fullName, email: editForm.email }));
        setIsEditing(false);
        showToast(true, "Мэдээлэл амжилттай хадгалагдлаа");
      } else {
        showToast(false, data.error || "Алдаа гарлаа");
      }
    } catch {
      showToast(false, "Алдаа гарлаа");
    } finally {
      setUpdating(false);
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-dvh flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="ios-spinner" />
      </div>
    );
  }

  if (!userData) return null;

  const initials = (userData.fullName || "U").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="page">
      <div className="page-inner space-y-5 pb-10">

        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="fixed top-[calc(env(safe-area-inset-top,12px)+60px)] left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-2xl shadow-lg text-sm font-semibold"
              style={{ background: toast.ok ? "var(--emerald)" : "var(--red)", color: "white", whiteSpace: "nowrap" }}
            >
              {toast.msg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="pt-2">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--label3)" }}>
            Volunteer Center Mongolia
          </p>
          <h1 className="t-large-title">Профайл</h1>
        </div>

        {/* Avatar + Name card */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              <div
                className="w-[72px] h-[72px] rounded-full flex items-center justify-center text-white text-2xl font-black shadow-lg"
                style={{ background: "var(--blue)" }}
              >
                {initials}
              </div>
              <button
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center shadow"
                style={{ background: "var(--card)", border: "2px solid var(--bg)" }}
              >
                <Camera size={13} style={{ color: "var(--label2)" }} />
              </button>
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="t-title2 truncate">{userData.fullName}</h2>
              <span
                className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest"
                style={{ background: "var(--blue-dim)", color: "var(--blue)" }}
              >
                {userData.role === "guest" ? "Зочин" : userData.role}
              </span>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="icon-box-sm press"
              style={{ background: "var(--fill2)", color: "var(--label2)" }}
            >
              <Edit3 size={16} />
            </button>
          </div>
        </motion.div>

        {/* Info rows */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card p-2">
          {[
            { icon: <Mail size={16} />, label: "Имэйл", value: userData.email || "—", color: "var(--blue)" },
            { icon: <Phone size={16} />, label: "Утас", value: userData.phone || "Тохируулаагүй", color: "var(--emerald)" },
            { icon: <MapPin size={16} />, label: "Хот", value: userData.profile?.address?.city || "Тохируулаагүй", color: "var(--orange)" },
          ].map((row, i, arr) => (
            <React.Fragment key={row.label}>
              <div className="flex items-center gap-3 px-3 py-3.5">
                <div className="icon-box-sm" style={{ background: `${row.color}18`, color: row.color }}>
                  {row.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "var(--label3)" }}>{row.label}</p>
                  <p className="text-[14px] font-semibold truncate" style={{ color: "var(--label)" }}>{row.value}</p>
                </div>
              </div>
              {i < arr.length - 1 && <div className="h-px mx-3" style={{ background: "var(--sep)" }} />}
            </React.Fragment>
          ))}
        </motion.div>

        {/* Status */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 gap-3">
          <div className="card p-4 space-y-2">
            <div className="icon-box-sm" style={{ background: "var(--blue-dim)", color: "var(--blue)" }}>
              <ShieldCheck size={16} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--label3)" }}>Эрх</p>
              <p className="text-[15px] font-bold mt-0.5" style={{ color: "var(--label)" }}>
                {userData.role === "guest" ? "Зочин" : userData.role}
              </p>
            </div>
          </div>
          <div className="card p-4 space-y-2">
            <div className="icon-box-sm" style={{ background: "var(--emerald-dim)", color: "var(--emerald)" }}>
              <CheckCircle2 size={16} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--label3)" }}>Явц</p>
              <p className="text-[15px] font-bold mt-0.5" style={{ color: "var(--label)" }}>
                {userData.step && userData.step !== "-" ? userData.step : "Бүртгэл"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Applications */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <p className="sec-label mb-2">Миний өргөдлүүд</p>
          {userApps.length === 0 ? (
            <div
              className="card-sm p-6 flex flex-col items-center text-center gap-2 border border-dashed"
              style={{ borderColor: "var(--sep)", background: "transparent" }}
            >
              <div className="icon-box" style={{ background: "var(--fill2)", color: "var(--label3)" }}>
                <ClipboardList size={18} />
              </div>
              <p className="text-[13px]" style={{ color: "var(--label3)" }}>Одоогоор өргөдөл байхгүй</p>
            </div>
          ) : (
            <div className="card p-2 space-y-0">
              {userApps.map((app: any, i: number) => (
                <React.Fragment key={app._id || i}>
                  <div className="flex items-center gap-3 px-3 py-3">
                    <div className="icon-box-sm" style={{ background: "var(--blue-dim)", color: "var(--blue)" }}>
                      <ClipboardList size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold truncate" style={{ color: "var(--label)" }}>{app.programId}</p>
                      <p className="text-[11px]" style={{ color: "var(--label3)" }}>{new Date(app.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
                      style={{ background: "var(--orange-dim)", color: "var(--orange)" }}
                    >
                      {app.status || "Хүлээгдэж буй"}
                    </span>
                  </div>
                  {i < userApps.length - 1 && <div className="h-px mx-3" style={{ background: "var(--sep)" }} />}
                </React.Fragment>
              ))}
            </div>
          )}
        </motion.div>

      </div>

      {/* Edit Sheet */}
      <AnimatePresence>
        {isEditing && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-sm"
              onClick={() => setIsEditing(false)}
            />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[120] rounded-t-[32px] p-6 space-y-5"
              style={{
                background: "var(--card)",
                paddingBottom: "calc(env(safe-area-inset-bottom, 24px) + 24px)",
                maxHeight: "90dvh",
                overflowY: "auto",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="t-title2">Мэдээлэл засах</h2>
                <button onClick={() => setIsEditing(false)} className="icon-box-sm press" style={{ background: "var(--fill2)" }}>
                  <X size={18} style={{ color: "var(--label2)" }} />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="input-group">
                  <div className="input-row">
                    <User size={17} style={{ color: "var(--label3)", flexShrink: 0 }} />
                    <input
                      type="text" value={editForm.fullName}
                      onChange={e => setEditForm(p => ({ ...p, fullName: e.target.value }))}
                      placeholder="Нэр" required
                    />
                  </div>
                  <div className="input-row">
                    <Mail size={17} style={{ color: "var(--label3)", flexShrink: 0 }} />
                    <input
                      type="email" value={editForm.email}
                      onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))}
                      placeholder="Имэйл"
                    />
                  </div>
                  <div className="input-row">
                    <MapPin size={17} style={{ color: "var(--label3)", flexShrink: 0 }} />
                    <input
                      type="text" value={editForm.city}
                      onChange={e => setEditForm(p => ({ ...p, city: e.target.value }))}
                      placeholder="Хот"
                    />
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--label3)" }}>
                    Нууц үг солих (заавал биш)
                  </p>
                  <div className="input-group">
                    <div className="input-row">
                      <Lock size={17} style={{ color: "var(--label3)", flexShrink: 0 }} />
                      <input
                        type={showPw ? "text" : "password"}
                        value={editForm.password}
                        onChange={e => setEditForm(p => ({ ...p, password: e.target.value }))}
                        placeholder="Шинэ нууц үг"
                        minLength={8}
                      />
                      <button type="button" onClick={() => setShowPw(v => !v)} className="press">
                        {showPw ? <EyeOff size={17} style={{ color: "var(--label3)" }} /> : <Eye size={17} style={{ color: "var(--label3)" }} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary">Болих</button>
                  <button type="submit" disabled={updating} className="btn btn-primary">
                    {updating ? <span className="ios-spinner !w-4 !h-4" /> : <><Save size={15} /> Хадгалах</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
