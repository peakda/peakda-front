import type { Metadata } from 'next'

export const metadata: Metadata = {
  // 부모(/explore) 레이아웃이 title 을 정의해 루트 템플릿('%s | Peakda')이 여기까지 오지 않는다.
  title: { absolute: '개화 명소 모아보기 | Peakda' },
  description: '지금 절정이거나 다음 주에 절정을 맞는 계절 명소를 확인하세요.',
  // ?section 에 따라 목록이 달라 한 주소로 모을 수 없다. 부모(/explore)의 canonical 을 물려받지 않게 비운다.
  alternates: { canonical: null },
}

export default function ExploreSpotsLayout({ children }: { children: React.ReactNode }) {
  return children
}
