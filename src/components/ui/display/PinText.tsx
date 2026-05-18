import Image from 'next/image'
import HeartBtn from '../button/HeartBtn'
import { Badge } from './Badge'
import Tag from './Tag'
import { X } from 'lucide-react'
import IconBtn from '../button/IconBtn'

interface PinTextProps {
  title: string
  location: string
  description: string
  Badges: string[]
  isFavorite: boolean
  tag?: string
  variant?: 'card' | 'list'
}

export default function PinText({
  title,
  location,
  description,
  Badges = [],
  isFavorite = false,
  tag,
  variant = 'card',
}: PinTextProps) {
  return (
    <div className="flex-1 p-4">
      <div className="flex items-start justify-between">
        <div>
          {/* 메인 제목 */}
          <div className="relative flex items-center gap-1">
            {tag && <Tag text="절정" className="" />}
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          </div>

          {/* 위치 정보 */}
          <div className="text-text-secondary mt-1 flex items-center gap-1">
            <Image src={'/icons/Pin.svg'} alt="핀 이미지" width={20} height={20} />
            <span className="text-sm">{location}</span>
          </div>
        </div>

        {/* 찜(좋아요) 버튼 */}
        <div className="flex items-center gap-1">
          <IconBtn size="md">
            <HeartBtn InitFavorite={isFavorite} className="h-5 w-5" />
          </IconBtn>
          {variant === 'list' && (
            <IconBtn size="md">
              <X />
            </IconBtn>
          )}
        </div>
      </div>

      {/* 방문 기록 및 상세 정보 */}
      <p className="mt-2 text-xs text-gray-400">{description}</p>

      {/* 하단 태그 목록 */}
      <div className="mt-3 flex gap-2">
        {Badges.map((badge, index) => (
          <Badge
            leftIcon={<Image src={'flowers/벚꽃.svg'} alt="벚꽃" width={20} height={20} />}
            key={index}
            label={badge}
            variant="filled"
            color="pink"
          />
        ))}
      </div>
    </div>
  )
}
