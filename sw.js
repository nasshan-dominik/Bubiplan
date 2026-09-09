/* Service worker BubiPlan.
   Volontairement le plus simple possible : une seule règle, pour tout, sans
   exception. Après plusieurs incidents où une logique différenciée par type de
   fichier a fini par bloquer l'app sur une copie périmée sans qu'aucune mise à
   jour livrée ensuite ne puisse s'en sortir toute seule, la fiabilité prime
   largement sur la finesse de la mise en cache hors ligne.

   Règle unique : le réseau d'abord, toujours. Le cache ne sert qu'en secours,
   si le réseau échoue (vraiment hors ligne). Aucune copie ne peut donc jamais
   rester servie indéfiniment pendant qu'une version plus récente existe.
*/
const CACHE = 'bubiplan-v78';
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
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(e.request).then(hit => hit || caches.match('./index.html')))
  );
});
