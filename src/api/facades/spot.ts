import { match, useMatch as useMatchGen } from '@/api/generated/spot/spot'
import type { SpotMatchRequest } from '@/api/generated/peakdaApi.schemas'

// 언래핑 규칙: res.data (Orval 래퍼) → res.data.data (백엔드 실제 payload)

// ─── plain async (이벤트 기반 호출) ───────────────────────────────────────────

export async function matchSpotApi(payload: SpotMatchRequest) {
  const res = await match(payload)
  return res.data.data ?? null
}

// ─── React Query hooks (캐싱 / 상태 관리) ────────────────────────────────────

// mutate({ data: payload }) 형태로 호출
export const useMatchSpot = () => useMatchGen()
