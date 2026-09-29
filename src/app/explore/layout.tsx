import type { Metadata } from 'next'
import { createPageMetadata } from '@/lib/utils/pageMetadata'

// /explore metadata. 하위 탐색 화면(spots·festivals)은 각자의 layout 에서 덮어쓴다.
export const metadata: Metadata = createPageMetadata({
  title: '계절 여행 명소·꽃구경 추천',
  description:
    '지금 절정이거나 다음 주에 가기 좋은 계절 명소를 찾아보세요. 꽃구경 명소와 계절 축제, 여행 큐레이션을 피크다에서 둘러보세요.',
  path: '/explore',
})

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return children
}
