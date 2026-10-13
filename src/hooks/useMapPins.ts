import { useCallback, useEffect, useRef } from 'react'
import { createClusterHTML, createPinHTML } from '@/components/Map/overlayHtml'
import { advanceFrame } from '@/lib/utils/frameTask'
import {
  canSplitByZoom,
  clusterSpots,
  pinLabel,
  type ClusterGroup,
  type MapSpot,
} from '@/lib/utils/mapCluster'

// 핀치줌 중 zoom_changed 가 연속 발화하므로 마지막 한 번만 다시 그린다.
const ZOOM_DEBOUNCE_MS = 120

// 드래그·관성 이동 중 한 프레임에 새 핀을 만드는 데 쓸 시간(ms). 카카오 CustomOverlay 는 지도에
// 붙을 때마다 콘텐츠 크기를 읽어(강제 레이아웃) 여러 개를 한 번에 만들면 프레임이 끊긴다.
// 개수가 아니라 시간으로 자르므로 빠른 기기는 많이, 느린 기기는 적게 만들고 나머지는 다음 프레임에 이어 간다.
// 초기 표시·필터·줌·idle 도 같은 예산을 쓴다. 진행 위치를 보존해 준비 작업을 반복하지 않는다.
const FRAME_BUDGET_MS = 4

// 화면 밖 이만큼(px)까지 미리 그려 둔다. 좌표는 꼬리 끝이라 핀 몸통이 좌우 ~63px·위 ~65px
// 걸치므로 그보다 커야 가장자리 핀이 잘리지 않고, 프레임 예산에 밀려 늦게 붙는 핀의 여유도 된다.
// 화면 비율로 잡으면 넓은 화면에서 여유가 bbox 를 다시 거의 다 덮어 효과가 없다.
const VIEW_MARGIN_PX = 100

/** 현재 화면 + 여유분(margin px) 안에 있는 좌표인지 판정하는 함수 */
function inViewChecker(map: kakao.maps.Map, margin: number) {
  const proj = map.getProjection()
  const bounds = map.getBounds()
  // 화면 좌표로 남서 = (0, 높이), 북동 = (폭, 0) 이라 컨테이너 크기를 따로 재지 않아도 된다.
  const height = proj.containerPointFromCoords(bounds.getSouthWest()).y
  const width = proj.containerPointFromCoords(bounds.getNorthEast()).x
  const sw = proj.coordsFromContainerPoint(new kakao.maps.Point(-margin, height + margin))
  const ne = proj.coordsFromContainerPoint(new kakao.maps.Point(width + margin, -margin))
  const minLat = sw.getLat()
  const maxLat = ne.getLat()
  const minLng = sw.getLng()
  const maxLng = ne.getLng()
  return (lat: number, lng: number) =>
    lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng
}

// 오버레이 하나의 렌더 결과. key 는 재사용 판정용이다.
interface OverlayView {
  key: string
  html: string
  label: string
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
  // 클러스터·핀 객체별 렌더 결과. 드래그 중 render 가 반복돼도 HTML 문자열을 다시 만들지 않는다.
  // spots 가 바뀌면 객체도 새로 생기므로 따로 비우지 않아도 된다.
  const viewCacheRef = useRef(new WeakMap<ClusterGroup | MapSpot, OverlayView>())
  const spotsRef = useRef(spots)
  const scheduleRef = useRef<(() => void) | null>(null)
  const onPinClickRef = useRef(onPinClick)
  const onClusterClickRef = useRef(onClusterClick)

  useEffect(() => {
    onPinClickRef.current = onPinClick
    onClusterClickRef.current = onClusterClick
  })

