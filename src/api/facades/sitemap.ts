import { customInstance } from '@/api/mutator'

// GET /api/sitemap 은 dev swagger 에 아직 없어 orval 생성 코드 없이 직접 호출한다.
// swagger 에 생기면 pnpm generate:api 후 생성 함수로 바꾼다.

export interface SitemapEntry {
  id: number
  // 상세 화면 내용이 실제로 바뀐 시각 (ISO 8601)
  updatedAt: string
}

export interface SitemapResponse {
  spots: SitemapEntry[]
  festivals: SitemapEntry[]
  curations: SitemapEntry[]
}

interface SitemapApiResponse {
  data: { data?: SitemapResponse | null }
}

// 공개 스팟(LOCAL 제외)·전체 축제·발행 큐레이션의 id 와 수정 시각. 로그인 없이 호출한다. 하루 한 번 호출 전제.
export async function sitemapApi(options?: RequestInit) {
  const res = await customInstance<SitemapApiResponse>('/api/sitemap', { ...options, method: 'GET' })
  return res.data.data ?? null
}
