import type { Metadata } from 'next'
import { Suspense } from 'react'
import { MapContainer } from '@/components/Map/MapContainer'
import { MapSkeleton } from '@/components/Map/MapSkeleton'

export const metadata: Metadata = {
  title: '지도',
  description: '지도에서 내 주변 계절 명소와 실시간 개화 상태를 확인하세요.',
}

// MapContainer 가 useSearchParams(?lat/?lng)를 쓰므로 App Router 에서 Suspense 경계가 필요하다.
// fallback 이 null 이면 서버가 보내는 HTML 에 지도 영역이 비어 있어 LCP 후보가 하이드레이션
// 이후에야 생긴다. 스켈레톤을 두면 첫 HTML 에 로고가 담기고, 높이를 MapContainer(100dvh)와
// 맞춰 지도로 교체될 때 레이아웃이 밀리지 않는다.
export default function MapPage() {
  return (
    <Suspense
      fallback={
        <div className="h-dvh">
          <MapSkeleton />
        </div>
      }
    >
      <MapContainer />
    </Suspense>
  )
}
