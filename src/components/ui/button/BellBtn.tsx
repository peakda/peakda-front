'use client'
import { cn } from '@/lib/utils/cn'
import { Bell } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useUpdateFavoriteNotify } from '@/api/facades/spot-favorite'
import { useRequireLogin } from '@/hooks/useRequireLogin'

interface BellBtnProps {
  InitEnabled: boolean
  className?: string
  spotId?: number
  // 알림은 찜에 종속이라(백엔드가 찜 안 된 스팟은 거부한다) 찜 상태를 같이 받는다.
  favorited?: boolean
  // 찜하지 않은 스팟은 알림만 켤 수 없어, 상세 화면처럼 알림 토글이 든 찜 시트를 연다.
  onRequestSave: () => void
  // 핀 목록처럼 다시 그려질 때 초기값을 따로 들고 있는 곳이 바뀐 값을 알 수 있게 한다.
  onToggle?: (isEnabled: boolean) => void
}

export function BellBtn({
  InitEnabled,
  className,
  spotId,
  favorited = false,
  onRequestSave,
  onToggle,
}: BellBtnProps) {
  const [isEnabled, setIsEnabled] = useState(InitEnabled)
  const updateNotify = useUpdateFavoriteNotify()
  const requireLogin = useRequireLogin()

  useEffect(() => setIsEnabled(InitEnabled && favorited), [InitEnabled, favorited, spotId])

  // 낙관적 토글 + 실제 mutation 호출(실패 시 원복).
  const toggleNotify = () => {
    if (spotId === undefined || updateNotify.isPending) return
    if (!favorited) {
      onRequestSave()
      return
    }

    const next = !isEnabled
    setIsEnabled(next)
    onToggle?.(next)
    updateNotify.mutate(
      { spotId, data: { enabled: next } },
      {
        onSuccess: () => toast(next ? '만개 알림을 켰어요' : '만개 알림을 껐어요'),
        onError: (err) => {
          console.error(err)
          toast.error('알림 설정을 바꾸지 못했어요')
          setIsEnabled(!next)
          onToggle?.(!next)
        },
      }
    )
  }

  // spotId 가 없으면 알림을 걸 대상이 없다. HeartBtn 과 같게 비활성 처리한다.
  const isDisabled = spotId === undefined || updateNotify.isPending

  return (
    <button
      onClick={() => requireLogin(toggleNotify, '개화 알림을 받으려면 로그인이 필요해요.')}
      disabled={isDisabled}
      aria-label="개화 알림"
    >
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
