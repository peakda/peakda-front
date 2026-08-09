import { keepPreviousData } from '@tanstack/react-query'
import {
  getSeasonalBloomsCalendar,
  getSeasonalBlooms,
  useGetSeasonalBloomsCalendar,
  useGetSeasonalBlooms,
} from '@/api/facades/generated/seasonal-bloom/seasonal-bloom'
import type {
  GetSeasonalBloomsCalendarParams,
  GetSeasonalBloomsParams,
} from '@/api/facades/generated/peakdaApi.schemas'

// 언랩 규칙: res.data (Orval 래퍼) → res.data.data (백엔드 실제 payload)

// bbox 미지정 시 호출을 막기 위한 더미 값. useBloomMap(null) 이면 enabled:false 로 요청하지 않는다.
const EMPTY_BBOX: GetSeasonalBloomsParams = { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 }

// ▷ plain async (이벤트 기반 호출) ─────────────────────────────────────────

export async function bloomMapApi(params: GetSeasonalBloomsParams) {
  const res = await getSeasonalBlooms(params)
  return res.data.data ?? null
}

export async function bloomCalendarApi(params: GetSeasonalBloomsCalendarParams) {
  const res = await getSeasonalBloomsCalendar(params)
  return res.data.data ?? null
}

// ▷ React Query hooks (캐싱 / 상태 관리) ───────────────────────────────────

export const useBloomMap = (params: GetSeasonalBloomsParams | null) =>
  useGetSeasonalBlooms(params ?? EMPTY_BBOX, {
    query: {
      enabled: params !== null,
      select: (res) => res.data.data ?? null,
      placeholderData: keepPreviousData,
    },
  })

// 명소 id·카테고리가 아직 없으면(동네 스팟이거나 상세 조회 대기) 요청하지 않는다.
const EMPTY_CALENDAR: GetSeasonalBloomsCalendarParams = { attractionId: 0, category: 'CHERRY' }

// 단일 명소×카테고리의 일별 개화 타임라인. 피드 상세의 '올해 만개 시기'에서 사용한다.
export const useBloomCalendar = (params: GetSeasonalBloomsCalendarParams | null) =>
  useGetSeasonalBloomsCalendar(params ?? EMPTY_CALENDAR, {
    query: { enabled: params !== null, select: (res) => res.data.data ?? null },
  })
