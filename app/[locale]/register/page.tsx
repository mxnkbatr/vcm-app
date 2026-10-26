"use client";

import React, { useState } from "react";
import { Link } from "@/navigation";
import { UserPlus, LogIn, ArrowRight } from "lucide-react";
import AuthScreen from "@/app/components/auth/AuthScreen";

const OPTIONS = [
  {
    id: "new",
    title: "Шинэ гишүүн",
    desc: "Бүртгүүлж, хөтөлбөрт нэгдэнэ.",
    icon: UserPlus,
    href: "/sign-up",
    accent: "var(--blue)",
    accentBg: "var(--blue-dim)",
  },
  {
    id: "existing",
    title: "Гишүүн болсон",
    desc: "Имэйл болон нууц үгээр нэвтэрнэ.",
    icon: LogIn,
    href: "/sign-in",
    accent: "var(--emerald)",
    accentBg: "var(--emerald-dim)",
  },
] as const;

export default function RegisterPage() {
  const [selected, setSelected] = useState<(typeof OPTIONS)[number]["id"]>("new");
  const active = OPTIONS.find((o) => o.id === selected) ?? OPTIONS[0];

  return (
    <AuthScreen
      mode={selected === "new" ? "sign-up" : "sign-in"}
      title="VCM-д нэгдэх"
      eyebrow="Сайн дурын төв"
      subtitle="Та аль хувилбарыг сонгох вэ?"
      action={
        <Link href={active.href} className="btn btn-primary auth-cta flex items-center justify-center gap-2">
          {selected === "new" ? "Бүртгүүлэх" : "Нэвтрэх"}
          <ArrowRight size={16} strokeWidth={2.2} />
        </Link>
      }
    >
      <div className="auth-form">
        {OPTIONS.map((option) => {
          const isActive = selected === option.id;
          const Icon = option.icon;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setSelected(option.id)}
              className="auth-choice press"
              style={{
                background: isActive ? option.accentBg : "var(--fill3)",
                borderColor: isActive ? option.accent : "transparent",
              }}
            >
              <span
                className="auth-choice__icon"
                style={{
                  background: isActive ? option.accent : "var(--fill2)",
                  color: isActive ? "#fff" : "var(--label2)",
                }}
              >
                <Icon size={20} strokeWidth={1.85} />
              </span>
              <span className="auth-choice__text">
                <strong>{option.title}</strong>
                <span>{option.desc}</span>
              </span>
              <span
                className="auth-choice__radio"
                style={{
                  borderColor: isActive ? option.accent : "var(--sep-opaque)",
                  background: isActive ? option.accent : "transparent",
                }}
              />
            </button>
          );
        })}
      </div>
    </AuthScreen>
  );
}
