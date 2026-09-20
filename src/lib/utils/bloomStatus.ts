import type { BloomStatus } from '@/api/facades/generated/peakdaApi.schemas'
import type { CardBadgeVariant } from '@/components/ui/card/CardBadge'

/**
 * 개화 상태 5단계. 찜·탐색·스팟 상세·지도가 모두 이 축을 쓴다.
 *
 * 서버는 같은 값 집합을 엔드포인트마다 다른 이름(BloomStatus / BloomBannerStatus /
 * BloomBadgeStatus / BloomSlotStatus / ...)으로 내보내는데, 값이 전부 같아 프런트 매핑은
 * 이 타입 하나로 덮는다.
 *
 * `BEFORE_SEASON` 은 백엔드 PR #104 로 추가됐지만 아직 dev 스펙에 배포되지 않았다.
 * 배포 후 `pnpm generate:api` 를 돌리면 생성 union 에 들어와 이 합집합이 `BloomStatus` 와
 * 같아진다 — 그때 `| 'BEFORE_SEASON'` 만 지우면 된다.
 */
export type BloomStageStatus = BloomStatus | 'BEFORE_SEASON'

// 스팟 상세와 동일한 표기를 카드에서도 그대로 사용한다.
const LABEL: Record<BloomStageStatus, string> = {
  BEFORE_SEASON: '개화 전',
  PREPARING: '이르다',
  STARTED: '이제 막요',
  PEAK: '절정',
  ENDED: '끝났어요',
}

// 개화 전은 전용 색이 없다 — CardBadge 의 회색 secondary 를 그대로 쓴다.
const VARIANT: Record<BloomStageStatus, CardBadgeVariant> = {
  BEFORE_SEASON: 'secondary',
  PREPARING: 'green',
  STARTED: 'starting',
  PEAK: 'bloom',
  ENDED: 'late',
}

// 개화 상태 → SpotCard 배지 props. 상태 정보가 없으면 빈 라벨(배지 미표시)로 내려간다.
export function toStatusBadge(status?: BloomStageStatus | null): {
  status: string
  statusVariant?: CardBadgeVariant
} {
  if (!status) return { status: '' }
  return { status: LABEL[status], statusVariant: VARIANT[status] }
}
