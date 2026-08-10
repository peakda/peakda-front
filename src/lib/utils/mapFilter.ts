import type { BloomSlotCategory, BloomSlotStatus } from '@/api/facades/generated/peakdaApi.schemas'
import type { MapSpot } from '@/hooks/useMapPins'
import type { PinTypeFilter } from '@/stores/useFilterStore'

interface MapSpotFilter {
  pinType: PinTypeFilter
  statuses: BloomSlotStatus[]
  /** 서버 category 파라미터는 값 하나만 받으므로 복수 선택은 여기서 거른다 */
  categories: BloomSlotCategory[]
}

/**
 * 지도 핀 클라이언트 필터.
 * 핀 유형(전체/명소/동네)·개화 상태·꽃 종류를 응답을 받아 여기서 거른다.
 * 핀 하나에 꽃이 여러 개일 수 있으므로 statuses·categories 는 "하나라도 해당" 이면 통과시킨다.
 */
export function filterMapSpots(spots: MapSpot[], filter: MapSpotFilter): MapSpot[] {
  const { pinType, statuses, categories } = filter
  // 거를 조건이 없으면 같은 배열을 그대로 돌려줘 불필요한 재렌더를 막는다.
  if (pinType === 'ALL' && statuses.length === 0 && categories.length === 0) return spots

  return spots.filter((spot) => {
    if (pinType !== 'ALL' && spot.type !== pinType) return false
    if (statuses.length > 0 && !spot.statuses.some((status) => statuses.includes(status))) {
      return false
    }
    if (categories.length > 0 && !spot.categories.some((category) => categories.includes(category))) {
      return false
    }
    return true
  })
}
