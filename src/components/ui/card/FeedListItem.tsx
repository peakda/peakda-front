'use client'

import { memo } from 'react'
import { FeedCard } from '@/components/ui/card/FeedCard'
import { toFeedCardProps } from '@/lib/utils/spotRecordToFeed'
import type { SpotRecordSummaryResponse } from '@/api/facades/generated/peakdaApi.schemas'

export interface FeedListItemProps {
  record: SpotRecordSummaryResponse
  isOwner: boolean
  // 콜백은 id 를 인자로 받는다. 목록 쪽에서 아이템마다 새 클로저를 만들면
  // props 가 매번 달라져 memo 가 무력화되기 때문.
  onOpen?: (id: number) => void
  onEdit: (id: number) => void
  onDelete: (id: number) => void
}

// 무한 스크롤로 수백 개가 쌓이는 목록용. record 객체는 쿼리 캐시에서 동일 참조로 유지되므로
// 부모가 다시 렌더돼도(탭 전환, currentUser 도착 등) 내용이 안 바뀐 카드는 건너뛴다.
export const FeedListItem = memo(function FeedListItem({
  record,
  isOwner,
  onOpen,
  onEdit,
  onDelete,
}: FeedListItemProps) {
  return (
    <FeedCard
      {...toFeedCardProps(record, {
        isOwner,
        onEdit: () => onEdit(record.id),
        onDelete: () => onDelete(record.id),
      })}
      onOpen={onOpen && (() => onOpen(record.id))}
    />
  )
})
