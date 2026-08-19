'use client'
import Image from 'next/image'
import { useState } from 'react'
import { HeartBtn } from '@/components/ui/button/HeartBtn'
import { BellBtn } from '@/components/ui/button/BellBtn'
import { Badge } from './Badge'
import { Tag } from './Tag'
import { IconBtn } from '@/components/ui/button/IconBtn'
import type { PinBadge } from '@/types/types'

// 칩이 한 줄을 넘기면 카드가 깨진다. 더 있어도 3개까지만 보여준다.
const MAX_BADGES = 3

interface PinTextProps {
  title: string
  location: string
  description: string
  badges: PinBadge[]
  isFavorite: boolean
  // 개화 알림 on/off 초기값. 찜하지 않았으면 종은 어차피 비활성이다.
  notifyEnabled?: boolean
  // 찜/알림 API 호출 대상. 없으면 두 버튼 다 비활성된다.
  spotId?: number
  tag?: string
  variant?: 'card' | 'list'
}

export function PinText({
  title,
  location,
  description,
  badges = [],
  isFavorite = false,
  notifyEnabled = false,
  spotId,
  tag,
  variant = 'card',
}: PinTextProps) {
  // 알림은 찜에 종속이라, 이 자리에서 하트를 누르면 종도 같이 켜지고 꺼져야 한다.
  const [favorited, setFavorited] = useState(isFavorite)

  return (
    <div className="flex-1 p-4">
      <div className="flex items-start justify-between">
        <div>
          {/* 메인 제목 */}
          <div className="relative flex items-center gap-1">
            {tag && <Tag text={tag} />}
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          </div>

          {/* 위치 정보 */}
          <div className="text-text-secondary mt-1 flex items-center gap-1">
            <Image src={'/icons/Pin.svg'} alt="핀 이미지" width={20} height={20} />
            <span className="text-text-secondary text-sm">{location}</span>
          </div>
        </div>

        {/* 찜/알림 버튼. 목록 행 전체가 상세로 가는 클릭 영역이라 버블링을 끊는다. */}
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <IconBtn size="md">
            <HeartBtn
              InitFavorite={isFavorite}
              spotId={spotId}
              onToggle={setFavorited}
              className="h-5 w-5"
            />
          </IconBtn>
          {variant === 'list' && (
            <IconBtn size="md">
              <BellBtn
                InitEnabled={notifyEnabled}
                spotId={spotId}
                favorited={favorited}
                className="h-5 w-5"
              />
            </IconBtn>
          )}
        </div>
      </div>

      {/* 방문 기록 및 상세 정보 */}
      {description && (
        <div className="mt-2 flex items-center gap-2">
          <p className="text-text-tertiary text-xs">{description}</p>
        </div>
      )}

      {/* 하단 태그 목록 */}
      {badges.length > 0 && (
        <div className="mt-3 flex gap-2">
          {badges.slice(0, MAX_BADGES).map((badge, index) => (
            <Badge
              leftIcon={
                badge.icon ? <Image src={badge.icon} alt="" width={20} height={20} /> : undefined
              }
              key={index}
              label={badge.label}
              variant="filled"
              color="pink"
              className="px-2"
            />
          ))}
        </div>
      )}
    </div>
  )
}
