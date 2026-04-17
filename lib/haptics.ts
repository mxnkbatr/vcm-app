import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

export const hapticImpact = async (style: ImpactStyle = ImpactStyle.Light) => {
  if (Capacitor.isNativePlatform()) {
    await Haptics.impact({ style });
  }
};

export const hapticVibrate = async () => {
  if (Capacitor.isNativePlatform()) {
    await Haptics.vibrate();
  }
};

export const hapticSelection = async () => {
  if (Capacitor.isNativePlatform()) {
    await Haptics.selectionStart();
    await Haptics.selectionChanged();
    await Haptics.selectionEnd();
  }
};
