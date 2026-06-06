'use client'

import Image from 'next/image'
import IconBtn from '@/components/ui/button/IconBtn'
import { MoreMenu } from '@/components/ui/button/MoreMenu'
import { CardBadge } from '@/components/ui/card/CardBadge'
import { Badge } from '@/components/ui/display/Badge'
import { EmojiBtn } from '@/components/ui/button/EmojiBtn'
import { useCarousel } from '@/hooks/useEmblaCarousel'
import Indecator from '@/app/onboarding/_components/Indecator'

interface FlowerTag {
  emoji: string
  label: string
}

interface Reaction {
  emoji: string
  count: number
  selected?: boolean
  onClick?: () => void
}

interface FeedCardProps {
  authorName: string
  location: string
  timeAgo: string
  visitDate: string
  statusLabel: string
  statusVariant: 'dark' | 'bloom' | 'secondary' | 'green'
  images: string[]
  flowers: FlowerTag[]
  content: string
  reactions: Reaction[]
  isOwner?: boolean
  onEdit?: () => void
  onDelete?: () => void
  onReport?: () => void
}

export function FeedCard({
  authorName,
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
}: FeedCardProps) {
  const { emblaRef, selectedIndex, scrollSnaps, scrollTo } = useCarousel({ loop: true })

  return (
    <div className="bg-bg-primary flex flex-col gap-3 px-4 py-4">
      {/* 헤더 */}
      <div className="flex items-center gap-2">
        <IconBtn size="md">
          <Image src="/icons/person.svg" alt="프로필" width={16} height={16} />
        </IconBtn>
        <div className="flex flex-1 flex-col">
          <div className="flex items-center gap-2">
            <span className="text-text-primary text-sm font-semibold">{authorName}</span>
            <span className="text-text-quaternary mt-1 text-xs">{timeAgo}</span>
          </div>
          <div className="flex items-center gap-1">
            <Image src={'./icons/Pin.svg'} alt="지역" width={15} height={15} color="#8C95A4" />
            <span className="text-text-tertiary mt-1 text-xs">{location}</span>
          </div>
        </div>

        <MoreMenu isOwner={isOwner} onEdit={onEdit} onDelete={onDelete} onReport={onReport} />
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

      {/* 반응 버튼 */}
      <div className="flex gap-2">
        {reactions.map((reaction, i) => (
          <EmojiBtn
            key={i}
            emoji={reaction.emoji}
            label={`+${reaction.count}`}
            selected={reaction.selected}
            onClick={reaction.onClick}
          />
        ))}
      </div>
    </div>
  )
}
