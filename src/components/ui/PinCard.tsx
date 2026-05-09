import React from 'react'
import Tag from './Tag'
import PinText from './PinText'

interface PinCardProps {
  imageUrl?: string
  TagText?: string
  title: string
  location: string
  description: string
  Badges: string[]
  isFavorite: boolean
}

export default function PinCard({
  imageUrl,
  TagText,
  title,
  location,
  description,
  Badges = [],
  isFavorite = false,
}: PinCardProps) {
  return (
    <div className="flex h-[318px] w-full min-w-[300px] flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
      {/* 상단 이미지 영역 */}
      <div className="relative h-48 bg-gray-200">
        {imageUrl && (
          <img src={imageUrl} alt={title} className="aspect-video h-full w-full object-cover" />
        )}

        {/* 우측 상단 품절/상태 배지 */}
        {TagText && <Tag text={TagText} className="absolute top-2 right-2" />}
      </div>

      {/* 하단 콘텐츠 영역 */}
      <PinText
        Badges={Badges}
        tag="절정"
        title={title}
        location={location}
        description={description}
        isFavorite={isFavorite}
        variant="list"
      />
    </div>
  )
}
