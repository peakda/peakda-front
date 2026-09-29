import type { Metadata } from 'next'
import { createPageMetadata } from '@/lib/utils/pageMetadata'

export const metadata: Metadata = createPageMetadata({
  title: '개화·절정 시기별 계절 명소',
  description:
    '지금 절정인 명소와 다음 주에 가기 좋은 계절 명소를 모아보세요. 꽃 종류별로 명소를 살펴보고 개화·절정 시기에 맞춰 여행지를 찾아보세요.',
  path: null,
})

export default function ExploreSpotsLayout({ children }: { children: React.ReactNode }) {
  return children
}
