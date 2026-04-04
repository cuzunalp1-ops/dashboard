const CACHE_NAME = 'evofone-v1';
const SHELL_ASSETS = [
  '/dashboard/',
  '/dashboard/index.html',
  '/dashboard/evo-logo.webp',
  '/dashboard/favicon.svg',
  '/dashboard/android-chrome-192x192.png',
  '/dashboard/android-chrome-512x512.png',
  '/dashboard/manifest.json'
];

// Install - cache shell assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL_ASSETS))
  );
  self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch - network first, fallback to cache for shell
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Google Apps Script requests - always network
  if (url.hostname.includes('google') || url.hostname.includes('googleapis')) {
    return;
  }

  // Shell assets - cache first
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
