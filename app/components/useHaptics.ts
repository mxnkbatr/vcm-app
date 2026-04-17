"use client";

import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { useEffect, useState } from "react";

type HapticFeedbackType = "impactLight" | "impactMedium" | "impactHeavy" | "notificationSuccess" | "notificationWarning" | "notificationError" | "selectionStart" | "selectionChanged" | "selectionEnd";

export function useHaptics() {
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    async function checkHapticsAvailability() {
      if (typeof window === "undefined") return;
      // Capacitor Haptics is intended for native platforms.
      setIsAvailable(Capacitor.isNativePlatform());
    }
    checkHapticsAvailability();
  }, []);

  const triggerHaptic = async (type: HapticFeedbackType) => {
    if (!isAvailable) return;

    try {
      switch (type) {
        case "impactLight":
          await Haptics.impact({ style: ImpactStyle.Light });
          break;
        case "impactMedium":
          await Haptics.impact({ style: ImpactStyle.Medium });
          break;
        case "impactHeavy":
          await Haptics.impact({ style: ImpactStyle.Heavy });
          break;
        case "notificationSuccess":
          await Haptics.notification({ type: NotificationType.Success });
          break;
        case "notificationWarning":
          await Haptics.notification({ type: NotificationType.Warning });
          break;
        case "notificationError":
          await Haptics.notification({ type: NotificationType.Error });
          break;
        case "selectionStart":
          await Haptics.selectionStart();
          break;
        case "selectionChanged":
          await Haptics.selectionChanged();
          break;
        case "selectionEnd":
          await Haptics.selectionEnd();
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
