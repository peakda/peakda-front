import { useCallback, useEffect, useRef } from 'react'
import { createClusterHTML, createPinHTML } from '@/components/Map/overlayHtml'
import {
  canSplitByZoom,
  clusterSpots,
  pinLabel,
  type ClusterGroup,
  type MapSpot,
} from '@/lib/utils/mapCluster'

// 핀치줌 중 zoom_changed 가 연속 발화하므로 마지막 한 번만 다시 그린다.
const ZOOM_DEBOUNCE_MS = 120

// 드래그 중에는 이 간격으로만 다시 그린다(drag 는 매 프레임 발화한다).
const DRAG_THROTTLE_MS = 100

// 화면 밖 이만큼(px)까지 미리 그려 둔다. 좌표는 꼬리 끝이라 핀 몸통이 좌우 ~63px·위 ~65px
// 걸치므로 그보다 커야 가장자리 핀이 잘리지 않고, 드래그 throttle 사이의 이동도 흡수한다.
// 화면 비율로 잡으면 넓은 화면에서 여유가 bbox 를 다시 거의 다 덮어 효과가 없다.
const VIEW_MARGIN_PX = 100

/** 현재 화면 + 여유분 안에 있는 좌표인지 판정하는 함수 */
function inViewChecker(map: kakao.maps.Map) {
  const proj = map.getProjection()
  const bounds = map.getBounds()
  // 화면 좌표로 남서 = (0, 높이), 북동 = (폭, 0) 이라 컨테이너 크기를 따로 재지 않아도 된다.
  const height = proj.containerPointFromCoords(bounds.getSouthWest()).y
  const width = proj.containerPointFromCoords(bounds.getNorthEast()).x
  const sw = proj.coordsFromContainerPoint(
    new kakao.maps.Point(-VIEW_MARGIN_PX, height + VIEW_MARGIN_PX)
  )
  const ne = proj.coordsFromContainerPoint(
    new kakao.maps.Point(width + VIEW_MARGIN_PX, -VIEW_MARGIN_PX)
  )
  const minLat = sw.getLat()
  const maxLat = ne.getLat()
  const minLng = sw.getLng()
  const maxLng = ne.getLng()
  return (lat: number, lng: number) =>
    lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng
}

interface OverlayEntry {
  overlay: kakao.maps.CustomOverlay
  // 클릭 시점의 최신 데이터. 오버레이를 재사용해도 리스너가 옛 spot 을 붙들지 않도록 여기서 읽는다.
  spots: MapSpot[]
}

