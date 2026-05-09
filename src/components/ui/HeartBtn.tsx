'use client'
import { Heart } from 'lucide-react'
import { useState } from 'react'

interface HeartBtnProps {
  InitFavorite: boolean
}

export default function HeartBtn({ InitFavorite }: HeartBtnProps) {
  const [isFavorite, setIsFavorite] = useState(InitFavorite)

  const toggleHeart = async () => {
    setIsFavorite(!isFavorite)
  }
  return (
    <button onClick={toggleHeart} className="p-1">
      <Heart size={24} className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-300'} />
    </button>
  )
}
