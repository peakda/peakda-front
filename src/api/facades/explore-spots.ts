import { getExploreSpots } from '@/api/facades/generated/explore/explore'
import type { GetExploreSpotsParams } from '@/api/facades/generated/peakdaApi.schemas'

// 서버 컴포넌트(/explore/spots 첫 HTML)에서 import 해도 안전하다 — explore.ts 는 클라이언트 훅을 품고 있어 분리했다.
// options 로 캐시 설정(next.revalidate)을 넘긴다. 서버 요청에는 사용자 쿠키가 없어 카드의 찜·알림 상태는 항상 false 다.
export async function exploreSpotsApi(params: GetExploreSpotsParams, options?: RequestInit) {
  const res = await getExploreSpots(params, options)
  return res.data.data ?? null
}
