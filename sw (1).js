const CACHE_NAME = 'mindfulness-v4';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/breath_exercise.html',
  '/gravity_thhots.html',
  '/eswterikhafh.html',
  '/camera_exercise__3_.html',
  '/cameraexercise.html',
  '/metronomos.html',
  '/treepose.html',
  '/samatha_attention.html',
  '/attention_dispersion.html',
  '/three_attention.html',
  '/workbook_el.pdf',
  '/workbook_en.pdf',
  '/favicon.ico',
  '/favicon-32x32.png',
  '/favicon-192x192.png',
  '/icon-384x384.png',
  '/icon-512x512.png',
  '/apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
