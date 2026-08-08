import Image from 'next/image'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import { HeartBtn } from '@/components/ui/button/HeartBtn'
import { IconBtn } from '@/components/ui/button/IconBtn'
import { CardBadge } from '@/components/ui/card/CardBadge'
import { Tag } from '@/components/ui/display/Tag'
import { SPOTProps } from '@/app/search/_components/SpotPanel'

interface Props {
  spot: SPOTProps
  // 실제 찜 연동용 — 넘기면 HeartBtn 이 add/remove API 를 호출한다(없으면 비활성).
  favoriteSpotId?: number
  initialFavorite?: boolean
}

export function SpotCard({ spot, favoriteSpotId, initialFavorite = false }: Props) {
  const info = (
    <>
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-200">
        {spot.imageUrl && (
          <Image src={spot.imageUrl} alt={spot.name} fill className="object-cover" sizes="80px" />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-text-primary text-base font-semibold">{spot.name}</span>
        <span className="text-text-secondary text-sm">{spot.location}</span>
        <div className="flex items-center gap-1">
          {spot.nameList.map((name, idx) => (
            <Tag text={name} key={idx} />
          ))}
          {spot.status && (
            <CardBadge label={spot.status} variant={spot.statusVariant ?? 'secondary'} />
          )}
        </div>
      </div>
    </>
  )

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      {/* Spot 행이 아직 없으면(spotId null) 이동할 상세가 없어 링크로 감싸지 않는다 */}
      {spot.id != null ? (
        <Link href={`/spot/${spot.id}`} className="flex min-w-0 flex-1 items-center gap-3">
          {info}
        </Link>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-3">{info}</div>
      )}
      <div className="flex items-center gap-2">
        <IconBtn size="md">
          <HeartBtn InitFavorite={initialFavorite} spotId={favoriteSpotId} className="h-5 w-5" />
        </IconBtn>
        <IconBtn size="md">
          <Bell className="h-5 w-5 text-gray-300" />
        </IconBtn>
      </div>
    </div>
  )
}
