"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "@/lib/hooks/useSession";
import { useDashboard } from "@/lib/hooks/useDashboard";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ProfileActivityHistory from "@/app/components/ProfileActivityHistory";
import VolunteerHoursRing from "@/app/components/VolunteerHoursRing";
import VolunteerIdQr from "@/app/components/VolunteerIdQr";
import {
  User, Mail, Phone, MapPin, Edit3, Save,
  Lock, Eye, EyeOff, ShieldCheck, Settings, Info,
} from "lucide-react";
import { hapticNotification } from "@/lib/haptics";
import { NotificationType } from "@capacitor/haptics";
import PremiumPageShell from "@/app/components/PremiumPageShell";
import IOSLargeTitle from "@/app/components/ui/IOSLargeTitle";
import { IOSList, IOSListRow } from "@/app/components/ui/IOSList";
import IOSSheet from "@/app/components/ui/IOSSheet";
import { signOutToSignIn } from "@/lib/auth-signout";
import { useLocale } from "next-intl";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const locale = useLocale();
  const { data: dash, loading } = useDashboard({ enabled: status === "authenticated" });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: "", email: "", city: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.replace("/sign-in");
  }, [status, session, router]);

  useEffect(() => {
    if (!dash?.user) return;
    setEditForm({
      fullName: dash.user.fullName || "",
      email: dash.user.email || "",
      city: dash.user.profile?.address?.city || "",
      password: "",
    });
  }, [dash?.user]);

  const userData = dash?.user;
  const activity = {
    applications: dash?.applications || [],
    purchases: dash?.purchases || [],
    lmsEnrollments: dash?.lmsEnrollments || [],
    enrolledLessons: dash?.enrolledLessons || [],
  };

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
        setIsEditing(false);
        void hapticNotification(NotificationType.Success);
        showToast(true, "Мэдээлэл амжилттай хадгалагдлаа");
      } else {
        void hapticNotification(NotificationType.Error);
        showToast(false, data.error || "Алдаа гарлаа");
      }
    } catch {
      void hapticNotification(NotificationType.Error);
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

  const initials = (userData.fullName || "U")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const volunteerHours =
    ((dash?.attendedEvents?.length || 0) * 4) + ((dash?.applications?.length || 0) * 2);

  return (
    <PremiumPageShell className="ios26-page">
      <div className="home-sections pb-6">
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="fixed top-[calc(env(safe-area-inset-top,12px)+52px)] left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-[14px] text-sm font-semibold text-white"
              style={{ background: toast.ok ? "var(--emerald)" : "var(--red)" }}
            >
              {toast.msg}
            </motion.div>
          )}
        </AnimatePresence>

        <IOSLargeTitle title="Профайл">
          <p className="ios-subhead mt-1">Таны VCM бүртгэл</p>
        </IOSLargeTitle>

        <div className="ios26-profile-hero">
          <div className="ios26-profile-hero__avatar">{initials}</div>
          <div className="min-w-0 flex-1">
            <p className="ios-title" style={{ fontSize: 22 }}>{userData.fullName}</p>
            <p className="ios-subhead mt-0.5">{userData.email || userData.phone || "—"}</p>
          </div>
          <button type="button" onClick={() => setIsEditing(true)} className="app-header__round press" aria-label="Засах">
            <Edit3 size={18} strokeWidth={1.75} />
          </button>
        </div>

        <VolunteerHoursRing hours={volunteerHours} locale={locale} />
        <VolunteerIdQr userId={String(userData._id)} name={userData.fullName} locale={locale} />

        <section>
          <VcmSectionHead title="Мэдээлэл" />
          <IOSList>
            <IOSListRow icon={<Mail size={16} strokeWidth={1.75} />} title="Имэйл" subtitle={userData.email || "—"} />
            <IOSListRow icon={<Phone size={16} strokeWidth={1.75} />} title="Утас" subtitle={userData.phone || "Тохируулаагүй"} />
            <IOSListRow
              icon={<MapPin size={16} strokeWidth={1.75} />}
              title="Хот"
              subtitle={userData.profile?.address?.city || "Тохируулаагүй"}
            />
            <IOSListRow
              icon={<ShieldCheck size={16} strokeWidth={1.75} />}
              title="Эрх"
              subtitle={userData.role === "guest" ? "Зочин" : userData.role}
            />
          </IOSList>
        </section>

        <section>
          <VcmSectionHead title="Тохиргоо" />
          <IOSList>
            <IOSListRow href="/settings" icon={<Settings size={16} strokeWidth={1.75} />} title="Тохиргоо" />
            <IOSListRow href="/about" icon={<Info size={16} strokeWidth={1.75} />} title="Тухай" />
          </IOSList>
        </section>

        <section>
          <VcmSectionHead title="Миний түүх" />
          <ProfileActivityHistory
            applications={activity.applications}
            purchases={activity.purchases}
            lmsEnrollments={activity.lmsEnrollments}
            enrolledLessons={activity.enrolledLessons}
            activeProgram={userData.program}
          />
        </section>

        <button
          type="button"
          onClick={() => void signOutToSignIn(locale)}
          className="ios-list w-full ios-list-row press justify-center"
          style={{ color: "var(--red)", fontWeight: 600 }}
        >
          Гарах
        </button>
      </div>

      <IOSSheet open={isEditing} title="Мэдээлэл засах" onClose={() => setIsEditing(false)}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="ios-list">
            <div className="ios-list-row">
              <User size={17} strokeWidth={1.75} style={{ color: "var(--label2)" }} />
              <input
                className="flex-1 bg-transparent outline-none text-[17px]"
                type="text"
                value={editForm.fullName}
                onChange={(e) => setEditForm((p) => ({ ...p, fullName: e.target.value }))}
                placeholder="Нэр"
                required
              />
            </div>
            <div className="ios-list-row">
              <Mail size={17} strokeWidth={1.75} style={{ color: "var(--label2)" }} />
              <input
                className="flex-1 bg-transparent outline-none text-[17px]"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="Имэйл"
              />
            </div>
            <div className="ios-list-row">
              <MapPin size={17} strokeWidth={1.75} style={{ color: "var(--label2)" }} />
              <input
                className="flex-1 bg-transparent outline-none text-[17px]"
                type="text"
                value={editForm.city}
                onChange={(e) => setEditForm((p) => ({ ...p, city: e.target.value }))}
                placeholder="Хот"
              />
            </div>
            <div className="ios-list-row">
              <Lock size={17} strokeWidth={1.75} style={{ color: "var(--label2)" }} />
              <input
                className="flex-1 bg-transparent outline-none text-[17px]"
                type={showPw ? "text" : "password"}
                value={editForm.password}
                onChange={(e) => setEditForm((p) => ({ ...p, password: e.target.value }))}
                placeholder="Шинэ нууц үг (заавал биш)"
                minLength={8}
              />
              <button type="button" onClick={() => setShowPw((v) => !v)} className="press" aria-label="Нууц үг харах">
                {showPw ? <EyeOff size={17} strokeWidth={1.75} /> : <Eye size={17} strokeWidth={1.75} />}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary">
              Болих
            </button>
            <button type="submit" disabled={updating} className="btn btn-primary inline-flex items-center justify-center gap-2">
              {updating ? <span className="ios-spinner !w-4 !h-4" /> : <><Save size={15} strokeWidth={1.75} /> Хадгалах</>}
            </button>
          </div>
        </form>
      </IOSSheet>
    </PremiumPageShell>
  );
}
