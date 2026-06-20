// Minimal service worker. It exists only so the app meets the PWA installability
// criteria (a service worker with a fetch handler), which Android Chrome needs to
// offer a standalone home-screen install. It deliberately does NOT cache anything
// — every request goes to the network — so there is no stale-content risk (#76).
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) =>
  event.waitUntil(self.clients.claim()),
);
// A no-op fetch handler satisfies the installability check without intercepting
// responses (requests fall through to the browser's default network handling).
self.addEventListener('fetch', () => {});
