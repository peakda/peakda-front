import { useTrending } from '@/api/facades/generated/search/search'

// 언랩 규칙: res.data (Orval 래퍼) → res.data.data (백엔드 실제 payload)

// 찜 많은 순 인기 스팟(트렌딩). 검색 화면의 "지금 많이 찾는" 칩에 사용.
export const useTrendingSpots = () =>
  useTrending({ query: { select: (res) => res.data.data ?? null } })
