import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import Navbar from "../components/Navbar";
import AuthProvider from "../components/AuthProvider";
import SmoothScroll from "../components/SmoothScroll";
import dynamic from "next/dynamic";
import MotionProvider from "../components/MotionProvider";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';

const Footer = dynamic(() => import("../components/Footer"));

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "Volunteer Center Mongolia",
  description: "Small Actions, Big Differences",
  icons: {
    icon: "/image.png",
    apple: "/image.png",
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
      <html lang={locale} suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://grainy-gradients.vercel.app" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
          <link rel="dns-prefetch" href="https://res.cloudinary.com" />
          <link rel="dns-prefetch" href="https://grainy-gradients.vercel.app" />
          <link rel="dns-prefetch" href="https://images.unsplash.com" />
        </head>
        <body className={`${inter.variable} font-sans`}>
          <NextIntlClientProvider messages={messages}>
            <MotionProvider>
              <SmoothScroll />
              <Navbar />
              <main className="min-h-[100dvh] pb-24 lg:pb-0">
                {children}
              </main>
              <Footer />
            </MotionProvider>
          </NextIntlClientProvider>
        </body>
      </html>
    </AuthProvider>
  );
}