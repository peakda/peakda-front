import type { Metadata } from 'next'

export const metadata: Metadata = {
  // 부모(/explore) 레이아웃이 title 을 정의해 루트 템플릿('%s | Peakda')이 여기까지 오지 않는다.
  title: { absolute: '요즘 뜨는 축제 | Peakda' },
  description: '지금 진행 중인 계절 축제의 일정과 장소를 확인하세요.',
  alternates: { canonical: '/explore/festivals' },
}

export default function ExploreFestivalsLayout({ children }: { children: React.ReactNode }) {
  return children
}
