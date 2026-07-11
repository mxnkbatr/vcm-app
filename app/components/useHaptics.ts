"use client";

import { Capacitor } from "@capacitor/core";
import { ImpactStyle, NotificationType } from "@capacitor/haptics";
import { useEffect, useState } from "react";
import { hapticImpact, hapticNotification, hapticSelection } from "@/lib/haptics";

type HapticFeedbackType = "impactLight" | "impactMedium" | "impactHeavy" | "notificationSuccess" | "notificationWarning" | "notificationError" | "selectionStart" | "selectionChanged" | "selectionEnd";

export function useHaptics() {
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    async function checkHapticsAvailability() {
      if (typeof window === "undefined") return;
      const native = Capacitor.isNativePlatform();
      const webMobile =
        !native &&
        window.matchMedia("(max-width: 1023px)").matches &&
        "vibrate" in navigator;
      setIsAvailable(native || webMobile);
    }
    checkHapticsAvailability();
  }, []);

  const triggerHaptic = async (type: HapticFeedbackType) => {
    if (!isAvailable) return;

    try {
      switch (type) {
        case "impactLight":
          await hapticImpact(ImpactStyle.Light);
          break;
        case "impactMedium":
          await hapticImpact(ImpactStyle.Medium);
          break;
        case "impactHeavy":
          await hapticImpact(ImpactStyle.Heavy);
          break;
        case "notificationSuccess":
          await hapticNotification(NotificationType.Success);
          break;
        case "notificationWarning":
          await hapticNotification(NotificationType.Warning);
          break;
        case "notificationError":
          await hapticNotification(NotificationType.Error);
          break;
        case "selectionStart":
        case "selectionChanged":
        case "selectionEnd":
          await hapticSelection();
          break;
        default:
          console.warn("Unknown haptic feedback type:", type);
      }
    } catch (error) {
      console.error("Failed to trigger haptic feedback:", error);
    }
  };

  return { triggerHaptic, isAvailable };
}
