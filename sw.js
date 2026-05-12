// GymLog Service Worker — network-first strategy
// Bumping CACHE_NAME forces the old cache to be deleted on next activation.
// localStorage is never touched here; all user data is safe.
const CACHE_NAME = 'gymlog-v1.2';

const CORE_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
];

// ── Install ────────────────────────────────────────────────────
// Pre-cache core assets so the app works offline from first load.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting()) // Activate immediately, don't wait for old SW to finish
  );
});

// ── Activate ───────────────────────────────────────────────────
// Delete every cache version that isn't the current one.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(
        names
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      ))
      .then(() => self.clients.claim()) // Take control of all open tabs immediately
  );
});

// ── Fetch ──────────────────────────────────────────────────────
// Network first: always try to fetch fresh from the server.
// If the network fails (offline), fall back to the cached version.
// Successful network responses are written back to the cache so the
// offline fallback stays up to date.
self.addEventListener('fetch', event => {
  // Only intercept GET requests for our own origin
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.ok) {
          // Update cache with fresh response
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
