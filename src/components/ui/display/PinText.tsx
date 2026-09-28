'use client'
import Image from 'next/image'
import { useState } from 'react'
import { HeartBtn } from '@/components/ui/button/HeartBtn'
import { BellBtn } from '@/components/ui/button/BellBtn'
import { Badge } from './Badge'
import { Tag } from './Tag'
import { IconBtn } from '@/components/ui/button/IconBtn'
import type { PinBadge } from '@/types/types'
import { useDrawerStore } from '@/stores/useDrawerStore'

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
  const [notify, setNotify] = useState(notifyEnabled)
  const openSaveSpotDrawer = useDrawerStore((s) => s.openSaveSpotDrawer)
  // 핀 목록 드로어는 찜 시트가 열렸다 닫히면 스토어 데이터로 다시 그려지므로 바뀐 값을 스토어에도 맞춘다.
  const updatePinFavorite = useDrawerStore((s) => s.updatePinFavorite)

  const handleHeartToggle = (next: boolean) => {
    setFavorited(next)
    if (spotId !== undefined) updatePinFavorite(spotId, next, next && notify)
  }

  const handleBellToggle = (next: boolean) => {
    setNotify(next)
    if (spotId !== undefined) updatePinFavorite(spotId, favorited, next)
  }

  // 찜 추가는 상세 화면과 같은 찜 시트(알림 토글 포함)를 거친다.
  const requestSave = () => {
    if (spotId === undefined) return
    openSaveSpotDrawer({
      spotId,
      name: title,
      location,
      onSaved: (enabled) => {
        setFavorited(true)
        setNotify(enabled)
        updatePinFavorite(spotId, true, enabled)
      },
    })
  }

  return (
    <div className="flex-1 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {/* 메인 제목. 명소·축제명이 길면 두 줄까지만 보이고, 태그는 첫 줄에 붙어 있게 한다. */}
          <div className="relative flex items-start gap-1">
            {tag && <Tag text={tag} className="mt-0.5 shrink-0 whitespace-nowrap" />}
            <h3 className="line-clamp-2 min-w-0 text-base font-semibold wrap-anywhere break-keep text-gray-900">
              {title}
            </h3>
          </div>

          {/* 위치 정보 */}
          <div className="text-text-secondary mt-1 flex items-center gap-1">
            <Image
              src={'/icons/Pin.svg'}
              alt="핀 이미지"
              width={20}
              height={20}
              className="shrink-0"
            />
            <span className="text-text-secondary truncate text-sm">{location}</span>
          </div>
        </div>

        {/* 찜/알림 버튼. 목록 행 전체가 상세로 가는 클릭 영역이라 버블링을 끊는다. */}
        <div className="flex shrink-0 items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <IconBtn size="md">
            <HeartBtn
              InitFavorite={favorited}
              spotId={spotId}
              onRequestSave={requestSave}
              onToggle={handleHeartToggle}
              className="h-5 w-5"
            />
          </IconBtn>
          {variant === 'list' && (
            <IconBtn size="md">
              <BellBtn
                InitEnabled={notify}
                spotId={spotId}
                favorited={favorited}
                onRequestSave={requestSave}
                onToggle={handleBellToggle}
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
        <div className="mt-3 flex flex-wrap gap-2">
          {badges.map((badge, index) => (
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
