import {
  List4Filter,
  CreateReportRequestTargetType,
} from '@/api/facades/generated/peakdaApi.schemas'
import type {
  CreateReportRequest,
  CreateReportRequestReason,
  FeedReactionSummaryResponseMyReactionsItem,
} from '@/api/facades/generated/peakdaApi.schemas'

// 카테고리 탭 라벨 → 피드 필터
export function filterFromTab(tabLabel: string): List4Filter {
  switch (tabLabel) {
    case '관심 식물':
      return List4Filter.INTEREST
    case '팔로잉':
      return List4Filter.FOLLOWING
    default:
      return List4Filter.ALL
  }
}

// 내 리액션 목록에 해당 타입이 있으면 제거, 없으면 추가
export function reactionToggleAction(
  myReactions: FeedReactionSummaryResponseMyReactionsItem[],
  type: FeedReactionSummaryResponseMyReactionsItem
): 'add' | 'remove' {
  return myReactions.includes(type) ? 'remove' : 'add'
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
