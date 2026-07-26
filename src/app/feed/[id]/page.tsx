'use client'

import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/ui/layout/Header'
import { LeftArrow } from '@/components/ui/button/LeftArrow'
import { MoreMenu } from '@/components/ui/button/MoreMenu'
import { Drawer } from '@/components/ui/layout/Drawer'
import { FeedCard } from '@/components/ui/card/FeedCard'
import { useFeedDetail } from '@/api/facades/feed'
import { useCurrentUser } from '@/api/facades/auth'
import { useSpotDetail } from '@/api/facades/spot'
import { useDeleteSpotRecord } from '@/api/facades/spot-record'
import { useDrawerStore } from '@/stores/useDrawerStore'
import { detailToFeedCardProps } from '@/lib/utils/spotRecordToFeed'

// 피드(공개) 상세. 게시된(PUBLISHED) 기록만 조회되며, DRAFT·없음이면 get1 이 404 → record 없음 처리.
// 소유자면 더보기(수정/삭제)를 페이지 헤더에 노출하고, 아니면 FeedCard 자체 더보기(신고하기)를 그대로 쓴다.
export default function FeedDetailPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const recordId = Number(id)
  const { data: record, isLoading } = useFeedDetail(recordId)
  const { data: currentUser } = useCurrentUser()
  const { data: spot } = useSpotDetail(record?.spot.id)
  const deleteRecord = useDeleteSpotRecord()
  const openDeleteConfirmDrawer = useDrawerStore((s) => s.openDeleteConfirmDrawer)

  const isOwner = !!record && !!currentUser && record.user.id === currentUser.id

  const handleDelete = () => {
    deleteRecord.mutate({ id: recordId }, { onSuccess: () => router.back() })
  }

  return (
    <div className="bg-bg-primary relative flex min-h-screen flex-col pb-12">
      <div className="h-14">
        <Header
          left={<LeftArrow />}
          center={<span className="text-[15px] font-medium">피드</span>}
          right={
            isOwner ? (
              <MoreMenu
                isOwner
                onEdit={() => router.push(`/record/${recordId}/edit`)}
                onDelete={() => openDeleteConfirmDrawer(handleDelete)}
              />
            ) : null
          }
        />
      </div>

      {isLoading ? (
        <p className="text-text-tertiary py-10 text-center text-sm">불러오는 중...</p>
      ) : !record ? (
        <p className="text-text-tertiary py-10 text-center text-sm">게시글을 찾을 수 없어요</p>
      ) : (
        <FeedCard
          {...detailToFeedCardProps(record)}
          showMoreMenu={!isOwner}
          spotSummary={
            spot
              ? {
                  name: record.spot.name,
                  recordCount: spot.recordCount,
                  address: spot.address ?? '',
                  onClick: () => router.push(`/spot/${record.spot.id}`),
                }
              : undefined
          }
        />
      )}

      <Drawer />
    </div>
  )
}
