// Offline support: network-first for pages, cache-first for hashed assets and art.
const CACHE = 'syndicate-city-v2'
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(
  caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
))
self.addEventListener('fetch', (e) => {
  const req = e.request
  const url = new URL(req.url)
  if (req.method !== 'GET' || url.origin !== self.location.origin || url.pathname.endsWith('version.json')) return
  const isPage = req.mode === 'navigate'
  if (isPage) {
    e.respondWith(fetch(req, { cache: 'no-store' }).then((res) => { caches.open(CACHE).then((c) => c.put(req, res.clone())); return res }).catch(() => caches.match(req).then((r) => r || caches.match('./'))))
    return
  }
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)) }
    return res
  })))
})
