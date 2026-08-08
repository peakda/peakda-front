import { useInfiniteQuery } from '@tanstack/react-query'
import {
  getExploreSpots,
  useGetExplore,
  useGetExploreFestivals,
} from '@/api/facades/generated/explore/explore'
import type {
  GetExploreFestivalsParams,
  GetExploreParams,
  GetExploreSpotsParams,
  GetExploreSpotsSection,
  GetExploreSpotsCategory,
} from '@/api/facades/generated/peakdaApi.schemas'
import { PAGE_SIZE, nextPageParam } from '@/api/facades/pagination'

// 언랩 규칙: res.data (Orval 래퍼) → res.data.data (백엔드 실제 payload)

export async function exploreSpotsApi(params: GetExploreSpotsParams) {
  const res = await getExploreSpots(params)
  return res.data.data ?? null
}

// 탐색 큐레이션 — 절정/다음 주/축제/큐레이션 4개 섹션을 한 번에 준다.
export const useExploreCuration = (params?: GetExploreParams) =>
  useGetExplore(params, { query: { select: (res) => res.data.data ?? null } })

// 탐색 스팟 섹션 전체 보기 — section(PEAK_NOW | NEXT_WEEK) 필수.
// 무한 스크롤용. category 가 바뀌면 페이지가 처음부터 다시 쌓인다.
export const useExploreSpotsInfinite = (
  section: GetExploreSpotsSection,
  category?: GetExploreSpotsCategory
) =>
  useInfiniteQuery({
    queryKey: ['/api/explore/spots', 'infinite', section, category ?? null],
    queryFn: ({ pageParam }) =>
      exploreSpotsApi({ section, category, pageRequest: { page: pageParam, size: PAGE_SIZE } }),
    initialPageParam: 0,
    getNextPageParam: nextPageParam,
  })

// 진행 중 꽃축제 전체 보기 — 페이징 없이 전량.
export const useExploreFestivals = (params?: GetExploreFestivalsParams) =>
  useGetExploreFestivals(params, { query: { select: (res) => res.data.data ?? null } })
