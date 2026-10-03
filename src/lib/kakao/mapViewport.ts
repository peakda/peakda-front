import type { GetSeasonalBloomsParams } from '@/api/facades/generated/peakdaApi.schemas'

// 화면 그대로의 영역. bbox 는 격자에 스냅돼 화면보다 넓어 개수 계산에는 쓸 수 없다.
export interface Viewport {
  minLat: number
  minLng: number
  maxLat: number
  maxLng: number
}

// bbox를 격자에 스냅해 이동 시 동일 쿼리 키로 수렴시킨다(캐시 히트 + staleTime 작동).
// 셀 크기를 level 에 비례시켜 화면 폭의 약 90% 로 고정한다. 예전처럼 0.01°(≈880m)로
// 고정하면 level 8 화면이 가로 14칸이라, 화면 폭의 7%만 움직여도 매번 새 키가 됐다.
const BBOX_GRID_UNIT = 0.001
const bboxGridSize = (level: number) => BBOX_GRID_UNIT * Math.pow(2, level - 1)

// 뷰를 항상 덮도록 min은 내림, max는 올림. 부동소수 꼬리는 잘라 URL·쿼리 키를 안정시킨다.
const snapDown = (v: number, unit: number) => Number((Math.floor(v / unit) * unit).toFixed(6))
const snapUp = (v: number, unit: number) => Number((Math.ceil(v / unit) * unit).toFixed(6))

// region 을 여기서 함께 확정하는 게 핵심이다. bloomParams 가 applied.region 을 직접 읽으면
// 권역을 고른 순간 React Query 의 내부 effect(useBloomMap 호출 지점이라 훅 순서상 아래
// 권역 effect보다 먼저 돈다)가 '옛 bbox + 새 region' 으로 요청을 한 번 보내고 버린다.
// 둘을 한 state 에 담아 같은 setState 로 바꾸면 그 중간 상태 자체가 생기지 않는다.
export const snapBbox = (
  box: Viewport,
  level: number,
  region: GetSeasonalBloomsParams['region']
): GetSeasonalBloomsParams => {
  const unit = bboxGridSize(level)
  return {
    minLat: snapDown(box.minLat, unit),
    minLng: snapDown(box.minLng, unit),
    maxLat: snapUp(box.maxLat, unit),
    maxLng: snapUp(box.maxLng, unit),
    region,
  }
}

export const sameBbox = (a: GetSeasonalBloomsParams, b: GetSeasonalBloomsParams) =>
  a.minLat === b.minLat &&
  a.minLng === b.minLng &&
  a.maxLat === b.maxLat &&
  a.maxLng === b.maxLng &&
  a.region === b.region

export const mapBox = (map: kakao.maps.Map): Viewport => {
  const bounds = map.getBounds()
  const sw = bounds.getSouthWest()
  const ne = bounds.getNorthEast()
  return {
    minLat: sw.getLat(),
    minLng: sw.getLng(),
    maxLat: ne.getLat(),
    maxLng: ne.getLng(),
  }
}

const LOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  maximumAge: 5 * 60 * 1000,
  timeout: 8_000,
}

export type InitialMapLocation =
  | { permission: 'granted'; center: { lat: number; lng: number } | null }
  | { permission: 'prompt' | 'denied' | 'unknown' }

// 이미 허용한 위치만 지도 SDK와 병렬로 조회한다. 미결정 권한은 지도 생성 후
// 기존 흐름에서 요청해 첫 방문의 권한 팝업 시점을 유지한다.
export async function prepareInitialMapLocation(
  permissions: Pick<Permissions, 'query'> | undefined = navigator.permissions,
  geolocation: Pick<Geolocation, 'getCurrentPosition'> | undefined = navigator.geolocation
): Promise<InitialMapLocation> {
  if (!permissions?.query) return { permission: 'unknown' }

  let state: PermissionState
  try {
    const result = await permissions.query({ name: 'geolocation' })
    state = result.state
  } catch {
    return { permission: 'unknown' }
  }

  if (state !== 'granted') return { permission: state }
  if (!geolocation) return { permission: 'granted', center: null }

  return new Promise((resolve) => {
    try {
      geolocation.getCurrentPosition(
        ({ coords }) =>
          resolve({
            permission: 'granted',
            center: { lat: coords.latitude, lng: coords.longitude },
          }),
        (error) =>
          resolve(
            error.code === error.PERMISSION_DENIED
              ? { permission: 'denied' }
              : { permission: 'granted', center: null }
          ),
        LOCATION_OPTIONS
      )
    } catch {
      resolve({ permission: 'granted', center: null })
    }
  })
}

export function panToCurrentLocation(map: kakao.maps.Map, onPermissionDenied?: () => void) {
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => map.panTo(new kakao.maps.LatLng(coords.latitude, coords.longitude)),
    (err) => {
      if (err.code === err.PERMISSION_DENIED) onPermissionDenied?.()
    },
    LOCATION_OPTIONS
  )
}

export const initMap = (
  container: HTMLElement,
  center: { lat: number; lng: number },
  level: number
) => {
  const map = new kakao.maps.Map(container, {
    center: new kakao.maps.LatLng(center.lat, center.lng),
    level,
    maxLevel: 13,
    draggable: true,
    scrollwheel: true,
    disableDoubleClickZoom: false,
    mapTypeId: kakao.maps.MapTypeId.ROADMAP,
  })

  return map
}
