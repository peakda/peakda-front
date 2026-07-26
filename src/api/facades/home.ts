import { useSuggestion } from '@/api/facades/generated/home/home'

// 언랩 규칙: res.data (Orval 래퍼) → res.data.data (백엔드 실제 payload)

// 홈 검색바 시즌 추천어. available=false 이면 message 가 null 이다.
export const useHomeSuggestion = () =>
  useSuggestion({ query: { select: (res) => res.data.data ?? null } })
