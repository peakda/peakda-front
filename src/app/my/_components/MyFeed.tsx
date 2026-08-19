import Image from 'next/image'
import Link from 'next/link'
import { CardBadge } from '@/components/ui/card/CardBadge'

interface MyFeedProps {
  id: number
  image: string
  date: string
  isPopular?: boolean
}

export function MyFeed({ id, image, date, isPopular = false }: MyFeedProps) {
  return (
    <Link
      href={`/feed/${id}`}
      className="relative block aspect-square overflow-hidden rounded-lg bg-gray-200"
    >
      <Image src={image} alt="내 기록" fill sizes="33vw" className="object-cover" />
      {isPopular && (
        <CardBadge label="인기" variant="bloom" className="absolute top-1.5 right-1.5" />
      )}
      <span className="absolute bottom-1.5 left-1.5 text-xs font-medium text-white drop-shadow">
        {date}
      </span>
    </Link>
  )
}
