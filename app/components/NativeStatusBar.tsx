"use client";

import { useEffect } from "react";

/** Sync native status bar for light mode (dark glyphs on light bg). */
export default function NativeStatusBar() {
  useEffect(() => {
    void import("@capacitor/core").then(({ Capacitor }) => {
      if (!Capacitor.isNativePlatform()) return;

      void import("@capacitor/status-bar").then(async ({ StatusBar, Style }) => {
        try {
          await StatusBar.setOverlaysWebView({ overlay: true });
        } catch {
          /* older runtimes */
        }
        void StatusBar.setBackgroundColor({ color: "#EEF1F4" });
        void StatusBar.setStyle({ style: Style.Dark });
      });
    });
  }, []);

  return null;
}
