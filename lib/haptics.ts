import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

function isMobileWeb() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 1023px)").matches;
}

function webVibrate(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}

export const hapticImpact = async (style: ImpactStyle = ImpactStyle.Light) => {
  if (Capacitor.isNativePlatform()) {
    await Haptics.impact({ style });
    return;
  }
  if (!isMobileWeb()) return;
  const ms =
    style === ImpactStyle.Heavy ? 18 : style === ImpactStyle.Medium ? 12 : 8;
  webVibrate(ms);
};

export const hapticVibrate = async () => {
  if (Capacitor.isNativePlatform()) {
    await Haptics.vibrate();
    return;
  }
  if (isMobileWeb()) webVibrate(14);
};

export const hapticSelection = async () => {
  if (Capacitor.isNativePlatform()) {
    await Haptics.selectionStart();
    await Haptics.selectionChanged();
    await Haptics.selectionEnd();
    return;
  }
  if (isMobileWeb()) webVibrate(4);
};

export const hapticNotification = async (type: NotificationType) => {
  if (Capacitor.isNativePlatform()) {
    await Haptics.notification({ type });
    return;
  }
  if (!isMobileWeb()) return;
  if (type === NotificationType.Error) webVibrate([10, 40, 10]);
  else if (type === NotificationType.Warning) webVibrate([8, 24, 8]);
  else webVibrate([6, 20, 6]);
};
