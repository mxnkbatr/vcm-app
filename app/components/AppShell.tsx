"use client";

import dynamic from "next/dynamic";

const MobileChrome = dynamic(() => import("./MobileChrome"), { ssr: false });
const LiquidBackground = dynamic(() => import("./LiquidBackground"), { ssr: false });
const Navbar = dynamic(() => import("./Navbar"), { ssr: false });
const SmoothScroll = dynamic(() => import("./SmoothScroll"), { ssr: false });
const MotionProvider = dynamic(() => import("./MotionProvider"));
const Footer = dynamic(() => import("./Footer"));
const NativeAppLifecycle = dynamic(() => import("./NativeAppLifecycle"), { ssr: false });
const SwipeBackGesture = dynamic(() => import("./SwipeBackGesture"), { ssr: false });
const NativePullRefresh = dynamic(() => import("./NativePullRefresh"), { ssr: false });
const NativePerfBoot = dynamic(() => import("./NativePerfBoot"), { ssr: false });
const NativeStatusBar = dynamic(() => import("./NativeStatusBar"), { ssr: false });

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NativePerfBoot />
      <NativeAppLifecycle />
      <NativeStatusBar />
      <SwipeBackGesture />
      <NativePullRefresh />
      <LiquidBackground />
      <MotionProvider>
        <SmoothScroll />
        <MobileChrome />
        <Navbar />
        <main className="native-app-main min-h-[100dvh] h-[100dvh] overflow-y-auto overflow-x-hidden pb-24 lg:pb-0 lg:h-auto lg:overflow-visible">
          {children}
        </main>
        <div className="hidden lg:block">
          <Footer />
        </div>
      </MotionProvider>
    </>
  );
}
