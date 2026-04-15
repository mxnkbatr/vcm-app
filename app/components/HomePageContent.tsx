"use client";

import dynamic from "next/dynamic";
import { Suspense, useState, useEffect } from "react";
import LazySection from "./LazySection";
import HeroSlider from "./HeroSlider";

import BannerSlider from "./BannerSlider";
 
 const Hero = dynamic(() => import("./Hero"), { ssr: false });
const EventsSection = dynamic(() => import("./Events"), { ssr: false });
const ShopClient = dynamic(() => import("@/app/[locale]/shop/ShopClient"), { ssr: false });
const UsSection = dynamic(() => import("./UseSection"), { ssr: false });
const WhyChooseUs = dynamic(() => import("./WhyChooseUs"), { ssr: false });

export default function HomePageContent({ shopItems, locale }: { shopItems?: any[], locale?: string }) {
  const [items, setItems] = useState<any[]>(shopItems || []);

  useEffect(() => {
    if (!shopItems || shopItems.length === 0) {
      fetch('/api/shopping')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setItems(data.slice(0, 12));
          }
        })
        .catch(err => console.error("Failed to fetch shop items", err));
    }
  }, [shopItems]);

  return ( 
        <> 
          <div className="h-[calc(64px+env(safe-area-inset-top))] mb-2" /> 
          <BannerSlider />
          
          {/* Shop Section - Top Priority in Mobile Apps */}
          <LazySection placeholder={<div className="w-full h-[400px] bg-slate-50 animate-pulse" />}>
            <div className="px-5 pt-8 pb-4 flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Онцлох бараа</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Shop Collections</p>
              </div>
              <button className="press text-sm font-bold text-sky-600 bg-sky-50 px-4 py-1.5 rounded-full active:scale-95 transition-all">Бүгд</button>
            </div>
            <Suspense fallback={<div className="w-full h-[400px] bg-slate-50 animate-pulse" />}>
              {items.length > 0 && locale ? (
                <div className="flex overflow-x-auto pb-6 px-5 gap-4 no-scrollbar scroll-smooth snap-x snap-mandatory">
                   <ShopClient items={items} locale={locale} isHorizontal={true} />
                </div>
              ) : (
                <div className="w-full h-[200px] flex items-center justify-center">
                   <span className="text-slate-400 font-medium italic">Дэлгүүр уншиж байна...</span>
                </div>
              )}
            </Suspense>
          </LazySection>

          {/* Events Section */}
          <LazySection placeholder={<div className="w-full h-[400px] bg-slate-50 animate-pulse" />}>
            <div className="px-5 pt-8 pb-4 flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Арга хэмжээ</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Upcoming Events</p>
              </div>
              <button className="press text-sm font-bold text-sky-600 bg-sky-50 px-4 py-1.5 rounded-full active:scale-95 transition-all">Бүгд</button>
            </div>
            <Suspense fallback={<div className="w-full h-[400px] bg-slate-50 animate-pulse" />}>
              <div className="flex overflow-x-auto pb-6 px-5 gap-4 no-scrollbar scroll-smooth snap-x snap-mandatory">
                <EventsSection isHorizontal={true} />
              </div>
            </Suspense>
          </LazySection>

          {/* About Us Section - Simplified for App */}
          <LazySection placeholder={<div className="w-full h-[300px] bg-slate-50 animate-pulse" />}>
            <div className="px-5 pt-8 pb-4">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Бидний тухай</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Our Mission</p>
            </div>
            <Suspense fallback={<div className="w-full h-[300px] bg-slate-50 animate-pulse" />}>
              <div className="px-5 pb-10">
                <UsSection isAppView={true} />
              </div>
            </Suspense>
          </LazySection>

          {/* Footer Padding for Tab Bar */}
          <div className="h-24" />
        </> 
   );
}

