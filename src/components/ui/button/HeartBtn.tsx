'use client'
import { cn } from '@/lib/utils/cn'
import { Heart } from 'lucide-react'
import { useState } from 'react'
import { useAddFavorite, useRemoveFavorite } from '@/api/facades/spot-favorite'

interface HeartBtnProps {
  InitFavorite: boolean
  className?: string
  spotId?: number
  // 같은 카드의 종 버튼이 찜 상태에 따라 켜지고 꺼져야 해서, 토글 결과를 위로 알린다.
  onToggle?: (isFavorite: boolean) => void
}

export function HeartBtn({ InitFavorite, className, spotId, onToggle }: HeartBtnProps) {
  const [isFavorite, setIsFavorite] = useState(InitFavorite)
  const addFavorite = useAddFavorite()
  const removeFavorite = useRemoveFavorite()

  // 낙관적 토글 + 실제 mutation 호출(실패 시 원복).
  const toggleHeart = () => {
    if (spotId === undefined) return

    const next = !isFavorite
    setIsFavorite(next)
    onToggle?.(next)
    const mutation = next ? addFavorite : removeFavorite
    mutation.mutate(
      { spotId },
      {
        onError: () => {
          setIsFavorite(!next)
          onToggle?.(!next)
        },
      }
    )
  }

  // spotId 가 없으면 찜할 대상이 없다. 눌러도 서버에 저장되지 않으므로 비활성 처리한다.
  return (
    <button onClick={toggleHeart} disabled={spotId === undefined} aria-label="찜하기">
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
