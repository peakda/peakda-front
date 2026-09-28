import { getExploreFestivals } from '@/api/facades/generated/explore/explore'
import type { GetExploreFestivalsParams } from '@/api/facades/generated/peakdaApi.schemas'

// 서버 컴포넌트(/explore/festivals 첫 HTML)에서 import 해도 안전하다 — explore.ts 는 클라이언트 훅을 품고 있어 분리했다.
// options 로 캐시 설정(next.revalidate)을 넘긴다. 축제 카드에는 사용자별 상태가 없다.
export async function exploreFestivalsApi(
  params?: GetExploreFestivalsParams,
  options?: RequestInit
) {
  const res = await getExploreFestivals(params, options)
  return res.data.data ?? null
}
