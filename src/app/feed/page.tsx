import { feedListApi } from '@/api/facades/feed-list'
import { PAGE_SIZE } from '@/api/facades/pagination'
import { GetFeedFilter } from '@/api/facades/generated/peakdaApi.schemas'
import { FeedClient } from '@/app/feed/_components/FeedClient'

// 검색엔진이 받는 첫 HTML 에 '전체' 탭 첫 페이지 기록과 상세 링크가 담기도록 서버에서 먼저 조회한다.
// 사용자 쿠키가 없는 비로그인 기준 응답이라 새 기록이 늦게 보이지 않도록 1분만 서버에서 재사용한다.
// 실패는 null 로 넘기고 클라이언트가 다시 조회한다.
async function getInitialPage() {
  // API 주소가 없는 환경(Vercel Preview 등)에서 상대 URL 로 캐시 fetch 를 하면 에러를 잡아도 빌드 워커가 끝나지 않는다.
  if (!process.env.NEXT_PUBLIC_API_URL) return null
  try {
    return await feedListApi(
      { filter: GetFeedFilter.ALL, pageRequest: { page: 0, size: PAGE_SIZE } },
      { next: { revalidate: 60 } }
    )
  } catch (error) {
    console.error('[feed] 서버 조회 실패 — 클라이언트 조회로 대체', error)
    return null
  }
}

export default async function FeedPage() {
  return <FeedClient initialPage={await getInitialPage()} />
}
