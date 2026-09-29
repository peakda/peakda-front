'use client'
import { cn } from '@/lib/utils/cn'
import { Heart } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useRemoveFavorite } from '@/api/facades/spot-favorite'
import { useRequireLogin } from '@/hooks/useRequireLogin'

interface HeartBtnProps {
  InitFavorite: boolean
  className?: string
  spotId?: number
  // 찜 추가는 알림 여부를 고르는 찜 시트를 거쳐야 해서 시트 여는 일은 호출부에 맡긴다.
  onRequestSave: () => void
  // 같은 카드의 종 버튼이 찜 상태에 따라 켜지고 꺼져야 해서, 토글 결과를 위로 알린다.
  onToggle?: (isFavorite: boolean) => void
}

export function HeartBtn({ InitFavorite, className, spotId, onRequestSave, onToggle }: HeartBtnProps) {
  const [isFavorite, setIsFavorite] = useState(InitFavorite)
  const removeFavorite = useRemoveFavorite()
  const requireLogin = useRequireLogin()

  useEffect(() => setIsFavorite(InitFavorite), [InitFavorite, spotId])

  // 해제는 선택지가 없어 상세 화면과 같이 시트 없이 바로 해제한다(실패 시 원복).
  const toggleHeart = () => {
    if (spotId === undefined || removeFavorite.isPending) return
    if (!isFavorite) {
      onRequestSave()
      return
    }

    setIsFavorite(false)
    onToggle?.(false)
    removeFavorite.mutate(
      { spotId },
      {
        onSuccess: () => toast('찜을 해제했어요'),
        onError: (err) => {
          console.error(err)
          toast.error('찜을 해제하지 못했어요')
          setIsFavorite(true)
          onToggle?.(true)
        },
      }
    )
  }

  // spotId 가 없으면 찜할 대상이 없다. 눌러도 서버에 저장되지 않으므로 비활성 처리한다.
  return (
    <button onClick={() => requireLogin(toggleHeart, '해당 장소를 찜하고 싶다면 로그인이 필요해요.')}disabled={spotId === undefined} aria-label="찜하기">
      <Heart
        className={cn(
          isFavorite ? 'fill-brand-primary text-brand-primary' : 'text-gray-300',
          spotId === undefined && 'opacity-40',
          className
        )}
      />
    </button>
  )
}
