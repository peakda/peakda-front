import { Search } from 'lucide-react'
import { IconBtn } from '@/components/ui/button/IconBtn'
import { SpotCard } from '@/components/ui/card/SpotCard'
import type { CardBadgeVariant } from '@/components/ui/card/CardBadge'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'

export interface SPOTProps {
  // 스팟 상세로 이동할 spotId. 명소만 있고 Spot 행이 아직 없으면 null(이동 불가)
  id: number | null
  name: string
  location: string
  // 카드 썸네일. 없으면 회색 플레이스홀더
  imageUrl?: string | null
  // 개화 상태 라벨. 정보가 없으면 '' (배지 미표시)
  status: string
  statusVariant?: CardBadgeVariant
  nameList: string[]
}

interface Props {
  spots: SPOTProps[]
  // 목록 하단에 닿았을 때 다음 페이지를 부른다. hasMore 가 false 면 관찰하지 않는다.
  onLoadMore?: () => void
  hasMore?: boolean
}

export function SpotPanel({ spots, onLoadMore, hasMore = false }: Props) {
  const sentinelRef = useInfiniteScroll(() => onLoadMore?.(), hasMore)

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
    <>
      <ul className="divide-y divide-gray-100">
        {spots.map((spot) => (
          <SpotCard spot={spot} key={spot.id} />
        ))}
      </ul>
      <div ref={sentinelRef} />
    </>
  )
}
