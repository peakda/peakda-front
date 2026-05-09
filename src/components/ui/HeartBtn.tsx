import { Heart } from 'lucide-react'

interface HeartBtnProps {
  onClick: () => void
  isFavorite: boolean
}

export default function HeartBtn({ onClick, isFavorite }: HeartBtnProps) {
  return (
    <button onClick={onClick} className="p-1">
      <Heart size={24} className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-300'} />
    </button>
  )
}
