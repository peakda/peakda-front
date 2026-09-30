import type { FlowerItem } from '@/components/Map/Pin'
import type { BloomMapPinType, BloomSlotCategory } from '@/api/facades/generated/peakdaApi.schemas'
import type { BloomStageStatus } from '@/lib/utils/bloomStatus'
import { type Stage, STAGE_PRIORITY, STATUS_STAGE } from '@/constants/map'

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
  statuses: BloomStageStatus[]
  // 꽃 종류 필터용. 서버 category 가 단일 값이라 복수 선택은 클라에서 거른다.
  categories: BloomSlotCategory[]
}

export interface ClusterGroup {
  spots: MapSpot[]
  lat: number
  lng: number
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
 * (만개 > 피기시작 > 이르다 > 늦었다 > 개화전)으로 둔다 — 동률이면 개화전이 항상 맨 뒤다.
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
export function topStageFlower(spots: MapSpot[], stage: Stage): FlowerItem | undefined {
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

// 스크린리더가 읽을 핀 이름. 예) "여의도 한강공원, 벚꽃·유채 개화 정보"
export function pinLabel(spot: MapSpot): string {
  const flowers = spot.flowers
    .map((f) => f.alt)
    .filter(Boolean)
    .join('·')
  return `${spot.title ?? '이름 없는 명소'}${flowers ? `, ${flowers}` : ''} 개화 정보`
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
export function canSplitByZoom(spots: MapSpot[], level: number): boolean {
  return level > MAX_ZOOM_LEVEL && clusterSpots(spots, MAX_ZOOM_LEVEL).length > 1
}
