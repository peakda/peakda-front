import { exploreSpotsApi } from '@/api/facades/explore-spots'
import { PAGE_SIZE } from '@/api/facades/pagination'
import type { GetExploreSpotsSection } from '@/api/facades/generated/peakdaApi.schemas'
import { toExploreSection } from '@/lib/utils/explore'
import { ExploreSpotsClient } from './_components/ExploreSpotsClient'

interface ExploreSpotsPageProps {
  searchParams: Promise<{ section?: string | string[] }>
}

// 검색엔진이 받는 첫 HTML 에 첫 페이지 명소 카드와 링크가 담기도록 서버에서 먼저 조회한다.
// 사용자 쿠키가 없는 비로그인 기준 응답이라 5분 동안 서버에서 재사용한다(섹션별 URL 단위).
// 실패는 null 로 넘기고 클라이언트가 다시 조회한다.
async function getInitialPage(section: GetExploreSpotsSection) {
  try {
    return await exploreSpotsApi(
      { section, pageRequest: { page: 0, size: PAGE_SIZE } },
      { next: { revalidate: 300 } }
    )
  } catch (error) {
    console.error('[explore/spots] 서버 조회 실패 — 클라이언트 조회로 대체', error)
    return null
  }
}

export default async function ExploreSpotsPage({ searchParams }: ExploreSpotsPageProps) {
  const section = toExploreSection((await searchParams).section)
  return <ExploreSpotsClient section={section} initialPage={await getInitialPage(section)} />
}
