'use client'

import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/ui/layout/Header'
import LeftArrow from '@/components/ui/button/LeftArrow'
import { FeedCard } from '@/components/ui/card/FeedCard'
import { useSpotRecord, useDeleteSpotRecord } from '@/api/facades/spot-record'
import { useCurrentUser } from '@/api/facades/auth'
import { detailToFeedCardProps } from '@/lib/utils/spotRecordToFeed'

export default function RecordDetailPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const recordId = Number(id)

  const { data: record, isLoading } = useSpotRecord(recordId)
  const { data: currentUser } = useCurrentUser()
  const deleteRecord = useDeleteSpotRecord()

  const isOwner = !!record && !!currentUser && record.user.id === currentUser.id

  const handleDelete = () => {
    if (!window.confirm('이 기록을 삭제할까요?')) return
    deleteRecord.mutate({ id: recordId }, { onSuccess: () => router.back() })
  }

  return (
    <div className="bg-bg-primary relative flex min-h-screen flex-col pb-12">
      <div className="h-14">
        <Header left={<LeftArrow />} center={<span className="text-[15px] font-medium">기록</span>} />
      </div>

      {isLoading ? (
        <p className="text-text-tertiary py-10 text-center text-sm">불러오는 중...</p>
      ) : !record ? (
        <p className="text-text-tertiary py-10 text-center text-sm">기록을 찾을 수 없어요</p>
      ) : (
        <FeedCard
          {...detailToFeedCardProps(record, {
            isOwner,
            onEdit: () => router.push(`/record/${recordId}/edit`),
            onDelete: handleDelete,
          })}
        />
      )}
    </div>
  )
}
