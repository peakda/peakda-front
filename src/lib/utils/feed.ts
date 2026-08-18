import {
  GetFeedFilter,
  CreateReportRequestTargetType,
} from '@/api/facades/generated/peakdaApi.schemas'
import type {
  CreateReportRequest,
  CreateReportRequestReason,
  FeedReactionSummaryResponse,
  FeedReactionSummaryResponseMyReactionsItem,
  ReactionSummary,
} from '@/api/facades/generated/peakdaApi.schemas'

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

// 내 리액션 목록에 해당 타입이 있으면 제거, 없으면 추가
export function reactionToggleAction(
  myReactions: FeedReactionSummaryResponseMyReactionsItem[],
  type: FeedReactionSummaryResponseMyReactionsItem
): 'add' | 'remove' {
  return myReactions.includes(type) ? 'remove' : 'add'
}

// 리액션 mutation 응답 → 조회 응답과 같은 리액션 요약 형태 (응답 payload 가 비면 빈 요약)
export function toReactionSummary(response?: FeedReactionSummaryResponse | null): ReactionSummary {
  return {
    counts: response?.counts ?? [],
    myReactions: response?.myReactions ?? [],
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
