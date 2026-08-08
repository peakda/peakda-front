import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'
import {
  getSearchSpots,
  getSearchUsers,
  useGetSearchSpots as useSearchSpotsGen,
  useGetSearchUsers as useSearchUsersGen,
  useGetSearchTrending,
} from '@/api/facades/generated/search/search'
import { PAGE_SIZE, nextPageParam } from '@/api/facades/pagination'

// 언랩 규칙: res.data (Orval 래퍼) → res.data.data (백엔드 실제 payload)

const PAGE = { page: 0, size: PAGE_SIZE }

// ▷ plain async (이벤트 기반 호출) ─────────────────────────────────────────

export async function searchSpotsApi(q: string, page: number) {
  const res = await getSearchSpots({ q, pageRequest: { page, size: PAGE_SIZE } })
  return res.data.data ?? null
}

export async function searchUsersApi(q: string, page: number) {
  const res = await getSearchUsers({ q, pageRequest: { page, size: PAGE_SIZE } })
  return res.data.data ?? null
}

// ▷ React Query hooks (캐싱 / 상태 관리) ───────────────────────────────────

// 찜 많은 순 인기 스팟(트렌딩). 검색 화면의 "지금 많이 찾는" 칩에 사용.
export const useTrendingSpots = () =>
  useGetSearchTrending({ query: { select: (res) => res.data.data ?? null } })

// 스팟명 부분일치 검색. keyword 가 비면 요청하지 않는다.
export const useSearchSpots = (keyword: string) =>
  useSearchSpotsGen(
    { q: keyword, pageRequest: PAGE },
    {
      query: {
        enabled: keyword.length > 0,
        select: (res) => res.data.data ?? null,
        placeholderData: keepPreviousData,
      },
    }
  )

// 닉네임 부분일치 검색. keyword 가 비면 요청하지 않는다.
export const useSearchUsers = (keyword: string) =>
  useSearchUsersGen(
    { q: keyword, pageRequest: PAGE },
    {
      query: {
        enabled: keyword.length > 0,
        select: (res) => res.data.data ?? null,
        placeholderData: keepPreviousData,
      },
    }
  )

// 무한 스크롤용. keyword 가 바뀌면 페이지가 처음부터 다시 쌓인다.
// 입력 중 목록이 깜빡이지 않도록 이전 키워드 결과를 잠시 유지한다.

export const useSearchSpotsInfinite = (keyword: string) =>
  useInfiniteQuery({
    queryKey: ['/api/search/spots', 'infinite', keyword],
    queryFn: ({ pageParam }) => searchSpotsApi(keyword, pageParam),
    initialPageParam: 0,
    getNextPageParam: nextPageParam,
    enabled: keyword.length > 0,
    placeholderData: keepPreviousData,
  })

export const useSearchUsersInfinite = (keyword: string) =>
  useInfiniteQuery({
    queryKey: ['/api/search/users', 'infinite', keyword],
    queryFn: ({ pageParam }) => searchUsersApi(keyword, pageParam),
    initialPageParam: 0,
    getNextPageParam: nextPageParam,
    enabled: keyword.length > 0,
    placeholderData: keepPreviousData,
  })
