import { useCallback, useEffect, useRef } from 'react'
import type { FlowerItem } from '@/components/Map/Pin'
import type {
  BloomMapPinType,
  BloomSlotCategory,
  BloomSlotStatus,
} from '@/api/facades/generated/peakdaApi.schemas'
import { type Stage, STAGE_COLOR, STAGE_PRIORITY, STATUS_STAGE } from '@/constants/map'

/**
 * 지도 핀 하나.
 *
 * flowers · statuses · categories 는 이 핀에 달린 꽃을 같은 순서로 담은 **병렬 배열**이다
 * (flowers[i] · statuses[i] · categories[i] 가 같은 꽃). mapFilter 가 꽃 종류로 좁힐 때
 * 이 인덱스 정렬에 기대므로, 한쪽만 따로 만들거나 정렬을 바꾸면 안 된다.
 */
export interface MapSpot {
  lat: number
  lng: number
  flowers: FlowerItem[]
  // 핀 색을 정하는 대표 단계. 꽃을 좁히면 constants/map 의 toMaxStage 로 다시 계산한다.
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

/** 링에 그릴 상태 한 조각. count 는 그 상태를 대표 단계로 갖는 스팟 수(= 곳). */
export interface ClusterSlice {
  stage: Stage
  count: number
}

/**
 * 클러스터의 상태 구성.
 *
 * 스팟이 많은 순으로 정렬하고, 개수가 같으면 STAGE_PRIORITY 가 높은 순
 * (만개 > 피기시작 > 늦었다 > 개화전)으로 둔다 — 동률이면 개화전이 항상 맨 뒤다.
 * 링은 이 순서 그대로 12시 방향부터 시계방향으로 그린다.
 */
export function clusterSlices(spots: MapSpot[]): ClusterSlice[] {
  const countByStage = new Map<Stage, number>()
  for (const spot of spots) {
    countByStage.set(spot.maxStage, (countByStage.get(spot.maxStage) ?? 0) + 1)
  }

  return [...countByStage.entries()]
    .map(([stage, count]) => ({ stage, count }))
    .sort((a, b) => b.count - a.count || STAGE_PRIORITY[b.stage] - STAGE_PRIORITY[a.stage])
}

// 가운데 아이콘은 1순위 상태의 꽃 하나. 그 상태인 꽃 중 가장 많은 종류를 고른다.
function topStageFlower(spots: MapSpot[], stage: Stage): FlowerItem | undefined {
  const countBySrc = new Map<string, { flower: FlowerItem; count: number }>()

  for (const spot of spots) {
    if (spot.maxStage !== stage) continue
    // flowers[i] · statuses[i] 는 병렬 배열이다. 대표 상태와 같은 꽃만 센다.
    spot.flowers.forEach((flower, i) => {
      const status = spot.statuses[i]
      if (status != null && STATUS_STAGE[status] !== stage) return
      const entry = countBySrc.get(flower.src)
      if (entry) entry.count++
      else countBySrc.set(flower.src, { flower, count: 1 })
    })
  }

  let top: { flower: FlowerItem; count: number } | undefined
  for (const entry of countBySrc.values()) {
    if (!top || entry.count > top.count) top = entry
  }
  return top?.flower
}

const CLUSTER_SIZE = 56
const CLUSTER_RING_WIDTH = 5
const CLUSTER_TAIL_HEIGHT = 9
const CLUSTER_ICON_SIZE = 26

function createClusterHTML(spots: MapSpot[]): string {
  const slices = clusterSlices(spots)
  const topStage = slices[0]?.stage ?? 'Before'
  const color = STAGE_COLOR[topStage]

  const center = CLUSTER_SIZE / 2
  const radius = (CLUSTER_SIZE - CLUSTER_RING_WIDTH) / 2
  const circumference = 2 * Math.PI * radius

  // 상태별 비율(개수/전체)만큼 링을 각도로 나눈다. dasharray 로 호 길이를, dashoffset 으로
  // 시작점을 잡고, 그룹을 -90° 돌려 12시 방향부터 시계방향으로 그린다.
  let drawn = 0
  const ring = slices
    .map(({ stage, count }) => {
      const arcLength = (count / spots.length) * circumference
      const arc = `<circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="${STAGE_COLOR[stage]}" stroke-width="${CLUSTER_RING_WIDTH}" stroke-dasharray="${arcLength.toFixed(2)} ${(circumference - arcLength).toFixed(2)}" stroke-dashoffset="${(-drawn).toFixed(2)}"/>`
      drawn += arcLength
      return arc
    })
    .join('')

  const flower = topStageFlower(spots, topStage)
  const iconOffset = (CLUSTER_SIZE - CLUSTER_ICON_SIZE) / 2
  const icon = flower
    ? `<img src="${flower.src}" alt="${flower.alt ?? ''}" width="${CLUSTER_ICON_SIZE}" height="${CLUSTER_ICON_SIZE}" style="position:absolute;left:${iconOffset}px;top:${iconOffset}px;width:${CLUSTER_ICON_SIZE}px;height:${CLUSTER_ICON_SIZE}px;object-fit:contain;">`
    : ''

  // 배지는 대표로 보여준 꽃 1개를 뺀 나머지 스팟 수다.
  const rest = spots.length - 1
  const restLabel = rest > 99 ? '99+' : `+${rest}`
  const badge =
    rest > 0
      ? `<span style="position:absolute;right:-8px;bottom:11px;background:${color};color:white;font-size:13px;font-weight:700;line-height:1;border-radius:9999px;padding:5px 8px;white-space:nowrap;">${restLabel}</span>`
      : ''

  // 꼬리 → 흰 원판 → 링 순으로 겹쳐 꼬리가 링 뒤에서 나온 것처럼 보이게 한다.
  return `
    <div style="position:relative;width:${CLUSTER_SIZE}px;height:${CLUSTER_SIZE + CLUSTER_TAIL_HEIGHT}px;cursor:pointer;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.18));">
      <svg width="${CLUSTER_SIZE}" height="${CLUSTER_SIZE + CLUSTER_TAIL_HEIGHT}" viewBox="0 0 ${CLUSTER_SIZE} ${CLUSTER_SIZE + CLUSTER_TAIL_HEIGHT}" style="display:block;">
        <polygon points="${center - 7},${CLUSTER_SIZE - 12} ${center + 7},${CLUSTER_SIZE - 12} ${center},${CLUSTER_SIZE + CLUSTER_TAIL_HEIGHT}" fill="${color}"/>
        <circle cx="${center}" cy="${center}" r="${radius}" fill="white"/>
        <g transform="rotate(-90 ${center} ${center})">${ring}</g>
      </svg>
      ${icon}${badge}
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

// 카카오 지도의 최대 확대(= 최소 레벨).
const MAX_ZOOM_LEVEL = 1

/**
 * 확대하면 이 클러스터가 갈라지는가.
 * 최대 줌의 격자에서도 한 셀에 남는(≈같은 좌표) 구성원은 아무리 확대해도 못 가른다.
 */
function canSplitByZoom(spots: MapSpot[], level: number): boolean {
  return level > MAX_ZOOM_LEVEL && clusterSpots(spots, MAX_ZOOM_LEVEL).length > 1
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
        container.addEventListener('click', () => {
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
        })
      } else {
        container.style.cursor = 'pointer'
        container.addEventListener('click', () => onPinClickRef.current?.(entry.spots[0]))
      }

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
