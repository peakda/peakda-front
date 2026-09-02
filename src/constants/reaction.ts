import type { FeedReactionSummaryResponseMyReactionsItem } from '@/api/facades/generated/peakdaApi.schemas'

export interface ReactionItem {
  type: FeedReactionSummaryResponseMyReactionsItem
  emoji: string
  /** 스크린리더용 이름 (aria-label) */
  label: string
}

// 리액션 목록의 단일 출처 — 리액션 바 칩과 "반응 추가" 바텀시트가 모두 이 배열을 그린다.
// 종류를 늘릴 때는 여기에 한 줄만 추가하면 되고(백엔드 enum 에도 같은 타입이 있어야 한다),
// 시트 그리드는 개수에 맞춰 늘어나며 넘치는 만큼만 스크롤된다.
export const REACTIONS: ReactionItem[] = [
  { type: 'HEART', emoji: '❤️', label: '하트' },
  { type: 'SMILE', emoji: '😀', label: '웃음' },
]
