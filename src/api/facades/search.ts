import { keepPreviousData } from '@tanstack/react-query'
import {
  useGetSearchSpots as useSearchSpotsGen,
  useGetSearchUsers as useSearchUsersGen,
  useGetSearchTrending,
} from '@/api/facades/generated/search/search'

// 언랩 규칙: res.data (Orval 래퍼) → res.data.data (백엔드 실제 payload)

const PAGE = { page: 0, size: 20 }

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
