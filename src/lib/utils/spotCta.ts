/**
 * 스팟·축제 상세의 CTA 링크 조립과 공유 API 판정.
 * `/map?lat=&lng=&q=&spotId=` 와 `/record?spotId=` 는 다른 화면과 맞춘 고정 인터페이스다.
 */

/**
 * 좌표가 모두 있을 때만 지도에 좌표를 넘긴다. 0 도 유효한 좌표이므로 null 여부로만 판정한다.
 * 좌표가 없으면 query(주소·장소명)를 넘겨 지도가 카카오 키워드 검색으로 위치를 찾게 한다.
 * spotId 를 주면 지도가 그 명소 핀을 찾아 목록 드로어를 연다.
 */
export function buildMapUrl(target: {
  latitude?: number | null
  longitude?: number | null
  query?: string | null
  spotId?: number | null
}): string {
  const { latitude, longitude, query, spotId } = target
  const params = new URLSearchParams()
  if (latitude != null && longitude != null) {
    params.set('lat', String(latitude))
    params.set('lng', String(longitude))
  } else if (query?.trim()) {
    params.set('q', query.trim())
  }
  if (spotId != null) params.set('spotId', String(spotId))

  const search = params.toString()
  return search ? `/map?${search}` : '/map'
}

/** 스팟 상세에서 넘어온 기록 작성이면 장소를 미리 채우도록 spotId 를 넘긴다. */
export function buildRecordUrl(spotId?: number | null): string {
  return spotId == null ? '/record' : `/record?spotId=${spotId}`
}

/** Web Share API 지원 여부. 미지원이면 클립보드 복사로 대체한다. */
export function canUseWebShare(nav: { share?: unknown } | undefined): boolean {
  return typeof nav?.share === 'function'
}

/** 사용자가 공유 시트를 닫으면 AbortError 가 난다 — 이때는 에러 토스트를 띄우지 않는다. */
export function isShareAbort(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false
  return 'name' in error && error.name === 'AbortError'
}
