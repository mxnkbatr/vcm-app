"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .catch(() => {
        // SW registration failed — app still works online
      });

    // When a new SW version is ready, it waits for the user to close tabs.
    // No forced reload here to prevent the multiple-refresh issue.
  }, []);

  return null;
}
