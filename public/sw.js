// Minimal service worker: stale-while-revalidate for public GET pages/assets.
// Sensitive/dynamic areas are never cached (always go to network).
const CACHE = 'singsaksit-v1';
const SKIP = ['/account', '/admin', '/checkout', '/auth', '/api', '/s/'];

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (SKIP.some((p) => url.pathname.startsWith(p))) return;

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      const network = fetch(request)
        .then((res) => {
          if (res && res.ok) cache.put(request, res.clone());
          return res;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
