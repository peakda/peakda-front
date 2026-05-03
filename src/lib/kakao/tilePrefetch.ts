import { kakaoLoader } from './kakaoLoader'

export const prefetchInitialTiles = (center: { lat: number; lng: number }, level = 3) => {
  // 카카오맵 타일 URL 패턴
  // 실제 URL은 브라우저 네트워크 탭에서 확인
  const tileSize = 256
  const tilesPerRow = 4 // 화면 채울 타일 수

  // 위경도 → 타일 좌표 변환
  const lat2tile = (lat: number, zoom: number) =>
    Math.floor(
      ((1 -
        Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) /
        2) *
        Math.pow(2, zoom)
    )

  const lng2tile = (lng: number, zoom: number) =>
    Math.floor(((lng + 180) / 360) * Math.pow(2, zoom))

  const zoom = 14 - level // 카카오 레벨 → 줌 변환 (근사값)
  const tx = lng2tile(center.lng, zoom)
  const ty = lat2tile(center.lat, zoom)

  // 중심 타일 주변 3x3 미리 fetch
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.as = 'image'
      // 실제 카카오 타일 URL로 교체 필요
      link.href = `//map.daumcdn.net/map_2d_hd/` + `${zoom}/${tx + dx}/${ty + dy}.png`
      document.head.appendChild(link)
    }
  }
}

kakaoLoader.load(appkey).then(() => {
  prefetchInitialTiles({ lat: 37.5665, lng: 126.978 })
})
