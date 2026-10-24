"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell } from "lucide-react";
import { springNative } from "@/lib/motion";
import { hapticNotification } from "@/lib/haptics";
import { NotificationType } from "@capacitor/haptics";

type BannerPayload = { title?: string; body?: string };

/** Slides in from the top when a push arrives while the app is foreground. */
export default function InAppBanner() {
  const [banner, setBanner] = useState<BannerPayload | null>(null);

  useEffect(() => {
    let hideTimer: number | undefined;

    const onBanner = (e: Event) => {
      const detail = (e as CustomEvent<BannerPayload>).detail || {};
      setBanner({
        title: detail.title || "VCM",
        body: detail.body || "",
      });
      void hapticNotification(NotificationType.Success);
      if (hideTimer) window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => setBanner(null), 4200);
    };

    window.addEventListener("vcm:in-app-banner", onBanner);
    return () => {
      window.removeEventListener("vcm:in-app-banner", onBanner);
      if (hideTimer) window.clearTimeout(hideTimer);
    };
  }, []);

  return (
    <AnimatePresence>
      {banner && (
        <motion.button
          type="button"
          key="in-app-banner"
          className="in-app-banner lg:hidden"
          initial={{ y: -120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -120, opacity: 0 }}
          transition={springNative}
          onClick={() => {
            setBanner(null);
            window.location.href = "/notifications";
          }}
        >
          <span className="in-app-banner__icon" aria-hidden>
            <Bell size={18} strokeWidth={1.75} />
          </span>
          <span className="in-app-banner__text">
            <span className="in-app-banner__title">{banner.title}</span>
            {banner.body ? <span className="in-app-banner__body">{banner.body}</span> : null}
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
