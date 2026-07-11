"use client";

import { useEffect, useState } from "react";

export default function NetworkBanner() {
  const [online, setOnline] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const setFromNavigator = () => setOnline(navigator.onLine);

    let removeNative: (() => void) | undefined;

    void import("@capacitor/core").then(({ Capacitor }) => {
      if (!Capacitor.isNativePlatform()) {
        setFromNavigator();
        window.addEventListener("online", setFromNavigator);
        window.addEventListener("offline", setFromNavigator);
        removeNative = () => {
          window.removeEventListener("online", setFromNavigator);
          window.removeEventListener("offline", setFromNavigator);
        };
        return;
      }

      void import("@capacitor/network").then(({ Network }) => {
        void Network.getStatus().then((s) => setOnline(s.connected));
        void Network.addListener("networkStatusChange", (s) => setOnline(s.connected)).then((h) => {
          removeNative = () => void h.remove();
        });
      });
    });

    return () => removeNative?.();
  }, []);

  if (!mounted) return null;
  if (online) return null;

  return (
    <div
      className="lg:hidden fixed left-0 right-0 z-[101] flex justify-center px-3"
      style={{ top: "calc(64px + env(safe-area-inset-top))" }}
    >
      <div
        className="frosted px-4 py-2 rounded-full text-[12px] font-bold"
        style={{ color: "var(--label2)", border: "0.5px solid var(--sep)" }}
      >
        Интернэтгүй — хадгалсан өгөгдлөөр ажиллаж байна
      </div>
    </div>
  );
}
