import type { Metadata } from 'next'
import { Suspense } from 'react'
import { MapContainer } from '@/components/Map/MapContainer'

export const metadata: Metadata = {
  title: '지도',
  description: '지도에서 내 주변 계절 명소와 실시간 개화 상태를 확인하세요.',
}

// MapContainer 가 useSearchParams(?lat/?lng)를 쓰므로 App Router 에서 Suspense 경계가 필요하다.
export default function MapPage() {
  return (
    <Suspense fallback={null}>
      <MapContainer />
    </Suspense>
  )
}
