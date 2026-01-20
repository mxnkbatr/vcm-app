import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import { LanguageProvider } from "./context/LanguageContext";
import { ClerkProvider } from "@clerk/nextjs";
import Footer from "./components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "UNICEF Club MNUMS",
  description: "Small Actions, Big Differences",
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <LanguageProvider>
            
              <Navbar />
            <main className="min-h-screen pb-24 lg:pb-0">
              {children}
            </main>
              <Footer/>
            
          </LanguageProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}