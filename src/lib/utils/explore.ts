import type { SPOTProps } from '@/app/search/_components/SpotPanel'
import type {
  ExploreFestivalItem,
  ExploreSpotItem,
} from '@/api/facades/generated/peakdaApi.schemas'
import { toStatusBadge } from '@/lib/utils/bloomStatus'

// '2026-04-01' → '4.1'. 파싱 실패 시 원본 반환.
export const formatMonthDay = (iso: string) => {
  const [, m, d] = iso.split('-')
  return m && d ? `${Number(m)}.${Number(d)}` : iso
}

// 명소만 있고 Spot 행이 아직 없으면 spotId 가 null 이다. attractionId 는 다른 키라
// 상세 경로에 쓸 수 없으므로 null 그대로 넘겨 카드가 링크 없이 렌더되게 한다.
export const toExploreSpotProps = (item: ExploreSpotItem): SPOTProps => ({
  id: item.spotId ?? null,
  name: item.name,
  location: item.address ?? '',
  imageUrl: item.thumbnailUrl,
  ...toStatusBadge(item.status),
  nameList: [item.displayName],
})

export const toFestivalDateRange = (item: ExploreFestivalItem) =>
  item.endsOn
    ? `${formatMonthDay(item.startsOn)}~${formatMonthDay(item.endsOn)}`
    : formatMonthDay(item.startsOn)

// 종료일이 없으면 D 라벨을 붙이지 않는다.
export const toFestivalDescription = (item: ExploreFestivalItem) =>
  [item.region, item.endsInDays != null ? `종료 D-${item.endsInDays}` : null]
    .filter(Boolean)
    .join(' · ')
