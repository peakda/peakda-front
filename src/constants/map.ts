import type { BloomSlotCategory, BloomSlotStatus } from '@/api/generated/peakdaApi.schemas'

export type Stage = 'Before' | 'Start' | 'Peak'

export const STAGE_COLOR: Record<Stage, string> = {
  Before: '#a8b0bc',
  Start: '#ff7f92',
  Peak: '#f7576b',
}

export const STAGE_PRIORITY: Record<Stage, number> = { Before: 0, Start: 1, Peak: 2 }

// 개화 상태 → 핀 단계 (ENDED 는 API 응답에서 제외되지만 타입상 채움)
export const STATUS_STAGE: Record<BloomSlotStatus, Stage> = {
  PREPARING: 'Before',
  STARTED: 'Start',
  PEAK: 'Peak',
  ENDED: 'Before',
}

// 꽃 카테고리 → 핀 아이콘 (PINK_MUHLY/SILVERGRASS 는 전용 에셋이 없어 임시 fallback)
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
