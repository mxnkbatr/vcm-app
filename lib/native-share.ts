import { Capacitor } from "@capacitor/core";

/** Native share sheet when available; falls back to Web Share / clipboard. */
export async function nativeShare(opts: {
  title: string;
  text?: string;
  url?: string;
  dialogTitle?: string;
}): Promise<boolean> {
  try {
    if (Capacitor.isNativePlatform()) {
      const { Share } = await import("@capacitor/share");
      await Share.share({
        title: opts.title,
        text: opts.text,
        url: opts.url,
        dialogTitle: opts.dialogTitle ?? opts.title,
      });
      return true;
    }
  } catch {
    /* fall through */
  }

  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share({
        title: opts.title,
        text: opts.text,
        url: opts.url,
      });
      return true;
    } catch {
      /* user cancelled or unsupported */
    }
  }

  if (opts.url && typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(opts.url);
      return true;
    } catch {
      /* noop */
    }
  }
  return false;
}
