'use client'
import { cn } from '@/lib/utils/cn'
import { Heart } from 'lucide-react'
import { useState } from 'react'
import { useAddFavorite, useRemoveFavorite } from '@/api/facades/spot-favorite'

interface HeartBtnProps {
  InitFavorite: boolean
  className?: string
  spotId?: number
}

export default function HeartBtn({ InitFavorite, className, spotId }: HeartBtnProps) {
  const [isFavorite, setIsFavorite] = useState(InitFavorite)
  const addFavorite = useAddFavorite()
  const removeFavorite = useRemoveFavorite()

  // 낙관적 토글 + spotId 가 있으면 실제 mutation 호출(실패 시 원복). spotId 없으면 로컬 토글만.
  const toggleHeart = () => {
    const next = !isFavorite
    setIsFavorite(next)
    if (spotId === undefined) return

    const mutation = next ? addFavorite : removeFavorite
    mutation.mutate({ spotId }, { onError: () => setIsFavorite(!next) })
  }

  return (
    <button onClick={toggleHeart}>
      <Heart
        className={cn(
          isFavorite ? 'fill-brand-primary text-brand-primary' : 'text-gray-300',
          className
        )}
      />
    </button>
  )
}
