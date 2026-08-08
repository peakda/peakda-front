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

// 苑?移댄뀒怨좊━ ??? ?꾩씠肄?(PINK_MUHLY/SILVERGRASS ???꾩슜 ?먯뀑???놁뼱 ?꾩떆 fallback)
export const CATEGORY_ICON: Record<BloomSlotCategory, string> = {
  PLUM: '/flowers/plum.svg',
  FORSYTHIA: '/flowers/forsythia.svg',
  AZALEA_KR: '/flowers/royal-azalea.svg',
  CHERRY: '/flowers/cherry-blossom.svg',
  CANOLA: '/flowers/canola.svg',
  AZALEA: '/flowers/azalea.svg',
  HYDRANGEA: '/flowers/hydrangea.svg',
  LOTUS: '/flowers/lotus.svg',
  COSMOS: '/flowers/cosmos.svg',
  PINK_MUHLY: '/flowers/cosmos.svg',
  SILVERGRASS: '/flowers/maple.svg',
  MAPLE: '/flowers/maple.svg',
  CAMELLIA: '/flowers/camellia.svg',
}
