'use client'

import { MapPin } from 'lucide-react'
import Button from '@/components/ui/button/Button'
import Toggle from '@/components/ui/display/Toggle'
import type { SaveSpotData } from '@/stores/useDrawerStore'

interface Props {
  spot: SaveSpotData
  onClose: () => void
}

export function SaveSpotDrawerContent({ spot, onClose }: Props) {
  return (
    <div className="flex flex-col gap-4 px-5 pt-2 pb-8">
      <div className="flex flex-col gap-1 text-center">
        <h2 className="text-text-primary text-lg font-bold">찜 목록에 추가할까요?</h2>
        <p className="text-text-secondary text-sm">
          찜한 스팟은 언제든 MY탭에서 다시 볼 수 있어요.
        </p>
      </div>

      {/* 스팟 정보 */}
      <div className="bg-bg-tertiary flex flex-col gap-0.5 rounded-xl p-4">
        <span className="text-text-primary text-base font-semibold">{spot.name}</span>
        <span className="text-text-secondary flex items-center gap-1 text-sm">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          {spot.location}
        </span>
      </div>

      {/* 개화 알림 토글 */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-text-primary text-sm font-semibold">개화 알림 받기</span>
          <span className="text-text-tertiary text-xs">만개가 임박하면 알려드려요.</span>
        </div>
        <Toggle initialStatus={true} />
      </div>

      <Button variant="filled" color="primary" size="lg" className="w-full" onClick={onClose}>
        확인
      </Button>
    </div>
  )
}
