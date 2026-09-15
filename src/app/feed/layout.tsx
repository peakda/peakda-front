import type { Metadata } from 'next'

// 피드 목록은 클라이언트 페이지라 metadata 를 레이아웃에서 준다. /feed/[id] 는 자체 canonical 로 덮어쓴다.
export const metadata: Metadata = {
  title: '피드',
  description: '다른 여행자들이 남긴 계절 명소 방문 기록과 현장 사진을 확인하세요.',
  alternates: { canonical: '/feed' },
}

export default function FeedLayout({ children }: { children: React.ReactNode }) {
  return children
}
