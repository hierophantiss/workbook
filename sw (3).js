// ═══════════════════════════════════════════════
// Service Worker — Mindfulness Practice PWA
// Version: 2026-03-25
// ═══════════════════════════════════════════════

const CACHE_NAME = 'mindfulness-v8';

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
  '/treepose.html'
];

const REDIRECT_PAGES = [
  '/gravity_thhots.html',
  '/camera_exercise__3_.html'
];

const PDF_ASSETS = [
  '/workbook_el.pdf',
  '/workbook_en.pdf'
];

const VIDEO_ASSETS = [
  '/videos/body_exercise.mp4',
  '/videos/breath_exercise.mp4',
  '/videos/attention_exercise.mp4',
  '/videos/space_exercise.mp4'
];

// Core + exercises cached on install
const INSTALL_CACHE = [...CORE_ASSETS, ...EXERCISE_PAGES, ...REDIRECT_PAGES];

// PDFs and videos cached on first request (lazy)
const LAZY_CACHE = [...PDF_ASSETS, ...VIDEO_ASSETS];

// ═══ INSTALL ═══
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(INSTALL_CACHE))
      .then(() => self.skipWaiting())
      .catch(err => {
        console.warn('SW install: some assets failed to cache', err);
        // Still activate even if some assets fail
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

// ═══ FETCH — network-first for HTML, cache-first for assets ═══
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Only handle same-origin
  if (url.origin !== location.origin) return;

  // HTML pages: network-first (fresh content), fallback to cache
  if (event.request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname === '/') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Update cache with fresh version
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // PDFs & Videos: cache on first request (lazy cache)
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

  // Everything else (icons, fonts, etc): cache-first
  event.respondWith(
    caches.match(event.request)
      .then(cached => cached || fetch(event.request))
  );
});
