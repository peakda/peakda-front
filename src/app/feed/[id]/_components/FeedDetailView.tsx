'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { SmilePlus } from 'lucide-react'
import { IconBtn } from '@/components/ui/button/IconBtn'
import { EmojiBtn } from '@/components/ui/button/EmojiBtn'
import { CardBadge } from '@/components/ui/card/CardBadge'
import { Badge } from '@/components/ui/display/Badge'
import { Indecator } from '@/app/onboarding/_components/Indecator'
import { useCarousel } from '@/hooks/useEmblaCarousel'
import { useAddReaction, useRemoveReaction } from '@/api/facades/feed'
import { reactionToggleAction, toReactionSummary } from '@/lib/utils/feed'
import { SpotBloomSummary } from './SpotBloomSummary'
import type { SpotBloomSummaryProps } from './SpotBloomSummary'
import type { FeedCardProps } from '@/components/ui/card/FeedCard'
import type {
  FeedReactionSummaryResponseMyReactionsItem,
  ReactionSummary,
} from '@/api/facades/generated/peakdaApi.schemas'

const REACTIONS: { type: FeedReactionSummaryResponseMyReactionsItem; emoji: string }[] = [
  { type: 'HEART', emoji: '❤️' },
  { type: 'SMILE', emoji: '😀' },
]

type FeedDetailViewProps = Pick<
  FeedCardProps,
  | 'recordId'
  | 'authorId'
  | 'authorName'
  | 'authorImageUrl'
  | 'timeAgo'
  | 'visitDate'
  | 'statusLabel'
  | 'statusVariant'
  | 'images'
  | 'flowers'
  | 'content'
  | 'reactions'
> & { spotSummary?: SpotBloomSummaryProps }

// 피드 상세 전용 레이아웃. 목록용 FeedCard 와 달리 사진이 풀블리드로 깔리고
// 헤더(뒤로가기·더보기)가 그 위에 겹치며, 방문일·상태 뱃지는 사진 아래 작성자 영역으로 내려간다.
export function FeedDetailView({
  recordId,
  authorId,
  authorName,
  authorImageUrl,
  timeAgo,
  visitDate,
  statusLabel,
  statusVariant,
  images,
  flowers,
  content,
  reactions,
  spotSummary,
}: FeedDetailViewProps) {
  const { emblaRef, selectedIndex, scrollSnaps, scrollTo } = useCarousel({ loop: true })

  // 조회 응답의 리액션 요약을 그대로 보여주고, 이 화면에서 리액션을 누른 뒤에만
  // mutation 응답으로 덮어쓴다. (useState 초기값으로 두면 나중에 도착한 서버 값이 반영되지 않는다)
  const [reactionOverride, setReactionOverride] = useState<ReactionSummary | null>(null)
  const { counts: reactionCounts, myReactions } = reactionOverride ?? reactions
  const [isPickerOpen, setPickerOpen] = useState(false)
  const addReaction = useAddReaction()
  const removeReaction = useRemoveReaction()

  const handleReaction = (type: FeedReactionSummaryResponseMyReactionsItem) => {
    const mutation =
      reactionToggleAction(myReactions, type) === 'add' ? addReaction : removeReaction
    mutation.mutate(
      { id: recordId, params: { reactionType: type } },
      {
        onSuccess: (res) => {
          setReactionOverride(toReactionSummary(res.data.data))
          setPickerOpen(false)
        },
      }
    )
  }

  const countOf = (type: FeedReactionSummaryResponseMyReactionsItem) =>
    reactionCounts.find((c) => c.reactionType === type)?.count ?? 0

  return (
    <div className="flex flex-col gap-3">
      {/* 이미지 캐러셀 — 화면 폭 전체, 헤더가 위에 겹친다 */}
      <div className="relative">
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex touch-pan-y">
            {images.map((src, i) => (
              <div key={i} className="min-w-0 flex-[0_0_100%]">
                <Image
                  src={src}
                  alt={`피드 이미지 ${i + 1}`}
                  width={430}
                  height={322}
                  className="aspect-[4/3] w-full object-cover"
                  priority={i === 0}
                />
              </div>
            ))}
          </div>
        </div>

        {scrollSnaps.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
            <Indecator
              scrollSnaps={scrollSnaps}
              selectedIndex={selectedIndex}
              scrollTo={scrollTo}
            />
          </div>
        )}

        <CardBadge
          label={`${selectedIndex + 1}/${images.length}`}
          variant="dark"
          className="absolute right-3 bottom-3"
        />
      </div>

      {/* 작성자 + 방문일·상태 */}
      <div className="flex flex-col gap-2 px-4">
        <div className="flex items-center gap-2">
          <Link href={`/users/${authorId}`}>
            <IconBtn size="md" className="relative overflow-hidden">
              {authorImageUrl ? (
                <Image
                  src={authorImageUrl}
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
          <Link href={`/users/${authorId}`} className="flex items-center gap-2">
            <span className="text-text-primary text-sm font-semibold">{authorName}</span>
            <span className="text-text-quaternary text-xs">{timeAgo}</span>
          </Link>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-text-tertiary text-xs">{visitDate} 방문</span>
          <CardBadge label={statusLabel} variant={statusVariant} />
        </div>
      </div>

      {/* 스팟 요약 + 올해 만개 시기 */}
      {spotSummary && <SpotBloomSummary {...spotSummary} />}

      {/* 꽃 태그 */}
      {flowers.length > 0 && (
        <div className="flex flex-wrap gap-2 px-4">
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
      <p className="text-text-primary px-4 text-sm leading-relaxed">{content}</p>

      {/* 리액션 — 추가 버튼 + 남겨진 리액션만 카운트 칩으로 노출 */}
      <div className="relative flex items-center gap-2 px-4">
        <button
          type="button"
          aria-label="리액션 추가"
          aria-expanded={isPickerOpen}
          onClick={() => setPickerOpen((prev) => !prev)}
          className="border-border-primary text-icon-quaternary flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border"
        >
          <SmilePlus className="h-4 w-4" />
        </button>

        {REACTIONS.filter(({ type }) => countOf(type) > 0 || myReactions.includes(type)).map(
          ({ type, emoji }) => (
            <EmojiBtn
              key={type}
              emoji={emoji}
              label={`+${countOf(type)}`}
              selected={myReactions.includes(type)}
              onClick={() => handleReaction(type)}
            />
          )
        )}

        {isPickerOpen && (
          <div className="border-border-primary absolute bottom-10 left-4 z-20 flex gap-1 rounded-full border bg-white px-2 py-1.5 shadow-lg">
            {REACTIONS.map(({ type, emoji }) => (
              <button
                key={type}
                type="button"
                aria-label={type}
                onClick={() => handleReaction(type)}
                className="hover:bg-bg-secondary cursor-pointer rounded-full px-2 py-1 text-lg leading-none"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
