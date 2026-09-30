import type { Metadata } from 'next'
import { createPageMetadata } from '@/lib/utils/pageMetadata'

export const metadata: Metadata = createPageMetadata({
  title: '꽃 축제·계절 축제 일정과 장소',
  description:
    '지금 진행 중인 꽃 축제와 계절 축제를 찾아보세요. 축제별 일정과 장소를 확인하고 여행 계획을 세워보세요.',
  path: '/explore/festivals',
})

export default function ExploreFestivalsLayout({ children }: { children: React.ReactNode }) {
  return children
}
