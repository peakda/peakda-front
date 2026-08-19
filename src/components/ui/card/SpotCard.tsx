'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { HeartBtn } from '@/components/ui/button/HeartBtn'
import { BellBtn } from '@/components/ui/button/BellBtn'
import { IconBtn } from '@/components/ui/button/IconBtn'
import { CardBadge } from '@/components/ui/card/CardBadge'
import { Tag } from '@/components/ui/display/Tag'
import { SPOTProps } from '@/app/search/_components/SpotPanel'

interface Props {
  spot: SPOTProps
}

export function SpotCard({ spot }: Props) {
  // 알림은 찜에 종속이라, 이 자리에서 하트를 누르면 종도 같이 켜지고 꺼져야 한다.
  const [favorited, setFavorited] = useState(spot.favorited ?? false)

  // Spot 행이 아직 없으면(spotId null) 찜할 대상도 없어 두 버튼 다 비활성된다.
  const spotId = spot.id ?? undefined

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
          <HeartBtn
            InitFavorite={spot.favorited ?? false}
            spotId={spotId}
            onToggle={setFavorited}
            className="h-5 w-5"
          />
        </IconBtn>
        <IconBtn size="md">
          <BellBtn
            InitEnabled={spot.notifyEnabled ?? false}
            spotId={spotId}
            favorited={favorited}
            className="h-5 w-5"
          />
        </IconBtn>
      </div>
    </div>
  )
}
