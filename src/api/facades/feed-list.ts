import { getFeed } from '@/api/facades/generated/feed/feed'
import type { GetFeedParams } from '@/api/facades/generated/peakdaApi.schemas'

// 서버 컴포넌트(/feed 첫 HTML)에서 import 해도 안전하다 — feed.ts 는 클라이언트 훅을 품고 있어 분리했다.
// options 로 캐시 설정(next.revalidate)을 넘긴다. 서버 요청에는 사용자 쿠키가 없어 내 리액션은 항상 비어 있다.
export async function feedListApi(params: GetFeedParams, options?: RequestInit) {
  const res = await getFeed(params, options)
  return res.data.data ?? null
}
