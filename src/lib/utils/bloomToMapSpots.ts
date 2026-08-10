import type { BloomMapResponse } from '@/api/facades/generated/peakdaApi.schemas'
import type { MapSpot } from '@/hooks/useMapPins'
import { CATEGORY_ICON, STATUS_STAGE, STAGE_PRIORITY, type Stage } from '@/constants/map'

// 지도 개화현황 응답 → 핀 데이터. 좌표 없는 명소는 제외한다.
export function bloomToMapSpots(data: BloomMapResponse): MapSpot[] {
  return (data.pins ?? []).flatMap((a) => {
    if (a.latitude == null || a.longitude == null) return []

    const flowers = a.blooms.map((b) => ({ src: CATEGORY_ICON[b.category], alt: b.displayName }))
    const maxStage = a.blooms.reduce<Stage>((max, b) => {
      const stage = STATUS_STAGE[b.status]
      return STAGE_PRIORITY[stage] > STAGE_PRIORITY[max] ? stage : max
    }, 'Before')

    return [
      {
        lat: a.latitude,
        lng: a.longitude,
        flowers,
        maxStage,
        title: a.name,
        attractionId: a.attractionId ?? undefined,
        spotId: a.spotId ?? undefined,
        // 상단 칩·시기·꽃 종류 필터는 서버가 거를 수 없어 클라이언트에서 쓴다.
        // (꽃 종류는 서버 category 가 단일 값이라 복수 선택을 지원하려면 클라 필터가 필요하다)
        type: a.type,
        statuses: a.blooms.map((b) => b.status),
        categories: a.blooms.map((b) => b.category),
      },
    ]
  })
}
