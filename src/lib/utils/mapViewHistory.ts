// 지도 중심·줌을 "지금 보고 있는 히스토리 엔트리"에 적어 둔다.
// 명소 상세로 나갔다 오면 MapContainer 가 새로 마운트돼 지도를 처음부터 만들기 때문에,
// 이 값이 없으면 뒤로가기마다 현재 위치로 튕긴다.
//
// sessionStorage 가 아니라 history.state 를 쓰는 이유: 값이 엔트리마다 따로 남아
// '뒤로가기로 돌아온 경우'에만 복원된다. 하단 탭 등으로 지도에 새로 들어오면(router.push)
// Next 가 커스텀 state 를 새 엔트리에 복사하지 않으므로(navigate-reducer 의
// preserveCustomHistoryState=false) 값이 없고, 예전처럼 현재 위치로 이동한다.
// 웹·앱 모두 뒤로가기가 window.history.back() 이라 같은 경로를 탄다.
const MAP_VIEW_KEY = 'peakdaMapView'

export interface MapView {
  lat: number
  lng: number
  level: number
}

const isMapView = (value: unknown): value is MapView => {
  if (typeof value !== 'object' || value === null) return false
  const source = value as Record<string, unknown>
  return (
    typeof source.lat === 'number' &&
    Number.isFinite(source.lat) &&
    typeof source.lng === 'number' &&
    Number.isFinite(source.lng) &&
    typeof source.level === 'number' &&
    Number.isFinite(source.level)
  )
}

// 이 히스토리 엔트리에 남아 있는 지도 위치. 없으면 null(= 지도에 처음 들어온 것).
export const readMapView = (): MapView | null => {
  if (typeof window === 'undefined') return null

  const state: unknown = window.history.state
  if (typeof state !== 'object' || state === null) return null

  const view = (state as Record<string, unknown>)[MAP_VIEW_KEY]
  return isMapView(view) ? view : null
}

// 현재 state 를 그대로 펼쳐 Next 내부 필드(__NA, 라우터 트리)를 같이 넘긴다.
// url 을 주지 않으므로 주소와 useSearchParams 는 건드리지 않는다 — 리렌더도 없다.
export const rememberMapView = (view: MapView) => {
  if (typeof window === 'undefined') return

  try {
    window.history.replaceState({ ...window.history.state, [MAP_VIEW_KEY]: view }, '')
  } catch {
    // 짧은 시간에 replaceState 를 너무 자주 부르면 막는 브라우저가 있다(Safari).
    // 위치 기억은 실패해도 지도 동작에는 영향이 없어 조용히 넘긴다.
  }
}
