import { useCallback, useEffect, useRef } from 'react'
import type { FlowerItem } from '@/components/Map/Pin'
import type {
  BloomMapPinType,
  BloomSlotCategory,
  BloomSlotStatus,
} from '@/api/facades/generated/peakdaApi.schemas'
import { type Stage, STAGE_COLOR, STAGE_PRIORITY } from '@/constants/map'

export interface MapSpot {
  lat: number
  lng: number
  flowers: FlowerItem[]
  maxStage: Stage
  title?: string
  attractionId?: number
  // 스팟 API(상세·기록)의 id. 명소형은 Spot 행이 아직 없으면 없다(탭 시 match 로 materialize).
  spotId?: number
  // 상단 칩(명소/동네) 필터용. 서버 파라미터가 없어 응답의 pin.type 을 그대로 들고 온다.
  type: BloomMapPinType
  // 시기 필터용. 이 핀에 달린 꽃들의 개화 상태(핀 하나에 여러 개 가능).
  statuses: BloomSlotStatus[]
  // 꽃 종류 필터용. 서버 category 가 단일 값이라 복수 선택은 클라에서 거른다.
  categories: BloomSlotCategory[]
}

interface ClusterGroup {
  spots: MapSpot[]
  lat: number
  lng: number
}

function createPinHTML(flowers: FlowerItem[], maxStage: Stage): string {
  const color = STAGE_COLOR[maxStage]
  const grayscale =
    maxStage === 'Before' || maxStage === 'End' ? 'opacity:0.4;filter:grayscale(1);' : ''
  const imgs = flowers
    .slice(0, 3)
    .map(
      (f) =>
        `<img src="${f.src}" alt="${f.alt ?? ''}" width="24" height="24" style="width:24px;height:24px;flex-shrink:0;object-fit:contain;${grayscale}">`
    )
    .join('')
  const badge =
    flowers.length >= 2
      ? `<span style="flex-shrink:0;background:${color};color:white;font-size:11px;font-weight:600;border-radius:9999px;padding:2px 5px;">+${flowers.length}</span>`
      : ''

  return `
    <div style="display:inline-flex;flex-direction:column;align-items:center;">
      <div style="background:white;border:2px solid ${color};border-radius:9999px;padding:6px;display:flex;align-items:center;gap:4px;box-shadow:0 1px 3px rgba(0,0,0,0.15);white-space:nowrap;">
        ${imgs}${badge}
      </div>
      <svg width="10" height="8" viewBox="0 0 14 9" style="margin-top:-1px;display:block;flex-shrink:0;">
        <polygon points="0,0 14,0 7,9" fill="${color}"/>
      </svg>
    </div>
  `
}

function createClusterHTML(spots: MapSpot[]): string {
  const maxStage = spots.reduce<Stage>(
    (max, s) => (STAGE_PRIORITY[s.maxStage] > STAGE_PRIORITY[max] ? s.maxStage : max),
    'Before'
  )
  const color = STAGE_COLOR[maxStage]

  const allFlowers = spots.flatMap((s) => s.flowers)
  const countBySrc = new Map<string, { flower: FlowerItem; count: number }>()
  for (const f of allFlowers) {
    const entry = countBySrc.get(f.src)
    if (entry) entry.count++
    else countBySrc.set(f.src, { flower: f, count: 1 })
  }
  const topFlower = [...countBySrc.values()].reduce((a, b) => (b.count > a.count ? b : a)).flower

  const label = spots.length > 99 ? '99+' : `${spots.length}`

  return `
    <div style="width:56px;height:56px;border-radius:9999px;background:${color};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;box-shadow:0 2px 8px rgba(0,0,0,0.2);cursor:pointer;">
      <img src="${topFlower.src}" alt="${topFlower.alt ?? ''}" width="24" height="24" style="object-fit:contain;filter:brightness(0) invert(1);">
      <span style="color:white;font-size:13px;font-weight:700;line-height:1;">${label}</span>
    </div>
  `
}

// 셀 크기는 level 에 비례하므로 화면상 크기가 일정하다(≈106px @ 모바일 390px 폭).
// 이 상수가 크면(이전 0.002 ≈ 706px) 셀이 화면보다 넓어 확대해도 클러스터가 쪼개지지 않는다.
const CLUSTER_GRID_UNIT = 0.0003

