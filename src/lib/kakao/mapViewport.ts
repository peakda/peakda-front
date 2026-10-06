// 지금 화면의 영역. 화면 안 명소 개수('N개의 명소 보기')를 셀 때 쓴다.
export interface Viewport {
  minLat: number
  minLng: number
  maxLat: number
  maxLng: number
}

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

// onPermission 은 권한 결과를 알려준다. 시간 초과·위치 확인 실패는 권한은 있는 것이라 granted 다.
export function panToCurrentLocation(
  map: kakao.maps.Map,
  onPermission?: (permission: 'granted' | 'denied') => void
) {
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      map.panTo(new kakao.maps.LatLng(coords.latitude, coords.longitude))
      onPermission?.('granted')
    },
    (err) => onPermission?.(err.code === err.PERMISSION_DENIED ? 'denied' : 'granted'),
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
