/* Erythmind app · service worker.
   App files: network first, so updates arrive at once; the saved copy is used when offline.
   3D models, fonts and libraries: saved after the first load and served from the device after that.
   Supabase traffic (data, room) is never cached. */
const VER = 'erythmind-31e37138d8';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VER).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VER).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if(r.method !== 'GET' || /supabase\.(co|in)$/.test(u.hostname)) return;
  const heavy = /\/assets\/|\.gltf\.json$|\.webp$|fonts\.(googleapis|gstatic)\.com|cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net/.test(r.url);
  if(heavy){
    e.respondWith(caches.open(VER).then(async c => { const hit = await c.match(r); if(hit) return hit; const res = await fetch(r); if(res.ok || res.type === 'opaque') c.put(r, res.clone()); return res; }));
    return;
  }
  if(u.origin !== location.origin) return;
  e.respondWith(fetch(r).then(res => { if(res.ok){ const cp = res.clone(); caches.open(VER).then(c => c.put(r, cp)); } return res; }).catch(() => caches.match(r).then(h => h || caches.match('./index.html'))));
});
