'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { IconBtn } from '@/components/ui/button/IconBtn'
import { MoreMenu } from '@/components/ui/button/MoreMenu'
import { CardBadge } from '@/components/ui/card/CardBadge'
import { Badge } from '@/components/ui/display/Badge'
import { ReactionBar } from '@/components/ui/card/ReactionBar'
import { useCarousel } from '@/hooks/useEmblaCarousel'
import { useTrackPhotoSwipe } from '@/hooks/useTrackPhotoSwipe'
import { useRequireLogin } from '@/hooks/useRequireLogin'
import { Indecator } from '@/app/onboarding/_components/Indecator'
import { useReport } from '@/api/facades/report'
import { buildReportRequest } from '@/lib/utils/feed'
import { toHttpsImageUrl } from '@/lib/utils/imageUrl'
import { ReportModal } from '@/components/ui/card/ReportModal'
import { TimeAgoText } from '@/components/ui/display/TimeAgoText'
import { cn } from '@/lib/utils/cn'
import type {
  CreateReportRequestReason,
  ReactionSummary,
} from '@/api/facades/generated/peakdaApi.schemas'

interface FlowerTag {
  emoji: string
  label: string
  // 필터 드로어의 꽃 사진. 이름으로 못 찾은 식물은 없고 emoji 로 대신한다.
  icon?: string
}

export interface SpotSummaryInfo {
  name: string
  recordCount: number
  address: string
  onClick: () => void
}

export interface FeedCardProps {
  recordId: number
  authorId: number
  authorName: string
  authorImageUrl?: string | null
  location: string
  timeAgo: string
  visitDate: string
  statusLabel: string
  statusVariant: 'dark' | 'bloom' | 'secondary' | 'green' | 'starting' | 'late'
  images: string[]
  flowers: FlowerTag[]
  content: string
  reactions: ReactionSummary
  isOwner?: boolean
  onEdit?: () => void
  onDelete?: () => void
  onReport?: () => void
  // 기록 상세 주소. 있으면 사진·본문이 상세로 이어지고, 본문은 크롤러가 따라갈 수 있는 링크가 된다.
  href?: string
  showMoreMenu?: boolean
  spotSummary?: SpotSummaryInfo
  // 목록 첫 카드처럼 첫 화면에 보이는 카드만 넘긴다. 첫 이미지만 우선 로드한다.
  priority?: boolean
}

