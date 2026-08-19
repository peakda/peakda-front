import type { SPOTProps } from '@/app/search/_components/SpotPanel'
import type {
  ExploreFestivalItem,
  ExploreFestivalItemPhase,
  ExploreSpotItem,
} from '@/api/facades/generated/peakdaApi.schemas'
import { toStatusBadge } from '@/lib/utils/bloomStatus'

// '2026-04-01' → '4.1'. 파싱 실패 시 원본 반환.
export const formatMonthDay = (iso: string) => {
  const [, m, d] = iso.split('-')
  return m && d ? `${Number(m)}.${Number(d)}` : iso
}

// 서버가 탐색에 노출되는 명소의 Spot 행을 미리 만들어 주므로 spotId 는 실질적으로 항상 있다.
// 좌표 없는 명소를 대비해 타입은 nullable 로 남아 있어 그대로 넘긴다.
export const toExploreSpotProps = (item: ExploreSpotItem): SPOTProps => ({
  id: item.spotId ?? null,
  name: item.name,
  location: item.address ?? '',
  imageUrl: item.thumbnailUrl,
  ...toStatusBadge(item.status),
  nameList: [item.displayName],
  favorited: item.favorited,
  notifyEnabled: item.notifyEnabled,
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

/**
 * 서버가 판정한 축제 상태(phase) → 화면 문구.
 * 축제 목록과 상세가 같은 표기를 쓰도록 여기 한 곳에 둔다.
 */
export const FESTIVAL_PHASE_LABEL: Record<ExploreFestivalItemPhase, string> = {
  UPCOMING: '예정',
  ONGOING: '진행중',
  ENDING_SOON: '곧 종료',
  ENDED: '종료',
}

const PHASE_VARIANT: Record<ExploreFestivalItemPhase, 'green' | 'starting' | 'late'> = {
  UPCOMING: 'starting',
  ONGOING: 'green',
  ENDING_SOON: 'starting',
  ENDED: 'late',
}

// 축제 카드 배지. 날짜로 직접 판정하면 취소·연기를 표현할 수 없고 서버와 기준이 갈려서
// 서버 phase 를 그대로 쓴다.
export const toFestivalStatus = (item: ExploreFestivalItem) => ({
  label: FESTIVAL_PHASE_LABEL[item.phase],
  variant: PHASE_VARIANT[item.phase],
})
