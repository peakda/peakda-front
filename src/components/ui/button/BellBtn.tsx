'use client'
import { cn } from '@/lib/utils/cn'
import { Bell } from 'lucide-react'
import { useState } from 'react'
import { useUpdateFavoriteNotify } from '@/api/facades/spot-favorite'

interface BellBtnProps {
  InitEnabled: boolean
  className?: string
  spotId?: number
  // 알림은 찜에 종속이라(백엔드가 찜 안 된 스팟은 거부한다) 찜 상태를 같이 받는다.
  favorited?: boolean
}

export function BellBtn({ InitEnabled, className, spotId, favorited = false }: BellBtnProps) {
  const [isEnabled, setIsEnabled] = useState(InitEnabled)
  const updateNotify = useUpdateFavoriteNotify()

  // 낙관적 토글 + 실제 mutation 호출(실패 시 원복).
  const toggleNotify = () => {
    if (spotId === undefined || !favorited) return

    const next = !isEnabled
    setIsEnabled(next)
    updateNotify.mutate({ spotId, data: { enabled: next } }, { onError: () => setIsEnabled(!next) })
  }

  // spotId 가 없거나 찜하지 않았으면 알림을 걸 대상이 없다. HeartBtn 과 같게 비활성 처리한다.
  const isDisabled = spotId === undefined || !favorited

  return (
    <button onClick={toggleNotify} disabled={isDisabled} aria-label="개화 알림">
      <Bell
        className={cn(
          isEnabled ? 'fill-brand-primary text-brand-primary' : 'text-gray-300',
          isDisabled && 'opacity-40',
          className
        )}
      />
    </button>
  )
}
