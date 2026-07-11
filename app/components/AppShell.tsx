"use client";

import dynamic from "next/dynamic";

const MobileChrome = dynamic(() => import("./MobileChrome"), { ssr: false });
const LiquidBackground = dynamic(() => import("./LiquidBackground"), { ssr: false });
const Navbar = dynamic(() => import("./Navbar"), { ssr: false });
const SmoothScroll = dynamic(() => import("./SmoothScroll"), { ssr: false });
const MotionProvider = dynamic(() => import("./MotionProvider"));
const Footer = dynamic(() => import("./Footer"));
const NativeAppLifecycle = dynamic(() => import("./NativeAppLifecycle"), { ssr: false });

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NativeAppLifecycle />
      <LiquidBackground />
      <MotionProvider>
        <SmoothScroll />
        <MobileChrome />
        <Navbar />
        <main className="native-app-main min-h-[100dvh] pb-24 lg:pb-0">
          {children}
        </main>
        <div className="hidden lg:block">
          <Footer />
        </div>
      </MotionProvider>
    </>
  );
}
