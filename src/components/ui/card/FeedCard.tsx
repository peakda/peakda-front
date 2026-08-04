'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { IconBtn } from '@/components/ui/button/IconBtn'
import { MoreMenu } from '@/components/ui/button/MoreMenu'
import { CardBadge } from '@/components/ui/card/CardBadge'
import { Badge } from '@/components/ui/display/Badge'
import { EmojiBtn } from '@/components/ui/button/EmojiBtn'
import { useCarousel } from '@/hooks/useEmblaCarousel'
import { Indecator } from '@/app/onboarding/_components/Indecator'
import { useAddReaction, useRemoveReaction } from '@/api/facades/feed'
import { useReport } from '@/api/facades/report'
import { reactionToggleAction, buildReportRequest } from '@/lib/utils/feed'
import { ReportModal } from '@/components/ui/card/ReportModal'
import type {
  CreateReportRequestReason,
  FeedReactionSummaryResponseMyReactionsItem,
  ReactionCount,
} from '@/api/facades/generated/peakdaApi.schemas'

interface FlowerTag {
  emoji: string
  label: string
}

export interface SpotSummaryInfo {
  name: string
  recordCount: number
  address: string
  onClick: () => void
}

// 목록 DTO 에는 리액션 집계가 없어 처음엔 버튼만 노출하고, 반응 mutation 응답의 counts 로 갱신한다.
const REACTIONS: { type: FeedReactionSummaryResponseMyReactionsItem; emoji: string }[] = [
  { type: 'HEART', emoji: '❤️' },
  { type: 'SMILE', emoji: '😀' },
]

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
  isOwner?: boolean
  onEdit?: () => void
  onDelete?: () => void
  onReport?: () => void
  onOpen?: () => void
  showMoreMenu?: boolean
  spotSummary?: SpotSummaryInfo
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
  isOwner = false,
  onEdit,
  onDelete,
  onReport,
  onOpen,
  showMoreMenu = true,
  spotSummary,
}: FeedCardProps) {
  const { emblaRef, selectedIndex, scrollSnaps, scrollTo } = useCarousel({ loop: true })

  // 내 리액션 상태·카운트: 목록 DTO 에 정보가 없어 빈 값으로 시작하고 mutation 응답으로만 갱신한다.
  const [myReactions, setMyReactions] = useState<FeedReactionSummaryResponseMyReactionsItem[]>([])
  const [reactionCounts, setReactionCounts] = useState<ReactionCount[]>([])
  const [isReportModalOpen, setReportModalOpen] = useState(false)
  const addReaction = useAddReaction()
  const removeReaction = useRemoveReaction()
  const report = useReport()

  const handleReaction = (type: FeedReactionSummaryResponseMyReactionsItem) => {
    const mutation = reactionToggleAction(myReactions, type) === 'add' ? addReaction : removeReaction
    mutation.mutate(
      { id: recordId, params: { reactionType: type } },
      {
        onSuccess: (res) => {
          setMyReactions(res.data.data?.myReactions ?? [])
          setReactionCounts(res.data.data?.counts ?? [])
        },
      }
    )
  }

  const handleReportSubmit = (reason: CreateReportRequestReason, detail?: string) => {
    report.mutate(
      { data: buildReportRequest(recordId, reason, detail) },
      {
        onSuccess: () => {
          setReportModalOpen(false)
          window.alert('신고가 접수되었어요')
        },
      }
    )
  }

  const authorInfo = (
    <>
      <div className="flex items-center gap-2">
        <span className="text-text-primary text-sm font-semibold">{authorName}</span>
        <span className="text-text-quaternary mt-1 text-xs">{timeAgo}</span>
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
        <Link href={`/users/${authorId}`}>
          <IconBtn size="md" className="relative overflow-hidden">
            {authorImageUrl ? (
              <Image src={authorImageUrl} alt="프로필" fill className="object-cover" sizes="32px" />
            ) : (
              <Image src="/icons/person.svg" alt="프로필" width={16} height={16} />
            )}
          </IconBtn>
        </Link>
        {onOpen ? (
          <button type="button" onClick={onOpen} className="flex flex-1 flex-col text-left">
            {authorInfo}
          </button>
        ) : (
          <Link href={`/users/${authorId}`} className="flex flex-1 flex-col text-left">
            {authorInfo}
          </Link>
        )}

        {showMoreMenu && (
          <MoreMenu
            isOwner={isOwner}
            onEdit={onEdit}
            onDelete={onDelete}
            onReport={onReport ?? (() => setReportModalOpen(true))}
          />
        )}
      </div>

      {/* 이미지 캐러셀 */}
      <div className="relative overflow-hidden rounded-2xl">
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex touch-pan-y">
            {images.map((src, i) => (
              <div key={i} className="min-w-0 flex-[0_0_100%]">
                <Image
                  src={src}
                  alt={`피드 이미지 ${i + 1}`}
                  width={400}
                  height={300}
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
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
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
              leftIcon={<span>{flower.emoji}</span>}
              variant="filled"
              color="pink"
            />
          ))}
        </div>
      )}

      {/* 본문 */}
      <p className="text-text-primary text-sm leading-relaxed">{content}</p>

      {/* 반응 버튼 (반응 전엔 카운트 없이 버튼만, 반응 후엔 응답 counts 로 표시) */}
      <div className="flex gap-2">
        {REACTIONS.map(({ type, emoji }) => {
          const count = reactionCounts.find((c) => c.reactionType === type)?.count
          return (
            <EmojiBtn
              key={type}
              emoji={emoji}
              label={count ? String(count) : undefined}
              selected={myReactions.includes(type)}
              onClick={() => handleReaction(type)}
            />
          )
        })}
      </div>

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
