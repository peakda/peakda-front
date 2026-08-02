import {
  useGetExplore,
  useGetExploreFestivals,
  useGetExploreSpots,
} from '@/api/facades/generated/explore/explore'
import type {
  GetExploreFestivalsParams,
  GetExploreParams,
  GetExploreSpotsParams,
} from '@/api/facades/generated/peakdaApi.schemas'

// 언랩 규칙: res.data (Orval 래퍼) → res.data.data (백엔드 실제 payload)

// 탐색 큐레이션 — 절정/다음 주/축제/큐레이션 4개 섹션을 한 번에 준다.
export const useExploreCuration = (params?: GetExploreParams) =>
  useGetExplore(params, { query: { select: (res) => res.data.data ?? null } })

// 탐색 스팟 섹션 전체 보기 — section(PEAK_NOW | NEXT_WEEK)과 pageRequest 필수.
export const useExploreSpots = (params: GetExploreSpotsParams) =>
  useGetExploreSpots(params, { query: { select: (res) => res.data.data ?? null } })

// 진행 중 꽃축제 전체 보기 — 페이징 없이 전량.
export const useExploreFestivals = (params?: GetExploreFestivalsParams) =>
  useGetExploreFestivals(params, { query: { select: (res) => res.data.data ?? null } })
