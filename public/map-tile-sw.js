const CACHE_NAME = 'kakao-map-tiles-v1'
const TILE_RE = /\/(map_2d|map_2d_hd|Road|Bg|hybrid)\//

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))

self.addEventListener('fetch', (event) => {
  const { url } = event.request
  if (!url.includes('daumcdn.net') || !TILE_RE.test(url)) return

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(event.request)
      if (cached) return cached

      const response = await fetch(event.request)
      if (response.ok) cache.put(event.request, response.clone())
      return response
    }).catch(() => fetch(event.request))
  )
})
