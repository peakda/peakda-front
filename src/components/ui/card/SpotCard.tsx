import { Bell } from 'lucide-react'
import HeartBtn from '../button/HeartBtn'
import IconBtn from '../button/IconBtn'
import { Badge } from '../display/Badge'
import Tag from '../display/Tag'
import { cn } from '@/lib/utils/cn'
import { SPOTProps } from '@/app/search/_components/SpotPanel'

interface Props {
  spot: SPOTProps
  // 실제 찜 연동용 — 넘기면 HeartBtn 이 add/remove API 를 호출한다(없으면 로컬 토글).
  favoriteSpotId?: number
  initialFavorite?: boolean
}

export default function SpotCard({ spot, favoriteSpotId, initialFavorite = false }: Props) {
  return (
    <div key={spot.id} className="flex items-center gap-3 px-4 py-3">
      <div className="relative h-20 w-20 shrink-0">
        <div className="h-20 w-20 rounded-lg bg-gray-200" />
      </div>
      <div className="flex flex-1 flex-col gap-0.5">
        <span className="text-text-primary text-base font-semibold">{spot.name}</span>
        <span className="text-text-secondary text-sm">{spot.location}</span>
        <div className="flex gap-1">
          {spot.nameList.map((name, idx) => (
            <Tag text={name} key={idx} />
          ))}
          {spot.status && (
            <Badge
              label={spot.status}
              variant="soft"
              color="pink"
              className={cn('w-fit', spot.status === '빨리가요' && 'bg-rose-100 text-rose-500')}
            />
          )}
        </div>
      </div>
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
