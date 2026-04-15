"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Briefcase, 
  GraduationCap, 
  Heart, 
  Search, 
  Zap, 
  Filter,
  X,
  Clock,
  ArrowRight,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { useTranslations, useLocale } from "next-intl";

// --- TYPES ---
type OpportunityType = 'all' | 'scholarship' | 'internship' | 'volunteer';

interface Opportunity {
  id: string;
  type: 'scholarship' | 'internship' | 'volunteer';
  title: { en: string; mn: string; de: string };
  provider: { en: string; mn: string; de: string };
  location: { en: string; mn: string; de: string };
  deadline: string;
  description: { en: string; mn: string; de: string };
  tags: string[];
  link: string;
}

// --- SUB-COMPONENT: OPPORTUNITY CARD ---
const OpportunityCard = ({ opp, locale, isDark }: { opp: Opportunity, locale: string, isDark: boolean }) => {
  const t = useTranslations("opportunities");
  const Icon = opp.type === 'scholarship' ? GraduationCap : opp.type === 'internship' ? Briefcase : Heart;
  const typeColor = opp.type === 'scholarship' ? "text-purple-500" : opp.type === 'internship' ? "text-blue-500" : "text-rose-500";
  const typeBg = opp.type === 'scholarship' ? "bg-purple-500/10" : opp.type === 'internship' ? "bg-blue-500/10" : "bg-rose-500/10";

  // Safely access localized content
  const title = opp.title[locale as keyof typeof opp.title] || opp.title.en;
  const provider = opp.provider[locale as keyof typeof opp.provider] || opp.provider.en;
  const description = opp.description[locale as keyof typeof opp.description] || opp.description.en;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileTap={{ scale: 0.98 }}
      className="card overflow-hidden press flex flex-col h-full"
    >
      <div className="p-5 flex flex-col h-full space-y-4">
        <div className="flex justify-between items-start">
          <div className="icon-box" style={{ background: 'var(--blue-dim)' }}>
            <Icon size={20} style={{ color: 'var(--blue)' }} />
          </div>
          <div className="badge text-[10px]" style={{ background: 'var(--bg)', color: 'var(--label2)' }}>
             <Clock size={11} />
             {opp.deadline}
          </div>
        </div>

        <div>
          <h3 className="t-headline line-clamp-2 mb-1">{title}</h3>
          <p className="t-caption" style={{ color: 'var(--blue)' }}>
            {provider}
          </p>
        </div>

        <p className="t-footnote line-clamp-3 leading-relaxed" style={{ color: 'var(--label2)' }}>
          {description}
        </p>

        <div className="mt-auto pt-2">
          <div className="flex flex-wrap gap-1.5 mb-4">
            {opp.tags.map(tag => (
              <span key={tag} className="badge text-[9px] uppercase tracking-wider" style={{ background: 'var(--bg)', color: 'var(--label3)' }}>
                #{tag}
              </span>
            ))}
          </div>

          <Link href={`/opportunities/${opp.id}`} className="btn btn-primary btn-sm btn-full">
            {t('details')}
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

// --- MAIN PAGE ---
export default function OpportunitiesPage() {
  const t = useTranslations("opportunities");
  const locale = useLocale();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<OpportunityType>('all');
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const res = await fetch('/api/opportunities');
      if (res.ok) {
        const data = await res.json();
        setOpportunities(data);
      }
    } catch (error) {
      console.error("Failed to fetch opportunities", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOpps = opportunities.filter(opp => {
    const title = opp.title[locale as keyof typeof opp.title] || opp.title.en;
    const provider = opp.provider[locale as keyof typeof opp.provider] || opp.provider.en;
    
    const matchesSearch = title.toLowerCase().includes(search.toLowerCase()) || 
                         provider.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || opp.type === filter;
    return matchesSearch && matchesFilter;
  });

  const filterTabs = [
    { id: 'all', label: t('all') },
    { id: 'scholarship', label: t('scholarships') },
    { id: 'internship', label: t('internships') },
    { id: 'volunteer', label: t('volunteering') }
  ] as const;

  if (loading) return (
    <div className="min-h-dvh flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="ios-spinner" />
    </div>
  );

  return (
    <div className="page">
      <div className="page-inner space-y-6">
        
        {/* HEADER */}
        <div className="pt-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="icon-box-sm" style={{ background: 'var(--blue-dim)' }}>
              <Zap size={14} style={{ color: 'var(--blue)' }} />
            </div>
            <span className="t-caption2 uppercase tracking-widest" style={{ color: 'var(--blue)' }}>
               {t('badge')}
            </span>
          </div>
          <h1 className="t-large-title">
            {t('titleMain')} <span style={{ color: 'var(--blue)' }}>{t('titleHighlight')}</span>
          </h1>
        </div>

        {/* SEARCH BAR */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--label3)' }} />
          <input 
            type="text" 
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-11 pr-11"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 p-1">
              <X size={16} style={{ color: 'var(--label3)' }} />
            </button>
          )}
        </div>

        {/* FILTER TABS */}
        <div className="overflow-x-auto no-scroll -mx-4 px-4">
          <div className="seg inline-flex">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as OpportunityType)}
                className={`seg-item ${filter === tab.id ? 'on' : ''}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* RESULTS SUMMARY */}
        <div className="flex items-center gap-2 px-1">
            <span className="t-caption2 uppercase tracking-widest" style={{ color: 'var(--label3)' }}>
                {filteredOpps.length} {t('found')}
            </span>
        </div>

        {/* GRID */}
        <div className="space-y-4 stagger">
          <AnimatePresence mode="popLayout">
            {filteredOpps.map(opp => (
              <OpportunityCard key={opp.id} opp={opp} locale={locale} isDark={false} />
            ))}
          </AnimatePresence>
        </div>

        {filteredOpps.length === 0 && (
          <div className="card p-10 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <p className="t-headline mb-1">Илэрц олдсонгүй</p>
            <p className="t-footnote">Өөр түлхүүр үгээр хайж үзнэ үү</p>
          </div>
        )}
      </div>
    </div>
  );
}