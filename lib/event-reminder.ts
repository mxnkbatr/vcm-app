import { Capacitor } from "@capacitor/core";

/**
 * Schedule a local push-style reminder 1 day before the event starts.
 * Uses @capacitor/local-notifications on native; no-ops elsewhere.
 */
export async function scheduleEventDayBeforeReminder(opts: {
  eventId: string;
  title: string;
  body: string;
  eventStart: Date;
}): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;

  const fireAt = new Date(opts.eventStart.getTime() - 24 * 60 * 60 * 1000);
  if (fireAt.getTime() <= Date.now()) return false;

  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");

    const perm = await LocalNotifications.checkPermissions();
    if (perm.display !== "granted") {
      const req = await LocalNotifications.requestPermissions();
      if (req.display !== "granted") return false;
    }

    // Stable numeric id from event id (Capacitor requires number)
    let hash = 0;
    for (let i = 0; i < opts.eventId.length; i++) {
      hash = (hash * 31 + opts.eventId.charCodeAt(i)) | 0;
    }
    const id = Math.abs(hash % 2_000_000_000) || 1;

    await LocalNotifications.schedule({
      notifications: [
        {
          id,
          title: opts.title,
          body: opts.body,
          schedule: { at: fireAt },
          extra: { eventId: opts.eventId, kind: "event-day-before" },
        },
      ],
    });
    return true;
  } catch {
    return false;
  }
}
