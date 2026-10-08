'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Header } from '@/components/ui/layout/Header'
import { LeftArrow } from '@/components/ui/button/LeftArrow'
import { MoreMenu } from '@/components/ui/button/MoreMenu'
import { LazyDrawer } from '@/components/ui/layout/LazyDrawer'
import { ReportModal } from '@/components/ui/card/ReportModal'
import { FeedDetailView } from './FeedDetailView'
import type { SpotBloomSummaryProps } from './SpotBloomSummary'
import { useFeedDetail } from '@/api/facades/feed'
import { useCurrentUser } from '@/api/facades/auth'
import { useSpotDetail } from '@/api/facades/spot'
import { useDeleteSpotRecord } from '@/api/facades/spot-record'
import { useReport } from '@/api/facades/report'
import { useDrawerStore } from '@/stores/useDrawerStore'
import { useRequireLogin } from '@/hooks/useRequireLogin'
import { detailToFeedCardProps } from '@/lib/utils/spotRecordToFeed'
import { buildReportRequest } from '@/lib/utils/feed'
import { track } from '@/lib/analytics'
import type { CreateReportRequestReason } from '@/api/facades/generated/peakdaApi.schemas'
import type { SpotRecordResponse } from '@/api/facades/generated/peakdaApi.schemas'

// 서버(page.tsx)가 스팟 상세에서 골라 넘기는 값. 서버 요청엔 사용자 쿠키가 없어 찜 상태가 항상 비로그인 값이라,
// 스팟 상세 쿼리 캐시에 넣으면 스팟 화면이 그 캐시를 그대로 써 찜이 틀려 보인다. 그래서 필요한 필드만 props 로 받는다.
export interface FeedSpotInfo {
  recordCount: number
  category: SpotBloomSummaryProps['category']
}

interface FeedDetailClientProps {
  initialRecord: SpotRecordResponse
  // 서버 조회가 실패하면 null 이고, 그때만 클라이언트가 스팟 상세를 받는다.
  spotInfo: FeedSpotInfo | null
}

// 피드(공개) 상세. 게시된(PUBLISHED) 기록만 조회되며, DRAFT·없음이면 서버 페이지가 404 로 처리한다.
// 헤더는 사진 위에 겹쳐 뜨고, 더보기는 소유자면 수정/삭제, 아니면 신고하기를 노출한다.
export function FeedDetailClient({ initialRecord, spotInfo }: FeedDetailClientProps) {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const recordId = Number(id)
  const { data: record, isLoading } = useFeedDetail(recordId, initialRecord)
  const initialSpotId = initialRecord.spot.id

  useEffect(() => {
    track('feed_view', { record_id: recordId, spot_id: initialSpotId })
  }, [recordId, initialSpotId])
  const { data: currentUser } = useCurrentUser()
  const { data: spot } = useSpotDetail(spotInfo ? undefined : record?.spot.id)
  const deleteRecord = useDeleteSpotRecord()
  const report = useReport()
  const openDeleteConfirmDrawer = useDrawerStore((s) => s.openDeleteConfirmDrawer)
  const [isReportModalOpen, setReportModalOpen] = useState(false)
  const requireLogin = useRequireLogin()

  const isOwner = !!record && !!currentUser && record.user.id === currentUser.id
  // 헤더 아래에 사진(캐러셀)이 깔린 상태. 로딩·빈 화면에서는 기본 색 아이콘을 쓴다.
  const isOverPhoto = !isLoading && !!record

  const handleDelete = () => {
    deleteRecord.mutate(
      { id: recordId },
      {
        onSuccess: () => {
          toast.success('기록을 삭제했어요')
          router.back()
        },
        onError: () => toast.error('기록을 삭제하지 못했어요'),
      }
    )
  }

  const handleReportSubmit = (reason: CreateReportRequestReason, detail?: string) => {
    report.mutate(
      { data: buildReportRequest(recordId, reason, detail) },
      {
        onSuccess: () => {
          setReportModalOpen(false)
          toast.success('신고가 접수되었어요')
        },
        onError: () => toast.error('신고를 접수하지 못했어요'),
      }
    )
  }

  return (
    <div className="bg-bg-primary relative flex min-h-screen flex-col pb-12">
      {/* 흰 아이콘이 밝은 사진 위에서도 보일 만큼만 상단을 어둡게 한다 */}
      {isOverPhoto && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-40 h-20 bg-gradient-to-b from-black/60 to-transparent" />
      )}
      <Header
        className="mt-3"
        left={<LeftArrow isLight={isOverPhoto} />}
        right={
          <MoreMenu
            isOwner={isOwner}
            isLight={isOverPhoto}
            onEdit={() => router.push(`/record/${recordId}/edit`)}
            onDelete={() => openDeleteConfirmDrawer(handleDelete)}
            onReport={() => requireLogin(() => setReportModalOpen(true))}
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
          spotSummary={{
            spotId: record.spot.id,
            name: record.spot.name,
            recordCount: spotInfo?.recordCount ?? spot?.recordCount,
            address: spot?.address ?? record.spot.address ?? '',
            attractionId: spot?.attractionId ?? record.spot.attractionId,
            category: spotInfo ? spotInfo.category : spot?.bloom?.category,
          }}
        />
      )}

      {isReportModalOpen && (
        <ReportModal
          onSubmit={handleReportSubmit}
          onCancel={() => setReportModalOpen(false)}
          isSubmitting={report.isPending}
        />
      )}

      <LazyDrawer />
    </div>
  )
}
