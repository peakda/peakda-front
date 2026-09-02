// 이전 버전에서 등록한 타일 캐시 서비스워커를 정리한다.
// 외부 지도 타일 요청을 가로채면 첫 방문에도 Cache API 조회가 추가되므로 더는 등록하지 않는다.
const LEGACY_CACHE_NAME = 'kakao-map-tiles-v1'

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([caches.delete(LEGACY_CACHE_NAME), self.registration.unregister()]).then(() =>
      self.clients.claim()
    )
  )
})
