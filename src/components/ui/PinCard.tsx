import React from 'react'
import Tag from './Tag'
import { Badge } from './Badge'
import Image from 'next/image'
import HeartBtn from './HeartBtn'

interface PinCardProps {
  imageUrl?: string
  TagText?: string
  title: string
  location: string
  description: string
  Badges: string[]
  isFavorite: boolean
  onFavoriteClick: () => void
}

export default function PinCard({
  imageUrl,
  TagText,
  title,
  location,
  description,
  Badges = [],
  isFavorite = false,
  onFavoriteClick,
}: PinCardProps) {
  return (
    <div className="flex h-[318px] w-full min-w-[300px] flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
      {/* 상단 이미지 영역 */}
      <div className="relative h-48 bg-gray-200">
        {imageUrl && (
          <img src={imageUrl} alt={title} className="aspect-video h-full w-full object-cover" />
        )}

        {/* 우측 상단 품절/상태 배지 */}
        {TagText && <Tag TagText={TagText} />}
      </div>

      {/* 하단 콘텐츠 영역 */}
      <div className="flex-1 p-4">
        <div className="flex items-start justify-between">
          <div>
            {/* 메인 제목 */}
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>

            {/* 위치 정보 */}
            <div className="text-text-secondary mt-1 flex items-center gap-1">
              <Image src={'/icons/Pin.svg'} alt="핀 이미지" width={20} height={20} />
              <span className="text-sm">{location}</span>
            </div>
          </div>

          {/* 찜(좋아요) 버튼 */}
          <HeartBtn isFavorite={isFavorite} onClick={onFavoriteClick} />
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
    </div>
  )
}
