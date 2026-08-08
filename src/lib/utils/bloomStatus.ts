import type { BloomStatus } from '@/api/facades/generated/peakdaApi.schemas'
import type { CardBadgeVariant } from '@/components/ui/card/CardBadge'

// 개화 상태(PREPARING/STARTED/PEAK/ENDED)는 찜·탐색·스팟 상세가 같은 enum 을 쓴다.
// 스팟 상세와 동일한 표기를 카드에서도 그대로 사용한다.
const LABEL: Record<BloomStatus, string> = {
  PREPARING: '이르다',
  STARTED: '이제 막요',
  PEAK: '절정',
  ENDED: '끝났어요',
}

const VARIANT: Record<BloomStatus, CardBadgeVariant> = {
  PREPARING: 'green',
  STARTED: 'starting',
  PEAK: 'bloom',
  ENDED: 'late',
}

// 개화 상태 → SpotCard 배지 props. 상태 정보가 없으면 빈 라벨(배지 미표시)로 내려간다.
export function toStatusBadge(status?: BloomStatus | null): {
  status: string
  statusVariant?: CardBadgeVariant
} {
  if (!status) return { status: '' }
  return { status: LABEL[status], statusVariant: VARIANT[status] }
}
