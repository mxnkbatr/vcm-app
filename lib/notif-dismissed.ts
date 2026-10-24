const KEY = "vcm-notif-dismissed";

export function loadDismissedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as string[];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

export function dismissNotificationId(id: string) {
  const set = loadDismissedIds();
  set.add(id);
  try {
    localStorage.setItem(KEY, JSON.stringify([...set]));
  } catch {
    /* noop */
  }
}
