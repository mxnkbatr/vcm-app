"use client";

import { useEffect, useState } from "react";

export default function NetworkBanner() {
  const [online, setOnline] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
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
        Offline — хамгийн сүүлд хадгалсан өгөгдлөөр ажиллаж байна
      </div>
    </div>
  );
}

