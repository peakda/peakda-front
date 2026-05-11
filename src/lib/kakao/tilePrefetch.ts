/**
 * 카카오맵 초기 타일을 미리 prefetch합니다.
 * 반드시 브라우저 환경(useEffect 등)에서 kakaoLoader.load() 완료 후 호출해야 합니다.
 *
 * 사용 예:
 *   kakaoLoader.load(process.env.NEXT_PUBLIC_KAKAO_MAP_KEY!).then(() => {
 *     prefetchInitialTiles({ lat: 37.5665, lng: 126.978 })
 *   })
 */
export const prefetchInitialTiles = (center: { lat: number; lng: number }, level = 3) => {
  const lat2tile = (lat: number, zoom: number) =>
    Math.floor(
      ((1 -
        Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) /
        2) *
        Math.pow(2, zoom)
    )

  const lng2tile = (lng: number, zoom: number) =>
    Math.floor(((lng + 180) / 360) * Math.pow(2, zoom))

  const zoom = 14 - level
  const tx = lng2tile(center.lng, zoom)
  const ty = lat2tile(center.lat, zoom)

  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.as = 'image'
      link.href = `//map.daumcdn.net/map_2d_hd/${zoom}/${tx + dx}/${ty + dy}.png`
      document.head.appendChild(link)
    }
  }
}
