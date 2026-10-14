import Supercluster from 'supercluster'
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

// 화면 px 기준 묶음 반경. 클러스터 마커(배지 포함 약 64×65px)보다 커야 마커끼리 겹치지 않는다.
// 예전 격자 방식은 이웃 칸 경계에 붙은 두 묶음이 같은 자리에 그려져 겹쳤다.
// 키우면 겹침은 줄지만 묶음이 넓게 퍼진다. 탭해서 한 단계라도 확대되려면 구성원 범위가
// 모바일 화면(390px − setBounds 좌우 패딩 80px)의 절반(≈155px) 안이어야 하는데, 90px 부터
// 이를 넘는 묶음이 생겼다(전국 665핀 시뮬레이션: 80px 최대 133px·겹침 23쌍 ← 격자 138쌍).
const CLUSTER_RADIUS_PX = 80

// 카카오 level 을 supercluster zoom(웹 메르카토르, 타일 512px)으로 옮긴다. 국내 위도에서
// level L 의 m/px 가 zoom 19-L 과 거의 같아(±5%) radius 를 화면 px 로 그대로 쓸 수 있다.
// level 1(최대 확대)이 zoom 18 이라 maxZoom 도 18 — 그보다 크면 묶지 않고 점을 그대로 준다.
const toZoom = (level: number) => 19 - level
const MAX_CLUSTER_ZOOM = 18

interface SpotProps {
  index: number
}

// 같은 spots 배열로 레벨만 바꿔 부르면 인덱스를 다시 만들지 않는다(전 레벨을 한 번에 만든다).
const indexCache = new WeakMap<MapSpot[], Supercluster<SpotProps>>()

function clusterIndex(spots: MapSpot[]): Supercluster<SpotProps> {
  const cached = indexCache.get(spots)
  if (cached) return cached

  const index = new Supercluster<SpotProps>({
    radius: CLUSTER_RADIUS_PX,
    maxZoom: MAX_CLUSTER_ZOOM,
  }).load(
    spots.map((spot, i) => ({
      type: 'Feature',
      properties: { index: i },
      geometry: { type: 'Point', coordinates: [spot.lng, spot.lat] },
    }))
  )
  indexCache.set(spots, index)
  return index
}

// 거리 기반이라 가까운 스팟끼리 묶이고, 줌 단계마다 아래 레벨 묶음을 합쳐 올라가므로
// 확대하면 묶음이 갈라질 뿐 다른 묶음으로 옮겨 가지 않는다.
export function clusterSpots(spots: MapSpot[], level: number): ClusterGroup[] {
  const index = clusterIndex(spots)

  return index.getClusters([-180, -85, 180, 85], toZoom(level)).map((feature) => {
    const [lng, lat] = feature.geometry.coordinates
    const members =
      'cluster_id' in feature.properties
        ? index
            .getLeaves(feature.properties.cluster_id, Infinity)
            .map((leaf) => spots[leaf.properties.index])
        : [spots[feature.properties.index]]
    return { spots: members, lat, lng }
  })
}

/** [west, south, east, north], 지도 SDK의 투영으로 구한 국내 지도 범위. */
export type MapBounds = [number, number, number, number]

export function containsMapBounds(outer: MapBounds, inner: MapBounds): boolean {
  return (
    outer[0] <= inner[0] && outer[1] <= inner[1] && outer[2] >= inner[2] && outer[3] >= inner[3]
  )
}

export function isInsideMapBounds(bounds: MapBounds, lat: number, lng: number): boolean {
  return lng >= bounds[0] && lat >= bounds[1] && lng <= bounds[2] && lat <= bounds[3]
}

// 화면 밖 재사용 결과가 줌/지역 이동마다 무한히 쌓이지 않게 제한한다.
const MAX_CACHED_GROUPS = 256
const MAX_CACHED_MEMBERS = 10_000

/**
 * 한 데이터 세대의 화면 조회기. 전국 인덱스는 그대로 사용하므로 팬해도 군집은 바뀌지 않는다.
 * 넓게 받은 마지막 좌표 결과와 실제 표시할 그룹/구성원 캐시는 분리한다.
 * yield 사이에서 구성원을 펼쳐 훅의 프레임 예산으로 나눠 처리할 수 있다.
 */
export function createMapClusterQuery(spots: MapSpot[]) {
  const groups = new Map<string, ClusterGroup>()
  let cachedMembers = 0
  let lastQuery: {
    bounds: MapBounds
    zoom: number
    features: ReturnType<Supercluster<SpotProps>['getClusters']>
  } | null = null

  return function* query(
    bounds: MapBounds,
    level: number,
    cacheBounds: MapBounds = bounds
  ): Generator<ClusterGroup, void> {
    const index = clusterIndex(spots)
    // level 1~3의 기존 UI는 군집 안의 개별 핀을 전부 표시한다. 군집 중심을 조회하면
    // 경계 안에 있는 구성원을 놓칠 수 있어, 이때는 원본 포인트 트리를 범위 조회한다.
    const zoom = level < 4 ? MAX_CLUSTER_ZOOM + 1 : toZoom(level)
    if (!lastQuery || lastQuery.zoom !== zoom || !containsMapBounds(lastQuery.bounds, bounds)) {
      const region = containsMapBounds(cacheBounds, bounds) ? cacheBounds : bounds
      lastQuery = { bounds: [...region], zoom, features: index.getClusters(region, zoom) }
    }

    for (const feature of lastQuery.features) {
      const [lng, lat] = feature.geometry.coordinates
      if (!isInsideMapBounds(bounds, lat, lng)) continue
      const props = feature.properties
      const key = 'cluster_id' in props ? `c:${props.cluster_id}` : `p:${props.index}`
      let group = groups.get(key)
      if (group) {
        // 마지막 사용 순서로 보관해 왕복 이동 때 같은 객체와 HTML을 재사용한다.
        groups.delete(key)
        groups.set(key, group)
      } else {
        const members =
          'cluster_id' in props
            ? index
                .getLeaves(props.cluster_id, Infinity)
                .map((leaf) => spots[leaf.properties.index])
            : [spots[props.index]]
        group = { lat, lng, spots: members }
        // 매우 큰 단일 군집은 현재 렌더에서만 보유한다. 원본 데이터/활성 오버레이는 유지된다.
        if (members.length <= MAX_CACHED_MEMBERS) {
          groups.set(key, group)
          cachedMembers += members.length
          while (groups.size > MAX_CACHED_GROUPS || cachedMembers > MAX_CACHED_MEMBERS) {
            const oldest = groups.keys().next().value!
            cachedMembers -= groups.get(oldest)!.spots.length
            groups.delete(oldest)
          }
        }
      }
      yield group
    }
  }
}

// 카카오 지도의 최대 확대(= 최소 레벨).
const MAX_ZOOM_LEVEL = 1

/**
 * 확대하면 이 클러스터가 갈라지는가.
 * 최대 줌에서도 한 묶음으로 남는(≈같은 좌표) 구성원은 아무리 확대해도 못 가른다.
 */
export function canSplitByZoom(spots: MapSpot[], level: number): boolean {
  return level > MAX_ZOOM_LEVEL && clusterSpots(spots, MAX_ZOOM_LEVEL).length > 1
}
