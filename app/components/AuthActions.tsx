"use client";

import React from "react";
import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Motion as motion } from "./MotionProxy";

interface AuthActionsProps {
  lang: "mn" | "en"| "de";
  BRAND: { RED: string };
  CONTENT: any;
  isMobile?: boolean;
}

const AuthActions = ({ lang, BRAND, CONTENT, isMobile }: AuthActionsProps) => {
  if (isMobile) {
    return (
      <>
        <SignedOut>
          <Link href="/sign-in">
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="px-4 h-9 rounded-full text-white text-[9px] font-black tracking-widest uppercase shadow-lg shadow-red-900/30 border border-white/20 whitespace-nowrap"
              style={{ backgroundColor: BRAND.RED }}
            >
              {CONTENT.login[lang]}
            </motion.button>
          </Link>
        </SignedOut>

        <SignedIn>
          <div className="ml-1 scale-105 drop-shadow-lg w-8 h-8 flex items-center justify-center">
            <UserButton />
          </div>
        </SignedIn>
      </>
    );
  }

  return (
    <>
      <SignedIn>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-[9px] font-black uppercase tracking-widest opacity-70 hover:opacity-100 border-b-2 hidden xl:block"
            style={{ borderColor: BRAND.RED }}
          >
            {CONTENT.dashboard[lang]}
          </Link>
          <div className="w-8 h-8 flex items-center justify-center">
            <UserButton />
          </div>
        </div>
      </SignedIn>

      <SignedOut>
        <Link href="/sign-in">
          <button
            className="px-5 py-2 min-w-[80px] rounded-full text-white text-[9px] font-black uppercase tracking-widest shadow-xl shadow-red-900/20 transition-all active:scale-95 hover:brightness-110"
            style={{ backgroundColor: BRAND.RED }}
          >
            {CONTENT.login[lang]}
          </button>
        </Link>
      </SignedOut>
    </>
  );
};

export default AuthActions;
