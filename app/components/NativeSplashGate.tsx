"use client";

import { useEffect } from "react";

const FADE_MS = 250;
const HARD_TIMEOUT_MS = 8_000;

async function hideNativeSplash() {
  try {
    const { Capacitor } = await import("@capacitor/core");
    if (!Capacitor.isNativePlatform()) return;
    const { SplashScreen } = await import("@capacitor/splash-screen");
    await SplashScreen.hide({ fadeOutDuration: FADE_MS });
  } catch {
    /* web / already hidden */
  }
}

/**
 * Hides Capacitor splash after first paint / initial warm-up,
 * with a hard 8s fallback so the black WebView never sticks.
 */
export default function NativeSplashGate() {
  useEffect(() => {
    let hidden = false;
    const hide = () => {
      if (hidden) return;
      hidden = true;
      void hideNativeSplash();
    };

    const onReady = () => hide();
    window.addEventListener("vcm:app-ready", onReady);

    // Prefer hide once the document is interactive and idle briefly
    const readyTimer = window.setTimeout(() => {
      if (document.readyState === "complete") hide();
      else window.addEventListener("load", hide, { once: true });
    }, 400);

    const hardTimer = window.setTimeout(hide, HARD_TIMEOUT_MS);

    return () => {
      window.removeEventListener("vcm:app-ready", onReady);
      window.clearTimeout(readyTimer);
      window.clearTimeout(hardTimer);
    };
  }, []);

  return null;
}
