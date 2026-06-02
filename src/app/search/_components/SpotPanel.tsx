import { Search } from 'lucide-react'
import IconBtn from '@/components/ui/button/IconBtn'
import SpotCard from '@/components/ui/card/SpotCard'

export interface SPOTProps {
  id: number
  name: string
  location: string
  status: string
  nameList: string[]
}

interface Props {
  spots: SPOTProps[]
}

export function SpotPanel({ spots }: Props) {
  if (spots.length === 0) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-2 py-6 text-center">
        <IconBtn className="h-18 w-18">
          <Search className="text-icon-secondary h-10 w-10" strokeWidth={1} />
        </IconBtn>
        <p className="text-text-primary text-lg font-semibold">검색 결과가 없어요</p>
        <p className="text-text-tertiary text-base">다른 키워드로 검색해보세요</p>
      </div>
    )
  }

  return (
    <ul className="divide-y divide-gray-100">
      {spots.map((spot) => (
        <SpotCard spot={spot} key={spot.id} />
      ))}
    </ul>
  )
}