export function useMapCluster(
  map: kakao.maps.Map | null,
  spots: MapSpot[],
  onPinClick?: (spot: MapSpot) => void,
  // 확대로는 갈라지지 않는 클러스터를 탭했을 때(구성원 목록을 바텀시트로 연다).
  onClusterClick?: (spots: MapSpot[]) => void
) {
  // 화면에 떠 있는 오버레이를 key 로 들고 있다가, 다시 그릴 때 내용이 같은 것은 그대로 둔다.
  // key 에 렌더 결과 HTML 을 넣어 내용이 달라지면 자동으로 다른 key 가 되게 한다(오래된 핀 재사용 방지).
  const entriesRef = useRef(new Map<string, OverlayEntry>())
  const clusterCacheRef = useRef(new Map<number, ClusterGroup[]>())
  const spotsRef = useRef(spots)
  const onPinClickRef = useRef(onPinClick)
  const onClusterClickRef = useRef(onClusterClick)

  useEffect(() => {
    onPinClickRef.current = onPinClick
    onClusterClickRef.current = onClusterClick
  })

  const render = useCallback((map: kakao.maps.Map) => {
    const level = map.getLevel()
    const entries = entriesRef.current

    if (!clusterCacheRef.current.has(level)) {
      clusterCacheRef.current.set(level, clusterSpots(spotsRef.current, level))
    }
    const clusters = clusterCacheRef.current.get(level)!
    // 조회 bbox 는 격자 스냅으로 화면보다 넓다. 클러스터는 전체로 계산해 팬해도 묶음이
    // 바뀌지 않게 하고, DOM 오버레이는 화면 근처 것만 만든다.
    const inView = inViewChecker(map)

    const add = (
      key: string,
      lat: number,
      lng: number,
      html: string,
      members: MapSpot[],
      label: string
    ) => {
      const existing = entries.get(key)
      if (existing) {
        existing.spots = members
        return
      }

      const container = document.createElement('div')
      container.innerHTML = html
      // 키보드·스크린리더(TalkBack)로도 핀을 누를 수 있게 버튼으로 노출한다.
      container.setAttribute('role', 'button')
      container.setAttribute('aria-label', label)
      container.tabIndex = 0
      const entry: OverlayEntry = { overlay: null!, spots: members }

      const activate =
        members.length >= 2
          ? () => {
              // 더 확대할 수 있으면 확대만 한다(구성원이 벌어지면 다음 렌더에서 자동으로 갈라진다).
              // 평균 좌표로 2단계 확대하면 구성원이 화면 밖으로 흩어지므로 구성원 전체를 감싸는
              // 영역에 맞춘다. padding 은 헤더·카테고리·검색바(위)와 Nav(아래)에 가리지 않을 만큼.
              if (canSplitByZoom(entry.spots, map.getLevel())) {
                const bounds = new kakao.maps.LatLngBounds()
                entry.spots.forEach((s) => bounds.extend(new kakao.maps.LatLng(s.lat, s.lng)))
                map.setBounds(bounds, 180, 40, 140, 40)
                return
              }
              // 최대 줌인데도 안 갈라지는 클러스터는 목록으로 보여 준다.
              onClusterClickRef.current?.(entry.spots)
            }
          : () => onPinClickRef.current?.(entry.spots[0])

      if (members.length < 2) container.style.cursor = 'pointer'
      container.addEventListener('click', activate)
      container.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return
        e.preventDefault() // Space 가 페이지를 스크롤하지 않게
        activate()
      })

      entry.overlay = new kakao.maps.CustomOverlay({
        position: new kakao.maps.LatLng(lat, lng),
        content: container,
        xAnchor: 0.5,
        // 클러스터도 핀처럼 꼬리 끝으로 좌표를 가리킨다.
        yAnchor: 1,
      })
      entry.overlay.setMap(map)
      entries.set(key, entry)
    }

    const nextKeys = new Set<string>()

    for (const cluster of clusters) {
      if (cluster.spots.length >= 2 && level >= 4) {
        if (!inView(cluster.lat, cluster.lng)) continue
        const html = createClusterHTML(cluster.spots)
        const label = `명소 ${cluster.spots.length}곳 묶음`
        // 라벨은 HTML 밖(setAttribute)에 붙으므로 재사용 판정 키에 함께 넣는다(배지는 99+ 에서 멈춘다).
        const key = `c:${cluster.lat},${cluster.lng}|${label}|${html}`
        nextKeys.add(key)
        add(key, cluster.lat, cluster.lng, html, cluster.spots, label)
        continue
      }

      for (const spot of cluster.spots) {
        if (!inView(spot.lat, spot.lng)) continue
        const html = createPinHTML(spot.flowers, spot.maxStage)
        const label = pinLabel(spot)
        const key = `p:${spot.lat},${spot.lng}|${label}|${html}`
        nextKeys.add(key)
        add(key, spot.lat, spot.lng, html, [spot], label)
      }
    }

    // 이번에 안 쓰인 것만 걷어낸다. 그대로인 핀은 DOM 을 건드리지 않는다.
    for (const [key, entry] of entries) {
      if (nextKeys.has(key)) continue
      entry.overlay.setMap(null)
      entries.delete(key)
    }
  }, [])

  // spots 가 바뀌면 클러스터 계산 캐시를 버리고 다시 그린다.
  useEffect(() => {
    spotsRef.current = spots
    clusterCacheRef.current.clear()
    if (map) render(map)
  }, [map, spots, render])

  useEffect(() => {
    if (!map) return

    let timer: ReturnType<typeof setTimeout>
    const onZoom = () => {
      clearTimeout(timer)
      timer = setTimeout(() => render(map), ZOOM_DEBOUNCE_MS)
    }

    // 화면 안 핀만 그리므로 팬할 때도 다시 그려야 한다. 드래그 중엔 throttle 로,
    // 관성 이동·panTo·setBounds 까지 끝나면 idle 에서 한 번 더 맞춘다.
    let dragTimer: ReturnType<typeof setTimeout> | undefined
    const onDrag = () => {
      if (dragTimer) return
      dragTimer = setTimeout(() => {
        dragTimer = undefined
        render(map)
      }, DRAG_THROTTLE_MS)
    }
    const onIdle = () => render(map)

    kakao.maps.event.addListener(map, 'zoom_changed', onZoom)
    kakao.maps.event.addListener(map, 'drag', onDrag)
    kakao.maps.event.addListener(map, 'idle', onIdle)
    const entries = entriesRef.current
    const clusterCache = clusterCacheRef.current
    return () => {
      clearTimeout(timer)
      clearTimeout(dragTimer)
      kakao.maps.event.removeListener(map, 'zoom_changed', onZoom)
      kakao.maps.event.removeListener(map, 'drag', onDrag)
      kakao.maps.event.removeListener(map, 'idle', onIdle)
      entries.forEach((e) => e.overlay.setMap(null))
      entries.clear()
      clusterCache.clear()
    }
  }, [map, render])
}
