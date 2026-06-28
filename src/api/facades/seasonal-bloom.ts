import { keepPreviousData } from '@tanstack/react-query'
import {
  calendar,
  map,
  peak,
  useCalendar,
  useMap,
  usePeak,
} from '@/api/facades/generated/seasonal-bloom/seasonal-bloom'
import type { CalendarParams, MapParams, PeakParams } from '@/api/facades/generated/peakdaApi.schemas'

// ?몃옒??洹쒖튃: res.data (Orval ?섑띁) ??res.data.data (諛깆뿏???ㅼ젣 payload)

// bbox 誘몄?鍮????몄텧??留됯린 ?꾪븳 ?붾? ??useBloomMap(null) ?대㈃ enabled:false 濡??붿껌?섏? ?딅뒗??
const EMPTY_BBOX: MapParams = { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 }

// ??? plain async (?대깽??湲곕컲 ?몄텧) ???????????????????????????????????????????

export async function bloomMapApi(params: MapParams) {
  const res = await map(params)
  return res.data.data ?? null
}

export async function bloomPeakApi(params?: PeakParams) {
  const res = await peak(params)
  return res.data.data ?? null
}

export async function bloomCalendarApi(params: CalendarParams) {
  const res = await calendar(params)
  return res.data.data ?? null
}

// ??? React Query hooks (罹먯떛 / ?곹깭 愿由? ????????????????????????????????????

export const useBloomMap = (params: MapParams | null) =>
  useMap(params ?? EMPTY_BBOX, {
    query: {
      enabled: params !== null,
      select: (res) => res.data.data ?? null,
      placeholderData: keepPreviousData,
    },
  })

export const useBloomPeak = (params?: PeakParams) =>
  usePeak(params, { query: { select: (res) => res.data.data ?? null } })

export const useBloomCalendar = (params: CalendarParams) =>
  useCalendar(params, { query: { select: (res) => res.data.data ?? null } })
