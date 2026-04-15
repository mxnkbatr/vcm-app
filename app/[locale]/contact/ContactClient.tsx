"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  Mail,
  MapPin,
  Send,
  Loader2,
  CheckCircle2,
  ArrowRight,
  Copy
} from "lucide-react";
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";
import { useTranslations } from "next-intl";

export default function ContactClient() {
  const t = useTranslations("ContactPage");
  const [formState, setFormState] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const CONTACT_INFO = [
    {
      id: "phone",
      label: t("info.phone.label"),
      value: t("info.phone.value"),
      link: "tel:+97677116906",
      icon: Phone,
      color: "bg-red-50 text-[#E31B23]",
      border: "hover:border-[#E31B23]"
    },
    {
      id: "email",
      label: t("info.email.label"),
      value: t("info.email.value"),
      link: "mailto:info@mongolianaupair.com",
      icon: Mail,
      color: "bg-emerald-50 text-[#00C896]",
      border: "hover:border-[#00C896]"
    },
    {
      id: "address",
      label: t("info.address.label"),
      value: t("info.address.value"),
      link: "https://maps.google.com",
      icon: MapPin,
      color: "bg-slate-100 text-slate-700",
      border: "hover:border-slate-400"
    }
  ];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false);
    setSuccess(true);
  };

  return (
    <div className="page">
      <div className="page-inner space-y-8">

        {/* HEADER */}
        <div className="pt-2">
          <div className="badge mb-3" style={{ background: 'var(--blue-dim)', color: 'var(--blue)' }}>
            {t("badge")}
          </div>
          <h1 className="t-large-title">
            {t("heroTitle")} <span style={{ color: 'var(--blue)' }}>{t("heroTitleHighlight")}</span>
          </h1>
          <p className="t-subhead mt-2" style={{ color: 'var(--label2)' }}>
            {t("heroDesc")}
          </p>
        </div>

        {/* INFO CARDS */}
        <div className="space-y-4">
          {CONTACT_INFO.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card p-5 press"
              onClick={() => handleCopy(item.value, item.id)}
            >
              <div className="flex items-center gap-4">
                <div className="icon-box" style={{ background: 'var(--blue-dim)', color: 'var(--blue)' }}>
                  <item.icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="t-caption2 uppercase tracking-widest" style={{ color: 'var(--label3)' }}>{item.label}</p>
                  <h3 className="t-headline truncate">{item.value}</h3>
                </div>
                {copied === item.id ? (
                  <CheckCircle2 size={16} style={{ color: 'var(--green)' }} />
                ) : (
                  <Copy size={16} style={{ color: 'var(--label3)' }} />
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* FORM CARD */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-6 space-y-6"
        >
          <div>
            <h3 className="t-title3">{t("formTitle")}</h3>
            <p className="t-footnote" style={{ color: 'var(--label2)' }}>{t("formDesc")}</p>
          </div>

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8 space-y-4"
              >
                <div className="icon-box mx-auto" style={{ background: 'var(--blue-dim)', color: 'var(--blue)', width: 64, height: 64, borderRadius: 32 }}>
                  <CheckCircle2 size={32} />
                </div>
                <div>
                  <h4 className="t-headline">{t("successTitle")}</h4>
                  <p className="t-footnote">{t("successDesc")}</p>
                </div>
                <button onClick={() => setSuccess(false)} className="btn btn-ghost btn-sm">{t("sendAnother")}</button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="t-caption2 uppercase tracking-widest ml-1 mb-1.5 block">{t("labels.name")}</label>
                    <input
                      required
                      value={formState.name}
                      onChange={e => setFormState({ ...formState, name: e.target.value })}
                      className="input"
                      placeholder={t("placeholders.name")}
                    />
                  </div>
                  <div>
                    <label className="t-caption2 uppercase tracking-widest ml-1 mb-1.5 block">{t("labels.email")}</label>
                    <input
                      type="email"
                      required
                      value={formState.email}
                      onChange={e => setFormState({ ...formState, email: e.target.value })}
                      className="input"
                      placeholder={t("placeholders.email")}
                    />
                  </div>
                  <div>
                    <label className="t-caption2 uppercase tracking-widest ml-1 mb-1.5 block">{t("labels.message")}</label>
                    <textarea
                      required
                      rows={4}
                      value={formState.message}
                      onChange={e => setFormState({ ...formState, message: e.target.value })}
                      className="input"
                      style={{ borderRadius: 'var(--r-xl)' }}
                      placeholder={t("placeholders.message")}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-full"
                >
                  {loading ? <span className="ios-spinner" style={{ width: 22, height: 22, borderWidth: 2 }} /> : <>{t("buttons.send")} <Send size={16} className="ml-2" /></>}
                </button>
              </form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Social Proof */}
        <div className="card p-5 flex items-center justify-between">
          <div>
            <h4 className="t-headline">{t("followTitle")}</h4>
            <p className="t-caption2 uppercase tracking-widest">{t("followHandle")}</p>
          </div>
          <div className="flex gap-3">
            {[FaFacebookF, FaInstagram, FaTwitter].map((Icon, idx) => (
              <div key={idx} className="icon-box-sm press" style={{ background: 'var(--fill2)', color: 'var(--label2)' }}>
                <Icon size={14} />
              </div>
            ))}
          </div>
        </div>

        <div className="pb-8" />
      </div>
    </div>
  );
}