  // 준비·순회·제거·생성을 모두 프레임에 나눈다. 인덱스 생성과 SDK 호출 하나는 원자적이다.
  const render = useCallback(function* (map: kakao.maps.Map): Generator<void, void> {
    const level = map.getLevel()
    const entries = entriesRef.current

    if (!clusterCacheRef.current.has(level)) {
      clusterCacheRef.current.set(level, clusterSpots(spotsRef.current, level))
      yield
    }
    const clusters = clusterCacheRef.current.get(level)!
    // 조회 bbox 는 격자 스냅으로 화면보다 넓다. 클러스터는 전체로 계산해 팬해도 묶음이
    // 바뀌지 않게 하고, DOM 오버레이는 화면 근처 것만 만든다.
    const inView = inViewChecker(map, VIEW_MARGIN_PX)
    // 예산이 모자라면 실제 화면 안 핀부터 만든다(여유 영역 핀은 아직 안 보인다).
    const onScreen = inViewChecker(map, 0)

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
              const level = map.getLevel()
              if (canSplitByZoom(entry.spots, level)) {
                const bounds = new kakao.maps.LatLngBounds()
                entry.spots.forEach((s) => bounds.extend(new kakao.maps.LatLng(s.lat, s.lng)))
                map.setBounds(bounds, 180, 40, 140, 40)
                // 거리 기반 묶음은 구성원이 화면 절반보다 넓게 퍼질 수 있어, 그러면 setBounds 가
                // 같은 레벨에 머물러 눌러도 아무 일이 없다. 그때는 한 단계만 확대한다.
                if (map.getLevel() >= level) {
                  map.setLevel(level - 1, { anchor: new kakao.maps.LatLng(lat, lng) })
                }
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

    const viewCache = viewCacheRef.current
    const viewOf = (target: ClusterGroup | MapSpot, make: () => OverlayView) => {
      let view = viewCache.get(target)
      if (!view) {
        view = make()
        viewCache.set(target, view)
      }
      return view
    }

    const nextKeys = new Set<string>()
    const screenAdds: (() => void)[] = []
    const marginAdds: (() => void)[] = []
    const queueAdd = (
      key: string,
      lat: number,
      lng: number,
      html: string,
      members: MapSpot[],
      label: string
    ) => {
      nextKeys.add(key)
      const existing = entries.get(key)
      if (existing) {
        existing.spots = members
        return
      }
      ;(onScreen(lat, lng) ? screenAdds : marginAdds).push(() =>
        add(key, lat, lng, html, members, label)
      )
    }

    for (const cluster of clusters) {
      yield
      if (cluster.spots.length >= 2 && level >= 4) {
        if (!inView(cluster.lat, cluster.lng)) continue
        const { key, html, label } = viewOf(cluster, () => {
          const html = createClusterHTML(cluster.spots)
          const label = `명소 ${cluster.spots.length}곳 묶음`
          // 라벨은 HTML 밖(setAttribute)에 붙으므로 재사용 판정 키에 함께 넣는다(배지는 99+ 에서 멈춘다).
          return { key: `c:${cluster.lat},${cluster.lng}|${label}|${html}`, html, label }
        })
        queueAdd(key, cluster.lat, cluster.lng, html, cluster.spots, label)
        continue
      }

      for (const spot of cluster.spots) {
        yield
        if (!inView(spot.lat, spot.lng)) continue
        const { key, html, label } = viewOf(spot, () => {
          const html = createPinHTML(spot.flowers, spot.maxStage)
          const label = pinLabel(spot)
          return { key: `p:${spot.lat},${spot.lng}|${label}|${html}`, html, label }
        })
        queueAdd(key, spot.lat, spot.lng, html, [spot], label)
      }
    }

    // 이번에 안 쓰인 것만 걷어낸다. 그대로인 핀은 DOM 을 건드리지 않는다.
    for (const [key, entry] of entries) {
      yield
      if (nextKeys.has(key)) continue
      entry.overlay.setMap(null)
      entries.delete(key)
    }

    for (const queue of [screenAdds, marginAdds]) {
      for (const create of queue) {
        create()
        yield
      }
    }
  }, [])

  // spots 가 바뀌면 클러스터 계산 캐시를 버리고 다시 그린다.
  useEffect(() => {
    spotsRef.current = spots
    clusterCacheRef.current.clear()
    scheduleRef.current?.()
  }, [map, spots, render])

  useEffect(() => {
    if (!map) return

    let timer: ReturnType<typeof setTimeout>
    let job: Generator<void, void> | null = null
    const onZoom = () => {
      clearTimeout(timer)
      // 이전 줌의 큐가 뒤늦게 핀을 붙이지 않게 즉시 폐기한다.
      job?.return()
      job = null
      stopLoop()
      timer = setTimeout(schedule, ZOOM_DEBOUNCE_MS)
    }

    // 팬 중에도 현재 큐를 마친 뒤 최신 화면을 처리해 연속 이동에 작업이 굶지 않게 한다.
    let frameId: number | null = null
    let isDragging = false
    let lastCenter: { lat: number; lng: number } | null = null
    let needsRefresh = false
    const tick = () => {
      frameId = null
      const latLng = map.getCenter()
      const center = { lat: latLng.getLat(), lng: latLng.getLng() }
      const isMoving =
        lastCenter == null || lastCenter.lat !== center.lat || lastCenter.lng !== center.lng
      lastCenter = center
      needsRefresh ||= isMoving
      if (!job && needsRefresh) {
        job = render(map)
        needsRefresh = false
      }
      if (job && advanceFrame(job, FRAME_BUDGET_MS)) job = null
      if (isDragging || needsRefresh || job) frameId = requestAnimationFrame(tick)
    }
    const stopLoop = () => {
      if (frameId != null) cancelAnimationFrame(frameId)
      frameId = null
    }
    const schedule = () => {
      job?.return()
      job = render(map)
      const center = map.getCenter()
      lastCenter = { lat: center.getLat(), lng: center.getLng() }
      needsRefresh = false
      if (frameId == null) frameId = requestAnimationFrame(tick)
    }
    const onDragStart = () => {
      isDragging = true
      lastCenter = null
      if (frameId == null) frameId = requestAnimationFrame(tick)
    }
    const onDragEnd = () => {
      isDragging = false
    }
    const onIdle = () => {
      clearTimeout(timer)
      schedule()
    }

    scheduleRef.current = schedule
    schedule()

    kakao.maps.event.addListener(map, 'zoom_changed', onZoom)
    kakao.maps.event.addListener(map, 'dragstart', onDragStart)
    kakao.maps.event.addListener(map, 'dragend', onDragEnd)
    kakao.maps.event.addListener(map, 'idle', onIdle)
    const entries = entriesRef.current
    const clusterCache = clusterCacheRef.current
    return () => {
      clearTimeout(timer)
      stopLoop()
      job?.return()
      scheduleRef.current = null
      kakao.maps.event.removeListener(map, 'zoom_changed', onZoom)
      kakao.maps.event.removeListener(map, 'dragstart', onDragStart)
      kakao.maps.event.removeListener(map, 'dragend', onDragEnd)
      kakao.maps.event.removeListener(map, 'idle', onIdle)
      entries.forEach((e) => e.overlay.setMap(null))
      entries.clear()
      clusterCache.clear()
    }
  }, [map, render])
}
