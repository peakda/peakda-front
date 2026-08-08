import { useEffect, useRef } from 'react'
import type { FlowerItem } from '@/components/Map/Pin'
import type {
  BloomMapPinType,
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

export function useMapCluster(map: kakao.maps.Map | null, spots: MapSpot[], onPinClick?: (spot: MapSpot) => void) {
  const overlaysRef = useRef<kakao.maps.CustomOverlay[]>([])

  useEffect(() => {
    if (!map) return

    const clusterCache = new Map<number, ClusterGroup[]>()

    const renderOverlays = () => {
      overlaysRef.current.forEach((o) => o.setMap(null))
      overlaysRef.current = []

      const level = map.getLevel()
      if (!clusterCache.has(level)) {
        clusterCache.set(level, clusterSpots(spots, level))
      }
      const clusters = clusterCache.get(level)!

      clusters.forEach((cluster) => {
        const isCluster = cluster.spots.length >= 2 && level >= 4

        if (isCluster) {
          const container = document.createElement('div')
          container.innerHTML = createClusterHTML(cluster.spots)
          // 평균 좌표로 2단계 확대하면 구성원이 화면 밖으로 흩어진다.
          // 구성원 전체를 감싸는 영역에 맞춰 확대해 항상 화면 안에 들어오게 한다.
          // padding 은 헤더·카테고리·검색바(위)와 Nav(아래)에 가리지 않을 만큼.
          container.addEventListener('click', () => {
            const bounds = new kakao.maps.LatLngBounds()
            cluster.spots.forEach((s) => bounds.extend(new kakao.maps.LatLng(s.lat, s.lng)))
            map.setBounds(bounds, 180, 40, 140, 40)
          })

          const overlay = new kakao.maps.CustomOverlay({
            position: new kakao.maps.LatLng(cluster.lat, cluster.lng),
            content: container,
            xAnchor: 0.5,
            yAnchor: 0.5,
          })
          overlay.setMap(map)
          overlaysRef.current.push(overlay)
        } else {
          cluster.spots.forEach((spot) => {
            const container = document.createElement('div')
            container.innerHTML = createPinHTML(spot.flowers, spot.maxStage)
            container.style.cursor = 'pointer'
            if (onPinClick) container.addEventListener('click', () => onPinClick(spot))

            const overlay = new kakao.maps.CustomOverlay({
              position: new kakao.maps.LatLng(spot.lat, spot.lng),
              content: container,
              xAnchor: 0.5,
              yAnchor: 1,
            })
            overlay.setMap(map)
            overlaysRef.current.push(overlay)
          })
        }
      })
    }

    renderOverlays()
    kakao.maps.event.addListener(map, 'zoom_changed', renderOverlays)

    return () => {
      kakao.maps.event.removeListener(map, 'zoom_changed', renderOverlays)
      overlaysRef.current.forEach((o) => o.setMap(null))
      overlaysRef.current = []
    }
  }, [map, spots])
}
