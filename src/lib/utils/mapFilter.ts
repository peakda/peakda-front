import type { BloomSlotCategory, BloomSlotStatus } from '@/api/facades/generated/peakdaApi.schemas'
import type { MapSpot } from '@/hooks/useMapPins'
import type { PinTypeFilter } from '@/stores/useFilterStore'
import { toMaxStage } from '@/constants/map'

interface MapSpotFilter {
  pinType: PinTypeFilter
  statuses: BloomSlotStatus[]
  /** 서버 category 파라미터는 값 하나만 받으므로 복수 선택은 여기서 거른다 */
  categories: BloomSlotCategory[]
}

/**
 * 고른 꽃만 남긴 핀으로 좁힌다. 남는 꽃이 없으면 null(=핀 제외).
 *
 * 핀을 통과시키기만 하고 끝내면, 벚꽃으로 걸러도 같은 핀에 달린 단풍 아이콘이 그대로 뜨고
 * 핀 색도 단풍 기준으로 칠해진다. flowers·statuses·categories 는 꽃 순서가 같은 병렬 배열이라
 * 같은 인덱스로 함께 좁히고, 핀 색(maxStage)도 남은 꽃 기준으로 다시 계산한다.
 */
function narrowToCategories(spot: MapSpot, categories: BloomSlotCategory[]): MapSpot | null {
  const kept = spot.categories.flatMap((category, i) => (categories.includes(category) ? [i] : []))
  if (kept.length === 0) return null
  // 전부 남으면 새 객체를 만들지 않는다 — 참조가 바뀌면 지도가 불필요하게 다시 그려진다.
  if (kept.length === spot.categories.length) return spot

  const statuses = kept.map((i) => spot.statuses[i])
  return {
    ...spot,
    flowers: kept.map((i) => spot.flowers[i]),
    statuses,
    categories: kept.map((i) => spot.categories[i]),
    maxStage: toMaxStage(statuses),
  }
}

/**
 * 지도 핀 클라이언트 필터.
 * 핀 유형(전체/명소/동네)·개화 상태·꽃 종류를 응답을 받아 여기서 거른다.
 *
 * 꽃 종류를 고르면 핀을 남길지 뿐 아니라 핀이 보여줄 꽃까지 그 선택으로 좁힌다.
 * 개화 상태는 좁히고 남은 꽃 기준으로 본다 — 둘 다 걸면 "고른 꽃이 그 상태인 핀"이 된다.
 */
export function filterMapSpots(spots: MapSpot[], filter: MapSpotFilter): MapSpot[] {
  const { pinType, statuses, categories } = filter
  // 거를 조건이 없으면 같은 배열을 그대로 돌려줘 불필요한 재렌더를 막는다.
  if (pinType === 'ALL' && statuses.length === 0 && categories.length === 0) return spots

  return spots.flatMap((spot) => {
    if (pinType !== 'ALL' && spot.type !== pinType) return []

    const narrowed = categories.length > 0 ? narrowToCategories(spot, categories) : spot
    if (narrowed == null) return []

    if (statuses.length > 0 && !narrowed.statuses.some((status) => statuses.includes(status))) {
      return []
    }
    return [narrowed]
  })
}
