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

// 오늘 날짜를 'YYYY-MM-DD' 로. new Date().toISOString() 은 UTC 라 KST 기준 하루가 밀릴 수 있어 로컬 값으로 직접 조립한다.
const toDateKey = (date: Date) => {
  const m = `${date.getMonth() + 1}`.padStart(2, '0')
  const d = `${date.getDate()}`.padStart(2, '0')
  return `${date.getFullYear()}-${m}-${d}`
}

// 목록 DTO 에 phase 가 없어(API_CHANGE_REQUESTS.md #3 대응 전 임시) 날짜로 진행 상태를 판정한다.
// 판정 순서: 시작 전 → 종료 임박(D-3 이내) → 종료됨 → 그 외 진행중.
export const toFestivalStatus = (
  item: ExploreFestivalItem,
  today: Date = new Date()
): { label: string; variant: 'green' | 'starting' | 'late' } => {
  const todayKey = toDateKey(today)
  if (item.startsOn.slice(0, 10) > todayKey) return { label: '예정', variant: 'starting' }
  if (item.endsInDays != null && item.endsInDays <= 3) return { label: '곧 종료', variant: 'starting' }
  if (item.endsOn && item.endsOn.slice(0, 10) < todayKey) return { label: '종료', variant: 'late' }
  return { label: '진행중', variant: 'green' }
}
