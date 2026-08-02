/* Service worker — cache minimal + Web Push (notifications hors app). */
const CACHE = 'famille-v2';
const CORE = ['/', '/index.html', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) =>
    Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(req).then((r) => r || caches.match('/index.html')))
  );
});

/* Réception d'une notification push */
self.addEventListener('push', (e) => {
  let data = {};
  try { data = e.data ? e.data.json() : {}; } catch (_) { data = { body: e.data ? e.data.text() : '' }; }
  const isSos = data.kind === 'sos';
  const title = data.title || (isSos ? '🚨 ALERTE SOS' : 'SOS Famille');
  const opts = {
    body: data.body || 'Nouvelle alerte de la famille',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: data.tag || (isSos ? 'sos' : 'msg'),
    renotify: true,
    requireInteraction: isSos,
    vibrate: isSos ? [500, 200, 500, 200, 500, 200, 700] : [200, 100, 200],
    data: { url: '/' }
  };
  e.waitUntil(self.registration.showNotification(title, opts));
});

/* Clic sur la notification → ouvre / met au premier plan l'app */
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) { if ('focus' in c) return c.focus(); }
      if (self.clients.openWindow) return self.clients.openWindow('/');
    })
  );
});
