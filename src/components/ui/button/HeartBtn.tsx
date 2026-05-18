'use client'
import { cn } from '@/lib/utils/cn'
import { Heart } from 'lucide-react'
import { useState } from 'react'

interface HeartBtnProps {
  InitFavorite: boolean
  className?: string
}

export default function HeartBtn({ InitFavorite, className }: HeartBtnProps) {
  const [isFavorite, setIsFavorite] = useState(InitFavorite)

  const toggleHeart = async () => {
    setIsFavorite(!isFavorite)
  }
  return (
    <button onClick={toggleHeart}>
      <Heart
        className={cn(isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-300', className)}
      />
    </button>
  )
}
