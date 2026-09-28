import { exploreFestivalsApi } from '@/api/facades/explore-festivals'
import { ExploreFestivalsClient } from './_components/ExploreFestivalsClient'

// 검색엔진이 받는 첫 HTML 에 축제 카드와 링크가 담기도록 서버에서 먼저 조회한다.
// 사용자 쿠키가 없는 비로그인 기준 응답이라 5분 동안 서버에서 재사용한다.
// 빌드 중 API 가 죽어 있어도 빌드가 깨지지 않게 실패는 null 로 넘기고, 클라이언트가 다시 조회한다.
async function getInitialFestivals() {
  try {
    return await exploreFestivalsApi(undefined, { next: { revalidate: 300 } })
  } catch (error) {
    console.error('[explore/festivals] 서버 조회 실패 — 클라이언트 조회로 대체', error)
    return null
  }
}

export default async function ExploreFestivalsPage() {
  return <ExploreFestivalsClient initialFestivals={await getInitialFestivals()} />
}
