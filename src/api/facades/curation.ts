import { useGetCurationsById } from '@/api/facades/generated/curation/curation'
import type { GetCurationsByIdParams } from '@/api/facades/generated/peakdaApi.schemas'

// 언랩 규칙: res.data (Orval 래퍼) → res.data.data (백엔드 실제 payload)

// 발행 큐레이션 상세. params 로 lat·lng 를 모두 넘기면 연결 스팟까지의 거리(distanceMeters)가 채워진다.
export const useCurationDetail = (id: number | undefined, params?: GetCurationsByIdParams) =>
  useGetCurationsById(id ?? 0, params, {
    query: { enabled: !!id, select: (res) => res.data.data ?? null },
  })