export function FeedCard({
  recordId,
  authorId,
  authorName,
  authorImageUrl,
  location,
  timeAgo,
  visitDate,
  statusLabel,
  statusVariant,
  images,
  flowers,
  content,
  reactions,
  isOwner = false,
  onEdit,
  onDelete,
  onReport,
  href,
  showMoreMenu = true,
  spotSummary,
  priority = false,
}: FeedCardProps) {
  const { emblaRef, selectedIndex, scrollSnaps, scrollTo } = useCarousel({ loop: true })
  useTrackPhotoSwipe(selectedIndex, recordId, images.length, 'feed_list')

  const [isReportModalOpen, setReportModalOpen] = useState(false)
  const report = useReport()
  const requireLogin = useRequireLogin()
  const safeAuthorImageUrl = toHttpsImageUrl(authorImageUrl)
  const router = useRouter()
  // 사진 캐러셀은 안에 인디케이터 버튼이 있어 <a> 로 감쌀 수 없다(중첩 인터랙티브). 클릭으로만 이동한다.
  const onOpen = href ? () => router.push(href) : undefined

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

  const authorInfo = (
    <>
      <div className="flex items-center gap-2">
        <span className="text-text-primary text-sm font-semibold">{authorName}</span>
        <TimeAgoText text={timeAgo} className="text-text-quaternary mt-1 text-xs" />
      </div>
      <div className="flex items-center gap-1">
        <Image src={'/icons/Pin.svg'} alt="지역" width={15} height={15} color="#8C95A4" />
        <span className="text-text-tertiary mt-1 text-xs">{location}</span>
      </div>
    </>
  )

  return (
    <div className="bg-bg-primary flex flex-col gap-3 px-4 py-4">
      {/* 헤더 */}
      <div className="flex items-center gap-2">
        {/* 유저 화면은 로그인 전용이라 크롤러가 따라가면 로그인 리다이렉트만 받는다 */}
        <Link href={`/users/${authorId}`} rel="nofollow">
          <IconBtn size="md" className="relative overflow-hidden">
            {safeAuthorImageUrl ? (
              <Image
                src={safeAuthorImageUrl}
                alt="프로필"
                fill
                className="object-cover"
                sizes="32px"
              />
            ) : (
              <Image src="/icons/person.svg" alt="프로필" width={16} height={16} />
            )}
          </IconBtn>
        </Link>
        <Link
          href={`/users/${authorId}`}
          rel="nofollow"
          className="flex flex-1 flex-col text-left"
        >
          {authorInfo}
        </Link>

        {showMoreMenu && (
          <MoreMenu
            isOwner={isOwner}
            onEdit={onEdit}
            onDelete={onDelete}
            onReport={() => requireLogin(onReport ?? (() => setReportModalOpen(true)))}
          />
        )}
      </div>

      {/* 이미지 캐러셀 — 클릭 시 상세로 이동. 드래그(슬라이드) 중 발생한 클릭은
          embla 가 자체적으로 preventDefault/stopPropagation 하므로 별도 드래그 판별이 필요 없다 */}
      <div
        onClick={onOpen}
        role={onOpen ? 'button' : undefined}
        tabIndex={onOpen ? 0 : undefined}
        aria-label={onOpen ? `${authorName}님의 기록 자세히 보기` : undefined}
        onKeyDown={(event) => {
          if (
            onOpen &&
            event.target === event.currentTarget &&
            (event.key === 'Enter' || event.key === ' ')
          ) {
            event.preventDefault()
            onOpen()
          }
        }}
        className={cn('relative overflow-hidden rounded-2xl', onOpen && 'cursor-pointer')}
      >
        {/* 사진이 1장이면 캐러셀이 필요 없다. ref 를 안 달면 Embla 인스턴스(측정·옵저버)를 만들지 않는다 */}
        <div ref={images.length > 1 ? emblaRef : undefined} className="mp-no-track overflow-hidden">
          <div className="flex touch-pan-y">
            {images.map((src, i) => (
              <div key={i} className="min-w-0 flex-[0_0_100%]">
                <Image
                  src={src}
                  alt={`피드 이미지 ${i + 1}`}
                  width={430}
                  height={240}
                  sizes="(max-width: 430px) 100vw, 430px"
                  priority={priority && i === 0}
                  className="h-[240px] w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 방문일 + 상태 뱃지 */}
        <div className="absolute top-2 left-2 flex items-center gap-1">
          <CardBadge label={`${visitDate} 방문`} variant="secondary" />
          <CardBadge label={statusLabel} variant={statusVariant} />
        </div>

        {/* 이미지 번호 */}
        <CardBadge
          label={`${selectedIndex + 1}/${images.length}`}
          variant="dark"
          className="absolute top-2 right-2"
        />

        {/* 인디케이터 */}
        {scrollSnaps.length > 1 && (
          <div
            className="absolute bottom-3 left-1/2 -translate-x-1/2"
            onClick={(e) => e.stopPropagation()}
          >
            <Indecator
              scrollSnaps={scrollSnaps}
              selectedIndex={selectedIndex}
              scrollTo={scrollTo}
            />
          </div>
        )}
      </div>

      {/* 스팟 요약 */}
      {spotSummary && (
        <button
          type="button"
          onClick={spotSummary.onClick}
          className="bg-bg-secondary flex items-center justify-between rounded-xl px-3.5 py-3 text-left"
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-text-primary text-sm font-semibold">{spotSummary.name}</span>
            <span className="text-text-tertiary text-xs">
              방문 기록 {spotSummary.recordCount} · {spotSummary.address}
            </span>
          </div>
          <ChevronRight className="text-icon-quaternary h-4 w-4 shrink-0" />
        </button>
      )}

      {/* 꽃 태그 */}
      {flowers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {flowers.map((flower, i) => (
            <Badge
              key={i}
              label={flower.label}
              leftIcon={
                flower.icon ? (
                  <Image src={flower.icon} alt="" width={20} height={20} />
                ) : (
                  <span>{flower.emoji}</span>
                )
              }
              variant="filled"
              color="pink"
            />
          ))}
        </div>
      )}

      {/* 본문 */}
      {href ? (
        <Link href={href} className="text-text-primary text-left text-sm leading-relaxed">
          <span className="sr-only">기록 자세히 보기: </span>
          {content}
        </Link>
      ) : (
        <p className="text-text-primary text-sm leading-relaxed">{content}</p>
      )}

      {/* 리액션 — 추가 버튼 + 남겨진 리액션만 카운트 칩으로 노출 */}
      <ReactionBar recordId={recordId} reactions={reactions} />

      {isReportModalOpen && (
        <ReportModal
          onSubmit={handleReportSubmit}
          onCancel={() => setReportModalOpen(false)}
          isSubmitting={report.isPending}
        />
      )}
    </div>
  )
}
