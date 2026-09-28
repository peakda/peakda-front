import type { Metadata } from 'next'

// /explore metadata. 하위 탐색 화면(spots·festivals)은 각자의 layout 에서 덮어쓴다.
export const metadata: Metadata = {
  title: '탐색',
  description: '지금 절정인 명소, 다음 주에 가면 좋을 곳, 요즘 뜨는 축제를 한눈에 확인하세요.',
  alternates: { canonical: '/explore' },
}

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return children
}
