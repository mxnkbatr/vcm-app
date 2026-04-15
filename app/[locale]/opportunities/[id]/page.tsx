"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  Briefcase, 
  GraduationCap, 
  Heart, 
  MapPin, 
  Clock, 
  ExternalLink,
  ArrowLeft,
  Share2,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useTranslations, useLocale } from "next-intl";

// --- TYPES ---
interface Opportunity {
  id: string;
  type: 'scholarship' | 'internship' | 'volunteer';
  title: { en: string; mn: string; de: string };
  provider: { en: string; mn: string; de: string };
  location: { en: string; mn: string; de: string };
  deadline: string;
  postedDate?: string;
  description: { en: string; mn: string; de: string };
  requirements?: { en: string[]; mn: string[]; de: string[] };
  tags: string[];
  link: string;
  image?: string;
}

export default function OpportunityDetail() {
  const t = useTranslations("opportunities");
  const locale = useLocale() as "en" | "mn" | "de";
  const params = useParams();
  const { theme } = useTheme();
  
  const [mounted, setMounted] = useState(false);
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync with theme and hydration
  useEffect(() => setMounted(true), []);
  const isDark = mounted && (theme === "dark" || !theme);
  const id = params.id as string;

  useEffect(() => {
    async function fetchOpportunity() {
      if (!id) return;
      try {
        const res = await fetch(`/api/opportunities/${id}`);
        if (res.ok) {
          const json = await res.json();
          setOpportunity(json);
        }
      } catch (error) {
        console.error("Failed to load opportunity", error);
      } finally {
        setLoading(false);
      }
    }
    fetchOpportunity();
  }, [id]);

  if (!mounted || loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="ios-spinner" />
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="min-h-dvh flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-center p-8">
            <h2 className="t-headline mb-4">{t("notFound")}</h2>
            <Link href="/opportunities" className="btn btn-primary btn-sm">{t("back")}</Link>
        </div>
      </div>
    );
  }

  const Icon = opportunity.type === 'scholarship' ? GraduationCap : opportunity.type === 'internship' ? Briefcase : Heart;

  return (
    <div className="page">
      <div className="page-inner space-y-6">
        
        <Link href="/opportunities" className="inline-flex items-center gap-1.5 py-2 opacity-60 active:opacity-100 transition-opacity font-semibold text-[13px]" style={{ color: 'var(--blue)' }}>
           <ArrowLeft size={16} /> {t("back")}
        </Link>

        {/* HERO HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 space-y-6"
        >
           {/* TYPE BADGE */}
           <div className="flex justify-between items-start">
              <div className="badge text-[10px] uppercase tracking-wider" style={{ background: 'var(--blue-dim)', color: 'var(--blue)' }}>
                 <Icon size={12} />
                 {opportunity.type}
              </div>
              <div className="flex gap-2">
                 <button className="icon-box-sm" style={{ background: 'var(--bg)' }}>
                    <Share2 size={16} style={{ color: 'var(--label2)' }} />
                 </button>
              </div>
           </div>

           <h1 className="t-large-title !text-2xl">
              {opportunity.title[locale] || opportunity.title.en}
           </h1>

           <div className="space-y-3">
              <div className="flex items-center gap-3">
                 <div className="icon-box-sm" style={{ background: 'var(--bg)' }}>
                    <Briefcase size={14} style={{ color: 'var(--label2)' }} />
                 </div>
                 <span className="t-subhead">{opportunity.provider[locale] || opportunity.provider.en}</span>
              </div>
              <div className="flex items-center gap-3">
                 <div className="icon-box-sm" style={{ background: 'var(--bg)' }}>
                    <MapPin size={14} style={{ color: 'var(--label2)' }} />
                 </div>
                 <span className="t-subhead">{opportunity.location[locale] || opportunity.location.en}</span>
              </div>
              <div className="flex items-center gap-3">
                 <div className="icon-box-sm" style={{ background: 'var(--blue-dim)' }}>
                    <Clock size={14} style={{ color: 'var(--blue)' }} />
                 </div>
                 <span className="t-subhead font-semibold" style={{ color: 'var(--blue)' }}>{t("deadline")}: {opportunity.deadline}</span>
              </div>
           </div>
        </motion.div>

        <div className="space-y-6">
           {/* DESCRIPTION */}
           <motion.div 
             initial={{ opacity: 0, y: 12 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
             className="card p-6"
           >
              <h3 className="t-headline mb-4 flex items-center gap-2">
                 <span className="w-1 h-5 rounded-full" style={{ background: 'var(--blue)' }} />
                 {t("about")}
              </h3>
              <p className="t-body leading-relaxed" style={{ color: 'var(--label2)' }}>
                 {opportunity.description[locale] || opportunity.description.en}
              </p>
           </motion.div>

           {/* REQUIREMENTS */}
           {(opportunity.requirements?.[locale] || opportunity.requirements?.en) && (
             <motion.div 
               initial={{ opacity: 0, y: 12 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
               className="card p-6"
             >
                <h3 className="t-headline mb-4 flex items-center gap-2">
                   <span className="w-1 h-5 rounded-full" style={{ background: 'var(--orange)' }} />
                   {t("requirements")}
                </h3>
                <ul className="space-y-4">
                   {(opportunity.requirements[locale] || opportunity.requirements.en).map((req, i) => (
                      <li key={i} className="flex items-start gap-3">
                         <CheckCircle2 size={18} style={{ color: 'var(--orange)' }} className="shrink-0 mt-0.5" />
                         <span className="t-body" style={{ color: 'var(--label2)' }}>{req}</span>
                      </li>
                   ))}
                </ul>
             </motion.div>
           )}

           {/* APPLY CARD */}
           <motion.div 
             initial={{ opacity: 0, y: 12 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.3 }}
             className="card p-6 text-center space-y-4"
             style={{ background: 'var(--blue-dim)' }}
           >
              <h3 className="t-headline">{t("applyNow")}</h3>
              <p className="t-footnote" style={{ color: 'var(--label2)' }}>
                 {t("applyDesc", { deadline: opportunity.deadline })}
              </p>
              
              <a 
                 href={opportunity.link} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="btn btn-primary btn-full"
              >
                 {t("applyNow")}
                 <ExternalLink size={14} />
              </a>

              <div className="pt-4 border-t border-dashed" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
                 <p className="t-caption2 uppercase tracking-widest opacity-40 mb-3">
                    {t("posted")}: {opportunity.postedDate || "Recently"}
                 </p>
                 <div className="flex flex-wrap justify-center gap-1.5">
                    {opportunity.tags.map(tag => (
                       <span key={tag} className="badge text-[9px] uppercase tracking-wider" style={{ background: 'var(--bg)', color: 'var(--label3)' }}>
                          #{tag}
                       </span>
                    ))}
                 </div>
              </div>
           </motion.div>
        </div>

      </div>
    </div>
  );
}

