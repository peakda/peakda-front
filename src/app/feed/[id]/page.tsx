'use client'

import { useParams } from 'next/navigation'
import { Header } from '@/components/ui/layout/Header'
import { LeftArrow } from '@/components/ui/button/LeftArrow'
import { FeedCard } from '@/components/ui/card/FeedCard'
import { useFeedDetail } from '@/api/facades/feed'
import { detailToFeedCardProps } from '@/lib/utils/spotRecordToFeed'

// 피드(공개) 상세. 게시된(PUBLISHED) 기록만 조회되며, DRAFT·없음이면 get1 이 404 → record 없음 처리.
// 소유자 편집/삭제는 기록 관리 화면(/record/[id])에서 하고, 여기서는 공개 열람만 한다.
export default function FeedDetailPage() {
  const { id } = useParams<{ id: string }>()
  const recordId = Number(id)
  const { data: record, isLoading } = useFeedDetail(recordId)

  return (
    <div className="bg-bg-primary relative flex min-h-screen flex-col pb-12">
      <div className="h-14">
        <Header left={<LeftArrow />} center={<span className="text-[15px] font-medium">피드</span>} />
      </div>

      {isLoading ? (
        <p className="text-text-tertiary py-10 text-center text-sm">불러오는 중...</p>
      ) : !record ? (
        <p className="text-text-tertiary py-10 text-center text-sm">게시글을 찾을 수 없어요</p>
      ) : (
        <FeedCard {...detailToFeedCardProps(record)} />
      )}
    </div>
  )
}
