import type { FeedReactionSummaryResponseMyReactionsItem } from '@/api/facades/generated/peakdaApi.schemas'

export interface ReactionItem {
  type: FeedReactionSummaryResponseMyReactionsItem
  /** v2 반응 API 의 이모지 키. 서버가 v1 타입과 같은 반응으로 처리한다 */
  key: string
  emoji: string
  /** 스크린리더용 이름 (aria-label) */
  label: string
}

// v1 응답(스팟 기록)이 알려주는 반응 — ❤️·😀 뿐이다. 스팟 기록 응답이 v2 로 바뀌면 지운다.
export const REACTIONS: ReactionItem[] = [
  { type: 'HEART', key: 'u:2764-fe0f', emoji: '❤️', label: '하트' },
  { type: 'SMILE', key: 'u:1f600', emoji: '😀', label: '웃음' },
]

// 이모지 피커 탭. group 은 카탈로그 응답의 Unicode 그룹 이름과 정확히 같아야 한다.
export const EMOJI_GROUPS = [
  { group: 'Smileys & Emotion', label: '표정' },
  { group: 'People & Body', label: '사람' },
  { group: 'Animals & Nature', label: '자연' },
  { group: 'Food & Drink', label: '음식' },
  { group: 'Travel & Places', label: '여행' },
  { group: 'Activities', label: '활동' },
  { group: 'Objects', label: '사물' },
  { group: 'Symbols', label: '기호' },
  { group: 'Flags', label: '깃발' },
]
