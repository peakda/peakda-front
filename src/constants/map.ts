import type { BloomSlotCategory, BloomSlotStatus } from '@/api/facades/generated/peakdaApi.schemas'

export type Stage = 'Before' | 'Start' | 'Peak'

export const STAGE_COLOR: Record<Stage, string> = {
  Before: '#a8b0bc',
  Start: '#ff7f92',
  Peak: '#f7576b',
}

export const STAGE_PRIORITY: Record<Stage, number> = { Before: 0, Start: 1, Peak: 2 }

// 媛쒗솕 ?곹깭 ??? ?④퀎 (ENDED ??API ?묐떟?먯꽌 ?쒖쇅?섏?留???낆긽 梨꾩?)
export const STATUS_STAGE: Record<BloomSlotStatus, Stage> = {
  PREPARING: 'Before',
  STARTED: 'Start',
  PEAK: 'Peak',
  ENDED: 'Before',
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
