import {
  calendar,
  map,
  peak,
  useCalendar,
  useMap,
  usePeak,
} from '@/api/generated/seasonal-bloom/seasonal-bloom'
import type { CalendarParams, MapParams, PeakParams } from '@/api/generated/peakdaApi.schemas'

// 언래핑 규칙: res.data (Orval 래퍼) → res.data.data (백엔드 실제 payload)

// bbox 미준비 시 호출을 막기 위한 더미 — useBloomMap(null) 이면 enabled:false 로 요청하지 않는다.
const EMPTY_BBOX: MapParams = { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 }

// ─── plain async (이벤트 기반 호출) ───────────────────────────────────────────

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

// ─── React Query hooks (캐싱 / 상태 관리) ────────────────────────────────────

export const useBloomMap = (params: MapParams | null) =>
  useMap(params ?? EMPTY_BBOX, {
    query: { enabled: params !== null, select: (res) => res.data.data ?? null },
  })

export const useBloomPeak = (params?: PeakParams) =>
  usePeak(params, { query: { select: (res) => res.data.data ?? null } })

export const useBloomCalendar = (params: CalendarParams) =>
  useCalendar(params, { query: { select: (res) => res.data.data ?? null } })
