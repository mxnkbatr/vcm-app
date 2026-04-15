// c:\Users\User\Desktop\vcm\vcm\app\components\MobileNavigationBar.tsx
"use client";

import React from "react";
import { Link } from "@/navigation";
import Image from "next/image";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { Search, Heart, Bell, Menu } from "lucide-react"; // New imports for icons

// Dynamically import Clerk components to reduce initial JS bundle
const AuthActions = dynamic(() => import("./AuthActions"), {
  ssr: false,
  loading: () => <div className="w-[120px] h-9" />
});

// --- COLOR PALETTE CONFIGURATION ---
const BRAND = {
  RED: "#38bdf8", // Using Sky-400 as primary
  GREEN: "#0ea5e9", // Using Sky-500 as secondary
  WHITE: "#FFFFFF",
};

export default function MobileNavigationBar() {
  const t = useTranslations("navbar");

  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-[100] pointer-events-none">
      <div
        className="flex justify-between items-center px-5 pointer-events-auto transition-all duration-300"
        style={{
          WebkitBackdropFilter: "blur(25px) saturate(180%)",
          backdropFilter: "blur(25px) saturate(180%)",
          backgroundColor: "rgba(255, 255, 255, 0.75)",
          borderBottom: "0.5px solid rgba(0, 0, 0, 0.1)",
          height: "calc(64px + env(safe-area-inset-top))",
          paddingTop: "env(safe-area-inset-top)",
        }}
      >
        {/* Left side: Logo */}
        <Link href="/" className="flex items-center press transition-transform active:scale-95">
          <div className="relative w-9 h-9"> 
            <Image
              src="https://res.cloudinary.com/dc127wztz/image/upload/q_auto/f_auto/v1775390339/logos_xs3a5r.png"
              alt="VCM Logo"
              fill
              priority
              sizes="36px"
              className="object-contain"
              quality={85}
            />
          </div>
        </Link>

        {/* Right side: Icons */}
        <div className="flex items-center gap-5">
          <button className="press p-1.5 rounded-full hover:bg-black/5 active:scale-90 transition-all">
            <Search size={22} className="text-slate-900" strokeWidth={2.2} />
          </button>
          <button className="press p-1.5 rounded-full hover:bg-black/5 active:scale-90 transition-all">
            <Heart size={22} className="text-slate-900" strokeWidth={2.2} />
          </button>
          <button className="press p-1.5 rounded-full hover:bg-black/5 active:scale-90 transition-all relative">
            <Bell size={22} className="text-slate-900" strokeWidth={2.2} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <button className="press p-1.5 rounded-full hover:bg-black/5 active:scale-90 transition-all">
            <Menu size={22} className="text-slate-900" strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </div>
  );
}
