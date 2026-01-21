import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import { LanguageProvider } from "./context/LanguageContext";
import { ClerkProvider } from "@clerk/nextjs";
import SmoothScroll from "./components/SmoothScroll";
import Footer from "./components/Footer";
import MotionProvider from "./components/MotionProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Aupair Mongolia",
  description: "Small Actions, Big Differences",
  icons: {
    icon: "/image.png",
    apple: "/image.png",
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://analytics-api-s.cloudinary.com" />
          <link rel="preconnect" href="https://careful-beetle-54.clerk.accounts.dev" />
          <link rel="dns-prefetch" href="https://grainy-gradients.vercel.app" />
          <link rel="dns-prefetch" href="https://unpkg.com" />
        </head>
        <body className={inter.className}>
          <LanguageProvider>
            <MotionProvider>
              <SmoothScroll />
              <Navbar />
              <main className="min-h-[100dvh] pb-24 lg:pb-0">
                {children}
              </main>
              <Footer />
            </MotionProvider>
          </LanguageProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}