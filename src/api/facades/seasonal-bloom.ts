import { keepPreviousData } from '@tanstack/react-query'
import {
  getSeasonalBloomsCalendar,
  getSeasonalBlooms,
  getSeasonalBloomsPeak,
  useGetSeasonalBloomsCalendar,
  useGetSeasonalBlooms,
  useGetSeasonalBloomsPeak,
} from '@/api/facades/generated/seasonal-bloom/seasonal-bloom'
import type { GetSeasonalBloomsCalendarParams, GetSeasonalBloomsParams, GetSeasonalBloomsPeakParams } from '@/api/facades/generated/peakdaApi.schemas'

// ?몃옒??洹쒖튃: res.data (Orval ?섑띁) ??res.data.data (諛깆뿏???ㅼ젣 payload)

// bbox 誘몄?鍮????몄텧??留됯린 ?꾪븳 ?붾? ??useBloomMap(null) ?대㈃ enabled:false 濡??붿껌?섏? ?딅뒗??
const EMPTY_BBOX: GetSeasonalBloomsParams = { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 }

// ??? plain async (?대깽??湲곕컲 ?몄텧) ???????????????????????????????????????????

export async function bloomMapApi(params: GetSeasonalBloomsParams) {
  const res = await getSeasonalBlooms(params)
  return res.data.data ?? null
}

export async function bloomPeakApi(params?: GetSeasonalBloomsPeakParams) {
  const res = await getSeasonalBloomsPeak(params)
  return res.data.data ?? null
}

export async function bloomCalendarApi(params: GetSeasonalBloomsCalendarParams) {
  const res = await getSeasonalBloomsCalendar(params)
  return res.data.data ?? null
}

// ??? React Query hooks (罹먯떛 / ?곹깭 愿由? ????????????????????????????????????

export const useBloomMap = (params: GetSeasonalBloomsParams | null) =>
  useGetSeasonalBlooms(params ?? EMPTY_BBOX, {
    query: {
      enabled: params !== null,
      select: (res) => res.data.data ?? null,
      placeholderData: keepPreviousData,
    },
  })

export const useBloomPeak = (params?: GetSeasonalBloomsPeakParams) =>
  useGetSeasonalBloomsPeak(params, { query: { select: (res) => res.data.data ?? null } })

export const useBloomCalendar = (params: GetSeasonalBloomsCalendarParams) =>
  useGetSeasonalBloomsCalendar(params, { query: { select: (res) => res.data.data ?? null } })
