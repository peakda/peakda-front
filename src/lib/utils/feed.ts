import {
  GetFeedFilter,
  CreateReportRequestTargetType,
} from '@/api/facades/generated/peakdaApi.schemas'
import type {
  CreateReportRequest,
  CreateReportRequestReason,
  ReactionItemResponse,
  ReactionOverviewResponse,
  ReactionStateResponse,
  ReactionSummary,
} from '@/api/facades/generated/peakdaApi.schemas'
import { REACTIONS } from '@/constants/reaction'

export type ReactionAction = 'add' | 'remove'
export type ReactionEmoji = Pick<ReactionItemResponse, 'key' | 'emoji'>

// 카테고리 탭 라벨 → 피드 필터
export function filterFromTab(tabLabel: string): GetFeedFilter {
  switch (tabLabel) {
    case '관심 식물':
      return GetFeedFilter.INTEREST
    case '팔로잉':
      return GetFeedFilter.FOLLOWING
    default:
      return GetFeedFilter.ALL
  }
}

// 스팟 기록 응답은 아직 v1 형식(❤️·😀 집계)이다. 피드 응답은 v2 형식이다.
export function isLegacyReactions(
  reactions: ReactionSummary | ReactionOverviewResponse
): reactions is ReactionSummary {
  return 'counts' in reactions
}

// 두 형식을 v2 형식으로 맞춘다. 서버가 ❤️·😀 를 v1·v2 에서 같은 반응으로 처리하므로 키만 옮기면 된다.
export function toReactionOverview(
  reactions: ReactionSummary | ReactionOverviewResponse
): ReactionOverviewResponse {
  if (!isLegacyReactions(reactions)) return reactions
  return {
    items: REACTIONS.flatMap(({ type, key, emoji }) => {
      const count = reactions.counts.find((c) => c.reactionType === type)?.count ?? 0
      const reactedByMe = reactions.myReactions.includes(type)
      return count > 0 || reactedByMe ? [{ key, emoji, count, reactedByMe }] : []
    }),
    hasMore: false,
  }
}

// 리액션을 누른 직후 서버 응답 전에 보여줄 상태 (낙관적 업데이트). 응답이 오면 mergeReactionState 로 맞춘다.
export function applyReactionToggle(
  overview: ReactionOverviewResponse,
  { key, emoji }: ReactionEmoji,
  action: ReactionAction
): ReactionOverviewResponse {
  const reactedByMe = action === 'add'
  const current = overview.items.find((item) => item.key === key)
  if (!current) {
    // 상위 8종 밖의 반응을 취소하면 화면에 바꿀 칩이 없다.
    return reactedByMe
      ? { ...overview, items: [...overview.items, { key, emoji, count: 1, reactedByMe }] }
      : overview
  }
  const count = Math.max(0, current.count + (reactedByMe ? 1 : -1))
  return {
    ...overview,
    items: overview.items.flatMap((item) => {
      if (item.key !== key) return [item]
      return count > 0 ? [{ ...item, count, reactedByMe }] : []
    }),
  }
}

// 반응 추가·취소 응답은 해당 이모지 1건만 준다. 그 칩만 서버 값으로 맞추고, 0명이면 칩을 뺀다.
export function mergeReactionState(
  overview: ReactionOverviewResponse,
  state?: ReactionStateResponse | null
): ReactionOverviewResponse {
  if (!state) return overview
  const { key, emoji, count, reactedByMe } = state
  const next = { key, emoji, count, reactedByMe }
  const exists = overview.items.some((item) => item.key === key)
  if (count === 0) return { ...overview, items: overview.items.filter((item) => item.key !== key) }
  return {
    ...overview,
    items: exists
      ? overview.items.map((item) => (item.key === key ? next : item))
      : [...overview.items, next],
  }
}

// 스팟 기록 신고 요청 페이로드 생성 (V1 은 SPOT_RECORD 만 지원)
export function buildReportRequest(
  recordId: number,
  reason: CreateReportRequestReason,
  detail?: string | null
): CreateReportRequest {
  return {
    targetType: CreateReportRequestTargetType.SPOT_RECORD,
    targetId: recordId,
    reason,
    ...(detail != null ? { detail } : {}),
  }
}
