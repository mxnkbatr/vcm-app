import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-inter",
});

import "../globals.css";
import AuthProvider from "../components/AuthProvider";
import ServiceWorkerRegister from "../components/ServiceWorkerRegister";
import NetworkBanner from "../components/NetworkBanner";
import PushRegister from "../components/PushRegister";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { CartProvider } from "../context/CartContext";
import ThemeProvider from "../components/ThemeProvider";
import BackgroundPrefetch from "../components/BackgroundPrefetch";
import AppSplash from "../components/AppSplash";
import AppShell from "../components/AppShell";
import { BRAND } from "@/lib/branding";

export const metadata: Metadata = {
  title: BRAND.name,
  description: BRAND.descriptorMn,
  manifest: "/manifest.webmanifest",
  applicationName: BRAND.shortName,
  appleWebApp: {
    capable: true,
    title: BRAND.shortName,
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: BRAND.icon192, sizes: "192x192", type: "image/png" },
      { url: BRAND.icon512, sizes: "512x512", type: "image/png" },
    ],
    apple: BRAND.appleTouchIcon,
  },
};

// Exported (not a raw <meta>) so Next doesn't emit its own default viewport tag
// without viewport-fit=cover, which makes iOS report a zero safe-area inset.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#EEF1F4",
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
        <html lang={locale} suppressHydrationWarning className={inter.variable}>
          <head>
            <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
            <link rel="dns-prefetch" href="https://res.cloudinary.com" />

            <meta name="color-scheme" content="light" />
            <meta name="apple-mobile-web-app-title" content={BRAND.shortName} />
            <meta name="mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
            <meta name="apple-touch-fullscreen" content="yes" />
            <meta name="format-detection" content="telephone=no" />
            <link rel="apple-touch-icon" href={BRAND.appleTouchIcon} />
            <script
              dangerouslySetInnerHTML={{
                __html: `(function(){try{var ua=navigator.userAgent||"";var C=window.Capacitor;var native=(C&&C.isNativePlatform&&C.isNativePlatform())||ua.indexOf("VCMNativeApp")!==-1;var mobile=window.innerWidth<=1023;var r=document.documentElement;r.classList.remove("dark");r.style.colorScheme="light";try{localStorage.setItem("vcm-theme","light");}catch(_){}if(native){r.classList.add("native-shell");document.cookie="vcm_native=1;path=/;max-age=31536000;SameSite=Lax";}if(native||mobile){r.classList.add("native-perf");}}catch(e){}})();`,
              }}
            />
          </head>
          <body className={`${inter.className} overscroll-none bg-[var(--bg)] text-[var(--label)]`} suppressHydrationWarning>
            <AppSplash />
            <NextIntlClientProvider messages={messages}>
              <ThemeProvider>
                <ServiceWorkerRegister />
                <BackgroundPrefetch />
                <PushRegister />
                <NetworkBanner />
                <AppShell>{children}</AppShell>
              </ThemeProvider>
            </NextIntlClientProvider>
          </body>
        </html>
      </CartProvider>
    </AuthProvider>
  );
}
