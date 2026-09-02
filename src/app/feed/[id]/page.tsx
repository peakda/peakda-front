'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Header } from '@/components/ui/layout/Header'
import { LeftArrow } from '@/components/ui/button/LeftArrow'
import { MoreMenu } from '@/components/ui/button/MoreMenu'
import { Drawer } from '@/components/ui/layout/Drawer'
import { ReportModal } from '@/components/ui/card/ReportModal'
import { FeedDetailView } from './_components/FeedDetailView'
import { useFeedDetail } from '@/api/facades/feed'
import { useCurrentUser } from '@/api/facades/auth'
import { useSpotDetail } from '@/api/facades/spot'
import { useDeleteSpotRecord } from '@/api/facades/spot-record'
import { useReport } from '@/api/facades/report'
import { useDrawerStore } from '@/stores/useDrawerStore'
import { detailToFeedCardProps } from '@/lib/utils/spotRecordToFeed'
import { buildReportRequest } from '@/lib/utils/feed'
import type { CreateReportRequestReason } from '@/api/facades/generated/peakdaApi.schemas'
import { hasAuthMarker } from '@/lib/auth/session'

// 피드(공개) 상세. 게시된(PUBLISHED) 기록만 조회되며, DRAFT·없음이면 get1 이 404 → record 없음 처리.
// 헤더는 사진 위에 겹쳐 뜨고, 더보기는 소유자면 수정/삭제, 아니면 신고하기를 노출한다.
export default function FeedDetailPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const recordId = Number(id)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  useEffect(() => setIsAuthenticated(hasAuthMarker()), [])
  const { data: record, isLoading } = useFeedDetail(recordId)
  const { data: currentUser } = useCurrentUser(isAuthenticated)
  const { data: spot } = useSpotDetail(record?.spot.id)
  const deleteRecord = useDeleteSpotRecord()
  const report = useReport()
  const openDeleteConfirmDrawer = useDrawerStore((s) => s.openDeleteConfirmDrawer)
  const [isReportModalOpen, setReportModalOpen] = useState(false)

  const isOwner = !!record && !!currentUser && record.user.id === currentUser.id

  const handleDelete = () => {
    deleteRecord.mutate({ id: recordId }, { onSuccess: () => router.back() })
  }

  const handleReportSubmit = (reason: CreateReportRequestReason, detail?: string) => {
    report.mutate(
      { data: buildReportRequest(recordId, reason, detail) },
      {
        onSuccess: () => {
          setReportModalOpen(false)
          toast.success('신고가 접수되었어요')
        },
      }
    )
  }

  return (
    <div className="bg-bg-primary relative flex min-h-screen flex-col pb-12">
      <Header
        className="mt-3"
        left={<LeftArrow />}
        right={
          <MoreMenu
            isOwner={isOwner}
            onEdit={() => router.push(`/record/${recordId}/edit`)}
            onDelete={() => openDeleteConfirmDrawer(handleDelete)}
            onReport={() => setReportModalOpen(true)}
          />
        }
      />

      {isLoading ? (
        <p className="text-text-tertiary pt-20 pb-10 text-center text-sm">불러오는 중...</p>
      ) : !record ? (
        <p className="text-text-tertiary pt-20 pb-10 text-center text-sm">
          게시글을 찾을 수 없어요
        </p>
      ) : (
        <FeedDetailView
          {...detailToFeedCardProps(record)}
          spotSummary={
            spot
              ? {
                  spotId: record.spot.id,
                  name: record.spot.name,
                  recordCount: spot.recordCount,
                  address: spot.address ?? '',
                  attractionId: spot.attractionId,
                  category: spot.bloom?.category,
                }
              : undefined
          }
        />
      )}

      {isReportModalOpen && (
        <ReportModal
          onSubmit={handleReportSubmit}
          onCancel={() => setReportModalOpen(false)}
          isSubmitting={report.isPending}
        />
      )}

      <Drawer />
    </div>
  )
}
