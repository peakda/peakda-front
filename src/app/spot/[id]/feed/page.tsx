import { SpotFeedClient } from './_components/SpotFeedClient'

// 본문은 전부 클라이언트가 받고, 서버 HTML 은 헤더와 '불러오는 중'뿐이라 사용자별 내용이 없다.
// generateStaticParams 가 없으면 이런 화면도 매 요청 서버에서 다시 그린다(ƒ, no-store). 빈 목록을 주면 첫 요청 때
// 만들어 재사용해, 스팟 화면의 '더보기' 링크가 미리 받아 둔 뒤 바로 넘어간다(스팟 상세와 같은 구조).
export async function generateStaticParams() {
  return []
}

export default function SpotFeedPage() {
  return <SpotFeedClient />
}
