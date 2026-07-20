// sw.js — Service Worker for offline caching

const CACHE_NAME = 'wooly-v20';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/store.js',
  './js/model.js',
  './js/i18n.js',
  './js/themes.js',
  './js/views/pattern-list.js',
  './js/views/editor.js',
  './js/components/toast.js',
  './js/components/export.js',
  './js/components/import.js',
  './js/components/drag.js',
  './js/components/markdown.js',
  './js/components/backup.js',
  './js/components/templates.js',
  './js/components/settings.js',
  './js/components/icons.js',
  './js/print-styles/index.js',
  './js/print-styles/elegant.js',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap',
  'https://cdn.jsdelivr.net/npm/marked@15.0.7/marked.min.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
