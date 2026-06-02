import { Bell } from 'lucide-react'
import HeartBtn from '../button/HeartBtn'
import IconBtn from '../button/IconBtn'
import { Badge } from '../display/Badge'
import Tag from '../display/Tag'
import { cn } from '@/lib/utils/cn'
import { SPOTProps } from '@/app/search/_components/SpotPanel'

interface Props {
  spot: SPOTProps
}

export default function SpotCard({ spot }: Props) {
  return (
    <div key={spot.id} className="flex items-center gap-3 px-4 py-3">
      <div className="relative h-20 w-20 shrink-0">
        <div className="h-20 w-20 rounded-lg bg-gray-200" />
      </div>
      <div className="flex flex-1 flex-col gap-0.5">
        <span className="text-text-primary text-base font-semibold">{spot.name}</span>
        <span className="text-text-secondary text-sm">{spot.location}</span>
        <div className="flex gap-1">
          <Badge
            label={spot.status}
            variant="soft"
            color="pink"
            className={cn('w-fit', spot.status === '빨리가요' && 'bg-rose-100 text-rose-500')}
          />
          {spot.nameList.map((name, idx) => (
            <Tag text={name} key={idx} />
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <IconBtn size="md">
          <HeartBtn InitFavorite={false} className="h-5 w-5" />
        </IconBtn>
        <IconBtn size="md">
          <Bell className="h-5 w-5 text-gray-300" />
        </IconBtn>
      </div>
    </div>
  )
}
