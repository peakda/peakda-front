import type { Metadata } from 'next'
import { createPageMetadata } from '@/lib/utils/pageMetadata'

// 피드 목록은 클라이언트 페이지라 metadata 를 레이아웃에서 준다. /feed/[id] 는 자체 canonical 로 덮어쓴다.
export const metadata: Metadata = createPageMetadata({
  title: '계절 명소 방문 기록·현장 사진',
  description:
    '여행자들이 남긴 꽃구경·계절 명소 방문 기록과 현장 사진을 확인하세요. 최근 기록을 살펴보고 가고 싶은 명소의 모습을 만나보세요.',
  path: '/feed',
})

export default function FeedLayout({ children }: { children: React.ReactNode }) {
  return children
}
