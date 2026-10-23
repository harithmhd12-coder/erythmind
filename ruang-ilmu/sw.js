/* Ruang Ilmu · service worker.
   Fail app: rangkaian dahulu supaya kemas kini tiba serta-merta; salinan simpanan digunakan ketika luar talian.
   Fon Google: disimpan selepas muatan pertama. */
const VER = 'ruang-ilmu-3';
const SHELL = ['./', './index.html', './styles.css', './data.js', './app.js', './manifest.webmanifest', './icons/icon-192.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VER).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('ruang-ilmu-') && k !== VER).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET') return;
  if (/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)) {
    e.respondWith(caches.open(VER).then(async c => { const hit = await c.match(r); if (hit) return hit; const res = await fetch(r); if (res.ok || res.type === 'opaque') c.put(r, res.clone()); return res; }));
    return;
  }
  if (u.origin !== location.origin) return;
  e.respondWith(fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(VER).then(c => c.put(r, cp)); } return res; }).catch(() => caches.match(r).then(h => h || caches.match('./index.html'))));
});
