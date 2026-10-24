"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { BRAND } from "@/lib/branding";

/** Sync native status bar; light bg uses DARK (dark glyphs). */
export default function NativeStatusBar() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    void import("@capacitor/core").then(({ Capacitor }) => {
      if (!Capacitor.isNativePlatform()) return;

      void import("@capacitor/status-bar").then(async ({ StatusBar, Style }) => {
        const isDark = resolvedTheme === "dark";
        const color = isDark ? BRAND.colors.backgroundDark : "#F2F2F7";

        try {
          await StatusBar.setOverlaysWebView({ overlay: true });
        } catch {
          /* older runtimes */
        }
        void StatusBar.setBackgroundColor({ color });
        // Style.Dark = dark text/icons on light backgrounds
        void StatusBar.setStyle({ style: isDark ? Style.Light : Style.Dark });
      });
    });
  }, [resolvedTheme]);

  return null;
}
