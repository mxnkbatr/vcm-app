const CACHE_VERSION = "vcm-pwa-v5";
const CACHE_STATIC  = `${CACHE_VERSION}:static`;
const CACHE_PAGES   = `${CACHE_VERSION}:pages`;
const CACHE_API     = `${CACHE_VERSION}:api`;

// Public APIs cached with stale-while-revalidate for instant loads
const SWR_APIS = [
  "/api/events",
  "/api/news",
  "/api/banners",
  "/api/shopping",
  "/api/lms/courses",
  "/api/student/dashboard",
];

const PRECACHE_URLS = ["/offline.html", "/manifest.webmanifest", "/globe.svg"];

// ── Install: precache only, no skipWaiting to prevent forced reloads ──
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC).then(c => c.addAll(PRECACHE_URLS))
    // No skipWaiting() — avoids forced page reload when SW updates
  );
});

// ── Activate: clean old caches ──
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => !k.startsWith(CACHE_VERSION)).map(k => caches.delete(k))
      ))
    // No clients.claim() — avoids claiming open tabs mid-session
  );
});

// ── Helpers ──
const isStaticAsset = (url) =>
  url.pathname.startsWith("/_next/static/") ||
  /\.(svg|png|jpg|jpeg|webp|avif|woff2?|css|js)$/i.test(url.pathname);

const isSWRApi = (url) =>
  SWR_APIS.some(p => url.pathname === p || url.pathname.startsWith(p + "?"));

const isNavigate = (req) => req.mode === "navigate";

// ── Fetch ──
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  // Only handle same-origin
  if (url.origin !== self.location.origin) return;

  // 1) Static assets → cache-first (JS/CSS chunks never change between deploys)
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.open(CACHE_STATIC).then(async cache => {
        const hit = await cache.match(req);
        if (hit) return hit;
        const res = await fetch(req);
        cache.put(req, res.clone()).catch(() => {});
        return res;
      })
    );
    return;
  }

  // 2) Public API routes → stale-while-revalidate (instant response + bg refresh)
  if (isSWRApi(url)) {
    event.respondWith(
      caches.open(CACHE_API).then(async cache => {
        const cached = await cache.match(req);
        const networkPromise = fetch(req).then(res => {
          if (res.ok) cache.put(req, res.clone()).catch(() => {});
          return res;
        }).catch(() => null);

        // Return cached immediately if available, otherwise wait for network
        if (cached) {
          event.waitUntil(networkPromise); // bg refresh
          return cached;
        }
        return networkPromise || new Response(
          JSON.stringify({ error: "Offline" }),
          { status: 503, headers: { "Content-Type": "application/json" } }
        );
      })
    );
    return;
  }

  // 3) Page navigation → network-first, fallback to cache then offline
  if (isNavigate(req)) {
    event.respondWith(
      fetch(req).then(res => {
        caches.open(CACHE_PAGES)
          .then(c => c.put(req, res.clone())).catch(() => {});
        return res;
      }).catch(async () => {
        const hit = await caches.match(req);
        return hit || caches.match("/offline.html") ||
          new Response("Offline", { status: 503 });
      })
    );
    return;
  }

  // 4) Everything else → network-first with cache fallback
  event.respondWith(
    fetch(req).catch(async () => {
      const hit = await caches.match(req);
      return hit || new Response("Offline", { status: 503 });
    })
  );
});
