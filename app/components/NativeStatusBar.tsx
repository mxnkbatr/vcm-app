"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { BRAND } from "@/lib/branding";

/** Sync native status bar with VCM cream / dark theme. */
export default function NativeStatusBar() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    void import("@capacitor/core").then(({ Capacitor }) => {
      if (!Capacitor.isNativePlatform()) return;

      void import("@capacitor/status-bar").then(async ({ StatusBar, Style }) => {
        const isDark = resolvedTheme === "dark";
        const color = isDark ? BRAND.colors.backgroundDark : BRAND.colors.creamLight;

        // Keep WebView below the status bar so the floating header never overlaps
        // the clock / battery on notched iPhones (TestFlight / iPhone 13).
        try {
          await StatusBar.setOverlaysWebView({ overlay: false });
          document.documentElement.classList.add("native-overlay-false");
        } catch {
          /* older runtimes */
        }
        void StatusBar.setBackgroundColor({ color });
        void StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
      });
    });
  }, [resolvedTheme]);

  return null;
}
