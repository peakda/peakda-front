import type { BloomSlotCategory, BloomSlotStatus } from '@/api/facades/generated/peakdaApi.schemas'

export type Stage = 'Before' | 'Start' | 'Peak' | 'End'

// 개화 단계 색(디자인 확정): 개화 전 gray-400 → 시작 pink-200 → 절정 pink-400 → 종료 pink-600
export const STAGE_COLOR: Record<Stage, string> = {
  Before: '#a8b0bc',
  Start: '#ffa8b4',
  Peak: '#f7576b',
  End: '#c41f33',
}

export const STAGE_LABEL: Record<Stage, string> = {
  Before: '개화 전',
  Start: '개화 시작',
  Peak: '만개',
  End: '개화 종료',
}

// 한 핀에 꽃이 여러 개면 우선순위가 가장 높은 단계로 핀 색을 정한다.
// End 를 Before 보다 위에 둬야 모든 꽃이 ENDED 인 핀이 Before 로 접히지 않는다.
export const STAGE_PRIORITY: Record<Stage, number> = { Before: 0, End: 1, Start: 2, Peak: 3 }

// 개화 상태(API) → 핀 단계. 4개 상태를 1:1 로 매핑한다.
export const STATUS_STAGE: Record<BloomSlotStatus, Stage> = {
  PREPARING: 'Before',
  STARTED: 'Start',
  PEAK: 'Peak',
  ENDED: 'End',
}

// 꽃 여러 개의 상태 → 핀 색을 정할 대표 단계.
// 응답 변환(bloomToMapSpots)과 꽃 필터(mapFilter) 양쪽이 쓴다. 두 곳이 갈리면
// 필터를 걸었을 때 핀 색만 옛 기준으로 남으므로 계산은 여기 한 곳에만 둔다.
export function toMaxStage(statuses: BloomSlotStatus[]): Stage {
  return statuses.reduce<Stage>((max, status) => {
    const stage = STATUS_STAGE[status]
    return STAGE_PRIORITY[stage] > STAGE_PRIORITY[max] ? stage : max
  }, 'Before')
}

// 苑?移댄뀒怨좊━ ??? ?꾩씠肄?(PINK_MUHLY/SILVERGRASS ???꾩슜 ?먯뀑???놁뼱 ?꾩떆 fallback)
export const CATEGORY_ICON: Record<BloomSlotCategory, string> = {
  PLUM: '/flowers/plum.webp',
  FORSYTHIA: '/flowers/forsythia.webp',
  AZALEA_KR: '/flowers/azalea.webp',
  CHERRY: '/flowers/cherry-blossom.webp',
  CANOLA: '/flowers/canola.webp',
  AZALEA: '/flowers/royal-azalea.webp',
  HYDRANGEA: '/flowers/hydrangea.webp',
  LOTUS: '/flowers/lotus.webp',
  SUNFLOWER: '/flowers/sunflower.webp',
  COSMOS: '/flowers/cosmos.webp',
  CHRYSANTHEMUM: '/flowers/Chrysanthemum.webp',
  PINK_MUHLY: '/flowers/cosmos.webp',
  SILVERGRASS: '/flowers/SilverGrass.webp',
  MAPLE: '/flowers/maple.webp',
  CAMELLIA: '/flowers/camellia.webp',
}
