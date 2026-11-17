// Service worker: caches the app shell and Leaflet so the game opens quickly
// and survives brief connection drops. Map tiles and routing always go to the
// network (they are large and the providers' terms discourage bulk caching).
const CACHE = 'eo-shell-mwlbuflv';
const SHELL = ['./', './index.html', './app.js', './styles.css', './manifest.webmanifest', './icons/icon-180.png', './icons/icon-192.png',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css', 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  const isShell = url.origin === location.origin || url.hostname === 'unpkg.com';
  if (e.request.method !== 'GET' || !isShell) return;
  // Network first for the app itself (so updates arrive), cache as fallback.
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
