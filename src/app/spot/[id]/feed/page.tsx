'use client'

import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/ui/layout/Header'
import { LeftArrow } from '@/components/ui/button/LeftArrow'
import { FeedCard } from '@/components/ui/card/FeedCard'
import { Drawer } from '@/components/ui/layout/Drawer'
import { useSpotRecordsBySpot, useDeleteSpotRecord } from '@/api/facades/spot-record'
import { useSpotDetail } from '@/api/facades/spot'
import { useCurrentUser } from '@/api/facades/auth'
import { useDrawerStore } from '@/stores/useDrawerStore'
import { toFeedCardProps } from '@/lib/utils/spotRecordToFeed'

export default function SpotFeedPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const { data: spot } = useSpotDetail(Number(id))

  const { data, isLoading } = useSpotRecordsBySpot({
    spotId: Number(id),
    pageRequest: { page: 0, size: 20 },
  })
  const records = data?.content ?? []

  const { data: currentUser } = useCurrentUser()
  const deleteRecord = useDeleteSpotRecord()
  const openDeleteConfirmDrawer = useDrawerStore((s) => s.openDeleteConfirmDrawer)

  return (
    <div className="bg-bg-primary relative flex min-h-screen flex-col pb-12">
      <div className="h-14">
        <Header
          left={<LeftArrow />}
          center={
            <div className="text-[15px] font-medium text-[#000000]">
              {spot?.name ? `${spot.name} 피드` : '피드'}
            </div>
          }
        />
      </div>

      {isLoading ? (
        <p className="text-text-tertiary py-10 text-center text-sm">불러오는 중...</p>
      ) : records.length === 0 ? (
        <p className="text-text-tertiary py-10 text-center text-sm">아직 기록이 없어요</p>
      ) : (
        <div className="divide-border-primary divide-y">
          {records.map((record) => (
            <FeedCard
              key={record.id}
              {...toFeedCardProps(record, {
                isOwner: record.user.id === currentUser?.id,
                onEdit: () => router.push(`/record/${record.id}/edit`),
                onDelete: () =>
                  openDeleteConfirmDrawer(() => deleteRecord.mutate({ id: record.id })),
              })}
            />
          ))}
        </div>
      )}

      <Drawer />
    </div>
  )
}
