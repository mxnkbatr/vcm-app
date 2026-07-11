/**
 * Persist clientCache to Capacitor Preferences (native) or localStorage (web).
 * Stale-while-revalidate: show cached data on cold start, refresh in background.
 */

const STORAGE_KEY = "vcm_client_cache_v1";
const MAX_ENTRIES = 48;

type PersistedEntry = {
  data: unknown;
  fetchedAt: number;
};

type PersistedStore = Record<string, PersistedEntry>;

function readWeb(): PersistedStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as PersistedStore;
  } catch {
    return {};
  }
}

function writeWeb(store: PersistedStore): void {
  try {
    const keys = Object.keys(store);
    if (keys.length > MAX_ENTRIES) {
      const sorted = keys.sort((a, b) => store[a].fetchedAt - store[b].fetchedAt);
      for (const k of sorted.slice(0, keys.length - MAX_ENTRIES)) {
        delete store[k];
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* quota exceeded — ignore */
  }
}

async function readNative(): Promise<PersistedStore> {
  try {
    const { Preferences } = await import("@capacitor/preferences");
    const { value } = await Preferences.get({ key: STORAGE_KEY });
    if (!value) return {};
    return JSON.parse(value) as PersistedStore;
  } catch {
    return {};
  }
}

async function writeNative(store: PersistedStore): Promise<void> {
  try {
    const keys = Object.keys(store);
    if (keys.length > MAX_ENTRIES) {
      const sorted = keys.sort((a, b) => store[a].fetchedAt - store[b].fetchedAt);
      for (const k of sorted.slice(0, keys.length - MAX_ENTRIES)) {
        delete store[k];
      }
    }
    const { Preferences } = await import("@capacitor/preferences");
    await Preferences.set({ key: STORAGE_KEY, value: JSON.stringify(store) });
  } catch {
    /* ignore */
  }
}

let nativePlatform: boolean | null = null;

async function isNative(): Promise<boolean> {
  if (nativePlatform !== null) return nativePlatform;
  try {
    const { Capacitor } = await import("@capacitor/core");
    nativePlatform = Capacitor.isNativePlatform();
  } catch {
    nativePlatform = false;
  }
  return nativePlatform;
}

export const cachePersist = {
  async hydrate<T>(key: string): Promise<{ data: T; fetchedAt: number } | null> {
    if (typeof window === "undefined") return null;

    const store = (await isNative()) ? await readNative() : readWeb();
    const entry = store[key];
    if (!entry) return null;
    return { data: entry.data as T, fetchedAt: entry.fetchedAt };
  },

  async save(key: string, data: unknown): Promise<void> {
    if (typeof window === "undefined") return;

    const entry: PersistedEntry = { data, fetchedAt: Date.now() };

    if (await isNative()) {
      const store = await readNative();
      store[key] = entry;
      await writeNative(store);
      return;
    }

    const store = readWeb();
    store[key] = entry;
    writeWeb(store);
  },
};
