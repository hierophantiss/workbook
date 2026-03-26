// ═══════════════════════════════════════════════
// Service Worker — Mindfulness Practice PWA
// Version: 2026-03-26b
// ═══════════════════════════════════════════════

const CACHE_NAME = 'mindfulness-v10';

const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/favicon-32x32.png',
  '/favicon-192x192.png',
  '/apple-touch-icon.png'
];

const EXERCISE_PAGES = [
  '/breath_exercise.html',
  '/gravity_thoughts.html',
  '/eswterikhafh.html',
  '/camera_exercise.html',
  '/cameraexercise.html',
  '/three_attention.html',
  '/samatha_attention.html',
  '/attention_dispersion.html',
  '/metronomos.html',
  '/treepose.html',
  '/openawareness.html',
  '/racing_mind.html'
];

const REDIRECT_PAGES = [
  '/gravity_thhots.html',
  '/camera_exercise__3_.html'
];

const INSTALL_CACHE = [...CORE_ASSETS, ...EXERCISE_PAGES, ...REDIRECT_PAGES];

// ═══ INSTALL ═══
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(INSTALL_CACHE))
      .then(() => self.skipWaiting())
      .catch(err => {
        console.warn('SW install: some assets failed', err);
        return self.skipWaiting();
      })
  );
});

// ═══ ACTIVATE — clean old caches ═══
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ═══ FETCH ═══
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  // HTML: network-first, fallback cache
  if (event.request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname === '/') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // PDFs & Videos: lazy cache
  if (url.pathname.endsWith('.pdf') || url.pathname.endsWith('.mp4')) {
    event.respondWith(
      caches.match(event.request)
        .then(cached => {
          if (cached) return cached;
          return fetch(event.request).then(response => {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
            return response;
          });
        })
    );
    return;
  }

  // Everything else: cache-first
  event.respondWith(
    caches.match(event.request)
      .then(cached => cached || fetch(event.request))
  );
});
