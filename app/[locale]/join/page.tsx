"use client";

import React, { useState, useEffect } from "react";
import { Link, useRouter } from "@/navigation";
import {
  UserPlus,
  LogIn,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import BrandLogo from "@/app/components/BrandLogo";

export default function JoinPage() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const [selected, setSelected] = useState<"signup" | "signin">("signup");

  const handleContinue = () => {
    router.push(selected === "signup" ? "/sign-up" : "/sign-in");
  };

  return (
    <div className="page !pt-safe flex flex-col justify-center min-h-[100dvh] auth-screen relative overflow-hidden">
      <div className="page-inner space-y-10 py-8">
        <div className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto flex justify-center"
          >
            <BrandLogo size={88} priority />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="t-large-title"
          >
            {t("joinTitle")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="t-subhead"
            style={{ color: "var(--label2)" }}
          >
            {t("signupSubtitle")}
          </motion.p>
          <p className="t-caption" style={{ color: "var(--label3)" }}>
            {BRAND.tagline}
          </p>
        </div>

        <div className="space-y-3">
          {(
            [
              {
                id: "signup" as const,
                title: t("newMemberTitle"),
                desc: t("newMemberDesc"),
                Icon: UserPlus,
                badge: t("recommended"),
              },
              {
                id: "signin" as const,
                title: t("existingMemberTitle"),
                desc: t("existingMemberDesc"),
                Icon: LogIn,
              },
            ] as const
          ).map((opt, i) => (
            <motion.button
              key={opt.id}
              type="button"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => setSelected(opt.id)}
              className="card p-5 press flex items-center gap-4 w-full text-left relative"
              style={
                selected === opt.id
                  ? { boxShadow: "inset 0 0 0 2px var(--blue)" }
                  : undefined
              }
            >
              {"badge" in opt && opt.badge && (
                <span
                  className="absolute -top-2 right-5 badge text-[9px] uppercase tracking-wider"
                  style={{ background: "var(--blue)", color: "white" }}
                >
                  {opt.badge}
                </span>
              )}
              <div
                className="icon-box"
                style={{
                  background: selected === opt.id ? "var(--blue)" : "var(--blue-dim)",
                  color: selected === opt.id ? "white" : "var(--blue)",
                }}
              >
                <opt.Icon size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <h3 className="t-headline">{opt.title}</h3>
                  <div
                    className="w-5 h-5 rounded-full border flex items-center justify-center"
                    style={{
                      borderColor: selected === opt.id ? "var(--blue)" : "var(--label4)",
                      background: selected === opt.id ? "var(--blue)" : "transparent",
                    }}
                  >
                    {selected === opt.id && <CheckCircle2 size={12} className="text-white" />}
                  </div>
                </div>
                <p className="t-caption" style={{ color: "var(--label3)" }}>
                  {opt.desc}
                </p>
              </div>
            </motion.button>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={handleContinue} className="btn btn-primary btn-full py-4 text-sm">
            {selected === "signup" ? t("signUpButton") : t("signIn")}
            <ArrowRight size={18} />
          </button>
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="t-caption font-bold uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity"
            >
              {t("home")}
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
