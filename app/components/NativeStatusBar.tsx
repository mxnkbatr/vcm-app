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

        // Keep WebView below the status bar; CSS keeps a notch-safe minimum regardless.
        try {
          await StatusBar.setOverlaysWebView({ overlay: false });
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