export function clusterSpots(spots: MapSpot[], level: number): ClusterGroup[] {
  const gridSize = CLUSTER_GRID_UNIT * Math.pow(2, level - 1)
  const grid = new Map<string, MapSpot[]>()

  for (const spot of spots) {
    const cellX = Math.floor(spot.lng / gridSize)
    const cellY = Math.floor(spot.lat / gridSize)
    const key = `${cellX},${cellY}`
    const cell = grid.get(key) ?? []
    cell.push(spot)
    grid.set(key, cell)
  }

  return Array.from(grid.values()).map((group) => ({
    spots: group,
    lat: group.reduce((s, sp) => s + sp.lat, 0) / group.length,
    lng: group.reduce((s, sp) => s + sp.lng, 0) / group.length,
  }))
}

// 핀치줌 중 zoom_changed 가 연속 발화하므로 마지막 한 번만 다시 그린다.
const ZOOM_DEBOUNCE_MS = 120

interface OverlayEntry {
  overlay: kakao.maps.CustomOverlay
  // 클릭 시점의 최신 데이터. 오버레이를 재사용해도 리스너가 옛 spot 을 붙들지 않도록 여기서 읽는다.
  spots: MapSpot[]
}

export function useMapCluster(
  map: kakao.maps.Map | null,
  spots: MapSpot[],
  onPinClick?: (spot: MapSpot) => void
) {
  // 화면에 떠 있는 오버레이를 key 로 들고 있다가, 다시 그릴 때 내용이 같은 것은 그대로 둔다.
  // key 에 렌더 결과 HTML 을 넣어 내용이 달라지면 자동으로 다른 key 가 되게 한다(오래된 핀 재사용 방지).
  const entriesRef = useRef(new Map<string, OverlayEntry>())
  const clusterCacheRef = useRef(new Map<number, ClusterGroup[]>())
  const spotsRef = useRef(spots)
  const onPinClickRef = useRef(onPinClick)

  useEffect(() => {
    onPinClickRef.current = onPinClick
  })

  const render = useCallback((map: kakao.maps.Map) => {
    const level = map.getLevel()
    const entries = entriesRef.current

    if (!clusterCacheRef.current.has(level)) {
      clusterCacheRef.current.set(level, clusterSpots(spotsRef.current, level))
    }
    const clusters = clusterCacheRef.current.get(level)!

    const add = (key: string, lat: number, lng: number, html: string, members: MapSpot[]) => {
      const existing = entries.get(key)
      if (existing) {
        existing.spots = members
        return
      }

      const container = document.createElement('div')
      container.innerHTML = html
      const entry: OverlayEntry = { overlay: null!, spots: members }

      if (members.length >= 2) {
        // 평균 좌표로 2단계 확대하면 구성원이 화면 밖으로 흩어진다.
        // 구성원 전체를 감싸는 영역에 맞춰 확대해 항상 화면 안에 들어오게 한다.
        // padding 은 헤더·카테고리·검색바(위)와 Nav(아래)에 가리지 않을 만큼.
        container.addEventListener('click', () => {
          const bounds = new kakao.maps.LatLngBounds()
          entry.spots.forEach((s) => bounds.extend(new kakao.maps.LatLng(s.lat, s.lng)))
          map.setBounds(bounds, 180, 40, 140, 40)
        })
      } else {
        container.style.cursor = 'pointer'
        container.addEventListener('click', () => onPinClickRef.current?.(entry.spots[0]))
      }

      entry.overlay = new kakao.maps.CustomOverlay({
        position: new kakao.maps.LatLng(lat, lng),
        content: container,
        xAnchor: 0.5,
        yAnchor: members.length >= 2 ? 0.5 : 1,
      })
      entry.overlay.setMap(map)
      entries.set(key, entry)
    }

    const nextKeys = new Set<string>()

    for (const cluster of clusters) {
      if (cluster.spots.length >= 2 && level >= 4) {
        const html = createClusterHTML(cluster.spots)
        const key = `c:${cluster.lat},${cluster.lng}|${html}`
        nextKeys.add(key)
        add(key, cluster.lat, cluster.lng, html, cluster.spots)
        continue
      }

      for (const spot of cluster.spots) {
        const html = createPinHTML(spot.flowers, spot.maxStage)
        const key = `p:${spot.lat},${spot.lng}|${html}`
        nextKeys.add(key)
        add(key, spot.lat, spot.lng, html, [spot])
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

    kakao.maps.event.addListener(map, 'zoom_changed', onZoom)
    const entries = entriesRef.current
    const clusterCache = clusterCacheRef.current
    return () => {
      clearTimeout(timer)
      kakao.maps.event.removeListener(map, 'zoom_changed', onZoom)
      entries.forEach((e) => e.overlay.setMap(null))
      entries.clear()
      clusterCache.clear()
    }
  }, [map, render])
}
