import { Capacitor } from "@capacitor/core";

const KEY = "vcm-onboarding-done";

export async function hasCompletedOnboarding(): Promise<boolean> {
  try {
    if (Capacitor.isNativePlatform()) {
      const { Preferences } = await import("@capacitor/preferences");
      const { value } = await Preferences.get({ key: KEY });
      return value === "1";
    }
  } catch {
    /* fall through */
  }
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export async function markOnboardingDone(): Promise<void> {
  try {
    if (Capacitor.isNativePlatform()) {
      const { Preferences } = await import("@capacitor/preferences");
      await Preferences.set({ key: KEY, value: "1" });
    }
  } catch {
    /* fall through */
  }
  try {
    localStorage.setItem(KEY, "1");
  } catch {
    /* noop */
  }
}
