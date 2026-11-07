import { getV2Feed } from '@/api/facades/generated/feed-v2/feed-v2'
import type { GetV2FeedParams } from '@/api/facades/generated/peakdaApi.schemas'

// 서버 컴포넌트(/feed 첫 HTML)에서 import 해도 안전하다 — feed.ts 는 클라이언트 훅을 품고 있어 분리했다.
// options 로 캐시 설정(next.revalidate)을 넘긴다. 서버 요청에는 사용자 쿠키가 없어 내 리액션은 항상 비어 있다.
export async function feedListApi(params: GetV2FeedParams, options?: RequestInit) {
  const res = await getV2Feed(params, options)
  return res.data.data ?? null
}
