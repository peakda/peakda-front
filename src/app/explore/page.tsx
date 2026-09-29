import { exploreCurationApi } from '@/api/facades/explore-curation'
import { ExploreClient } from './_components/ExploreClient'

// 검색엔진이 받는 첫 HTML 에 절정·축제·큐레이션 카드와 링크가 담기도록 서버에서 먼저 조회한다.
// 사용자 쿠키가 없는 비로그인 기준 응답이라 5분 동안 서버에서 재사용한다.
// 빌드 중 API 가 죽어 있어도 빌드가 깨지지 않게 실패는 null 로 넘기고, 클라이언트가 다시 조회한다.
async function getInitialExplore() {
  // API 주소가 없는 환경(Vercel Preview 등)에서 상대 URL 로 캐시 fetch 를 하면 에러를 잡아도 빌드 워커가 끝나지 않는다.
  if (!process.env.NEXT_PUBLIC_API_URL) return null
  try {
    return await exploreCurationApi(undefined, { next: { revalidate: 300 } })
  } catch (error) {
    console.error('[explore] 서버 조회 실패 — 클라이언트 조회로 대체', error)
    return null
  }
}

export default async function ExplorePage() {
  return <ExploreClient initialExplore={await getInitialExplore()} />
}
