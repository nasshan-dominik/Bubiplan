const CACHE_VERSION = 'bubiplan-v70';
const CACHE_ASSETS = `${CACHE_VERSION}-assets`;
const CACHE_PHOTOS = `${CACHE_VERSION}-photos`;

const URLS_TO_CACHE = [
  './',
  './index.html',
  './manifest.webmanifest'
];

// Install: Mettre en cache les assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_ASSETS).then(cache => {
      return cache.addAll(URLS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate: Nettoyer les anciens caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_ASSETS && cacheName !== CACHE_PHOTOS) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: 3 stratégies différentes
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. CACHE-FIRST: Assets de l'app (HTML, manifest)
  if (request.method === 'GET' && (
    url.pathname === '/' ||
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('.webmanifest')
  )) {
    event.respondWith(
      caches.match(request).then(response => {
        if (response) return response;
        return fetch(request).then(response => {
          if (response.ok) {
            caches.open(CACHE_ASSETS).then(cache => cache.put(request, response.clone()));
          }
          return response;
        }).catch(() => caches.match(request));
      })
    );
    return;
  }

  // 2. CACHE-WITH-SYNC: Photos locales (/photos/)
  if (request.method === 'GET' && url.pathname.includes('/photos/')) {
    event.respondWith(
      caches.match(request).then(response => {
        if (response) return response;
        return fetch(request).then(response => {
          if (response.ok) {
            caches.open(CACHE_PHOTOS).then(cache => cache.put(request, response.clone()));
          }
          return response;
        }).catch(() => new Response('Photo hors ligne', { status: 404 }));
      })
    );
    return;
  }

  // 3. NETWORK-FIRST: Autres requêtes (API, etc.)
  event.respondWith(
    fetch(request).then(response => {
      if (response.ok && request.method === 'GET') {
        caches.open(CACHE_ASSETS).then(cache => cache.put(request, response.clone()));
      }
      return response;
    }).catch(() => {
      return caches.match(request).then(response => {
        return response || new Response('Offline', { status: 503 });
      });
    })
  );
});

// Background Sync pour les uploads photos
self.addEventListener('sync', event => {
  if (event.tag === 'sync-photos') {
    event.waitUntil(
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'SYNC_PHOTOS' });
        });
      })
    );
  }
});
