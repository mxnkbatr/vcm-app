import type { Metadata } from "next";

import "../globals.css";
import Navbar from "../components/Navbar";
import AuthProvider from "../components/AuthProvider";
import SmoothScroll from "../components/SmoothScroll";
import dynamic from "next/dynamic";
import MotionProvider from "../components/MotionProvider";
import ServiceWorkerRegister from "../components/ServiceWorkerRegister";
import MobileChrome from "../components/MobileChrome";
import NetworkBanner from "../components/NetworkBanner";
import PushRegister from "../components/PushRegister";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { CartProvider } from "../context/CartContext";
import ThemeProvider from "../components/ThemeProvider";
import BackgroundPrefetch from "../components/BackgroundPrefetch";

const Footer = dynamic(() => import("../components/Footer"));



export const metadata: Metadata = {
  title: "Volunteer Center Mongolia",
  description: "Small Actions, Big Differences",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/globe.svg",
    apple: "/globe.svg",
  }
};

const locales = ['en', 'mn', 'de'];

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <AuthProvider>
      <CartProvider>
        <html lang={locale} suppressHydrationWarning className="">
        <head>
          <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
          <link rel="dns-prefetch" href="https://res.cloudinary.com" />

          {/* iOS / Capacitor Native App */}
          <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no" />
          <meta name="theme-color" content="#F8FAFC" media="(prefers-color-scheme: light)" />
          <meta name="theme-color" content="#0F172A" media="(prefers-color-scheme: dark)" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          {/* black-translucent = edge-to-edge, native shell (not in-browser chrome feel) */}
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="apple-touch-fullscreen" content="yes" />
          <meta name="format-detection" content="telephone=no" />
        </head>
        <body className={`font-sans overscroll-none bg-[#F8FAFC] dark:bg-[#0F172A]`} suppressHydrationWarning>
          <NextIntlClientProvider messages={messages}>
            <ThemeProvider>
            <MotionProvider>
              <ServiceWorkerRegister />
              <BackgroundPrefetch />
              <PushRegister />
              <SmoothScroll />
              <MobileChrome />
              <NetworkBanner />
              <Navbar />
              <main className="native-app-main min-h-[100dvh] pb-24 lg:pb-0">
                {children}
              </main>
              <div className="hidden lg:block">
                <Footer />
              </div>
            </MotionProvider>
            </ThemeProvider>
          </NextIntlClientProvider>
        </body>
      </html>
      </CartProvider>
    </AuthProvider>
  );
}