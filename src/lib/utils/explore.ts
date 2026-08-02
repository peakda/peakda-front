import type { SPOTProps } from '@/app/search/_components/SpotPanel'
import type {
  ExploreFestivalItem,
  ExploreSpotItem,
} from '@/api/facades/generated/peakdaApi.schemas'

// '2026-04-01' → '4.1'. 파싱 실패 시 원본 반환.
export const formatMonthDay = (iso: string) => {
  const [, m, d] = iso.split('-')
  return m && d ? `${Number(m)}.${Number(d)}` : iso
}

// 탐색 응답에는 개화 상태 뱃지로 쓸 문구가 없어 status 는 비워 둔다(SpotCard 는 빈 값이면 뱃지 미표시).
export const toExploreSpotProps = (item: ExploreSpotItem): SPOTProps => ({
  id: item.spotId ?? item.attractionId,
  name: item.name,
  location: item.address ?? '',
  status: '',
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
