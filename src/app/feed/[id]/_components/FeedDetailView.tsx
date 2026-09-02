'use client'

import Image from 'next/image'
import Link from 'next/link'
import { IconBtn } from '@/components/ui/button/IconBtn'
import { CardBadge } from '@/components/ui/card/CardBadge'
import { ReactionBar } from '@/components/ui/card/ReactionBar'
import { Badge } from '@/components/ui/display/Badge'
import { Indecator } from '@/app/onboarding/_components/Indecator'
import { useCarousel } from '@/hooks/useEmblaCarousel'
import { SpotBloomSummary } from './SpotBloomSummary'
import type { SpotBloomSummaryProps } from './SpotBloomSummary'
import type { FeedCardProps } from '@/components/ui/card/FeedCard'
import { toHttpsImageUrl } from '@/lib/utils/imageUrl'

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
  const safeAuthorImageUrl = toHttpsImageUrl(authorImageUrl)

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

      {/* 작성자 + 방문일·상태 (방문일 줄은 닉네임과 같은 열에 붙는다) */}
      <div className="flex items-center gap-2 px-4">
        <Link href={`/users/${authorId}`}>
          <IconBtn size="md" className="relative overflow-hidden">
            {safeAuthorImageUrl ? (
              <Image src={safeAuthorImageUrl} alt="프로필" fill className="object-cover" sizes="32px" />
            ) : (
              <Image src="/icons/person.svg" alt="프로필" width={16} height={16} />
            )}
          </IconBtn>
        </Link>
        <div className="flex flex-col gap-1">
          <Link href={`/users/${authorId}`} className="flex items-center gap-2">
            <span className="text-text-primary text-sm font-semibold">{authorName}</span>
            <span className="text-text-quaternary text-xs">{timeAgo}</span>
          </Link>
          <div className="flex items-center gap-1.5">
            <span className="text-text-tertiary text-xs">{visitDate} 방문</span>
            <CardBadge label={statusLabel} variant={statusVariant} />
          </div>
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
      <ReactionBar recordId={recordId} reactions={reactions} className="px-4" />
    </div>
  )
}
