"use client";

import { useEffect } from "react";
import { hapticImpact, hapticNotification } from "@/lib/haptics";
import { ImpactStyle, NotificationType } from "@capacitor/haptics";

/**
 * Light impact on interactive presses; Success/Error when data attributes set.
 * Auth/payment logic untouched — pure UX layer.
 */
export default function NativeHapticPress() {
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.(
        "button, [role='button'], a.press, .press, .btn, .glass-press, .ios-list-row"
      ) as HTMLElement | null;
      if (!el) return;
      if (el.getAttribute("aria-disabled") === "true" || (el as HTMLButtonElement).disabled) return;

      const kind = el.dataset.haptic;
      if (kind === "success") {
        void hapticNotification(NotificationType.Success);
        return;
      }
      if (kind === "error") {
        void hapticNotification(NotificationType.Error);
        return;
      }
      if (kind === "none") return;
      void hapticImpact(ImpactStyle.Light);
    };

    document.addEventListener("pointerdown", onPointerDown, { passive: true });
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  return null;
}
