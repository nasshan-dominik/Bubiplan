/* Service worker BubiPlan : cache de l'application pour l'usage hors ligne. */
const CACHE = 'bubiplan-v35';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-1024.png'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES).catch(() => {})));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  // visuels déposés dans le dépôt : mis en cache dès la première consultation
  if (u.origin === location.origin && u.pathname.includes('/photos/')) {
    e.respondWith(
      caches.open('bubiplan-photos').then(c =>
        c.match(e.request).then(hit => hit || fetch(e.request).then(res => {
          if (res.ok) c.put(e.request, res.clone()).catch(() => {});
          return res;
        }).catch(() => hit))
      )
    );
    return;
  }
  if (u.origin !== location.origin) {
    // visuels produits : on les garde en cache pour qu'ils s'affichent hors ligne
    if (/\.(jpe?g|png|webp)$/i.test(u.pathname) || u.host.includes('weserv')) {
      e.respondWith(
        caches.open('bubiplan-photos').then(c =>
          c.match(e.request).then(hit => hit || fetch(e.request).then(res => {
            c.put(e.request, res.clone()).catch(() => {});
            return res;
          }).catch(() => hit))
        )
      );
    }
    return;
  }
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
