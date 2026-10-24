"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { BRAND } from "@/lib/branding";

/** Sync native status bar with app theme; overlays WebView + safe-area header. */
export default function NativeStatusBar() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    void import("@capacitor/core").then(({ Capacitor }) => {
      if (!Capacitor.isNativePlatform()) return;

      void import("@capacitor/status-bar").then(async ({ StatusBar, Style }) => {
        const isDark = resolvedTheme === "dark";
        const color = isDark ? BRAND.colors.backgroundDark : BRAND.colors.background;

        try {
          await StatusBar.setOverlaysWebView({ overlay: true });
        } catch {
          /* older runtimes */
        }
        void StatusBar.setBackgroundColor({ color });
        // Style.Dark = dark icons (light bg); Style.Light = light icons (dark bg)
        void StatusBar.setStyle({ style: isDark ? Style.Light : Style.Dark });
      });
    });
  }, [resolvedTheme]);

  return null;
}
