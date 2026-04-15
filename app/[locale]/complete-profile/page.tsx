"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, Phone, Lock, School, CheckSquare } from "lucide-react";

export default function CompleteProfilePage() {
  const router = useRouter();
  const { update } = useSession(); // useNextAuth update

  // Form State
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [affiliation, setAffiliation] = useState("");

  // UI State
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasPhone, setHasPhone] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  React.useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const res = await fetch("/api/user/dashboard");
        if (res.ok) {
          const data = await res.json();
          const u = data.user;
          if (u) {
            if (u.phone) { setPhone(u.phone); setHasPhone(true); }
            if (u.hasPassword) { setPassword("********"); setHasPassword(true); }
            if (u.affiliation && u.affiliation !== "None") setAffiliation(u.affiliation);
          }
        }
      } catch (e) {
      } finally {
        setInitialLoad(false);
      }
    };
    fetchProfileData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/user/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password, affiliation: affiliation || "None" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");

      // Force session update so middleware sees profileComplete=true
      await update();
      
      // Redirect to dashboard
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-inner flex flex-col justify-center min-h-[calc(100dvh-120px)]">
        
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8 space-y-8"
        >
          {/* Header */}
          <div className="text-center">
            <h1 className="t-large-title mb-2">
              Profile <span style={{ color: 'var(--blue)' }}>Complete</span>
            </h1>
            <p className="t-subhead" style={{ color: 'var(--label2)' }}>
              Таны мэдээлэл дутуу байна. Үргэлжлүүлэхийн тулд дараах мэдээллийг бөглөнө үү.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="input-group">
              {/* PHONE */}
              {!hasPhone && (
                <div className="relative group border-b" style={{ borderColor: 'var(--label4)' }}>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--label3)' }}>
                    <Phone size={18} />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Утасны дугаар"
                    className="w-full bg-transparent py-4 pl-12 pr-4 t-body outline-none"
                    required
                  />
                </div>
              )}

              {/* PASSWORD */}
              {!hasPassword && (
                <div className="relative group border-b" style={{ borderColor: 'var(--label4)' }}>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--label3)' }}>
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Нууц үг"
                    className="w-full bg-transparent py-4 pl-12 pr-4 t-body outline-none"
                    required
                  />
                </div>
              )}

              {/* AFFILIATION */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--label3)' }}>
                  <School size={18} />
                </div>
                <input
                  type="text"
                  value={affiliation}
                  onChange={(e) => setAffiliation(e.target.value)}
                  placeholder="Сургууль, байгууллага"
                  className="w-full bg-transparent py-4 pl-12 pr-4 t-body outline-none"
                  required
                />
              </div>
            </div>

            {/* ERROR MSG */}
            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="t-caption2 text-center p-3 rounded-xl" style={{ background: 'var(--red-dim)', color: 'var(--red)' }}>
                {error}
              </motion.p>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary btn-full mt-4"
            >
              {isLoading ? <div className="ios-spinner !w-5 !h-5" /> : (
                <>Үргэлжлүүлэх <ArrowRight size={18} /></>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
