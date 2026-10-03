import type { Metadata } from 'next'
import { createPageMetadata } from '@/lib/utils/pageMetadata'
import { Suspense } from 'react'
import { MapContainer } from '@/components/Map/MapContainer'
import { MapSkeleton } from '@/components/Map/MapSkeleton'
import { getKakaoMapSdkUrl } from '@/lib/kakao/kakaoLoader'

export const metadata: Metadata = createPageMetadata({
  title: '전국 명소 지도·개화 지도',
  description:
    '벚꽃·유채꽃·수국 등 계절 명소의 위치와 개화 추정 상태를 지도에서 확인하세요. 단풍·억새 명소와 최근 방문 기록을 살펴보고 여행할 장소를 골라보세요.',
  path: '/map',
})

// MapContainer 가 useSearchParams(?lat/?lng)를 쓰므로 App Router 에서 Suspense 경계가 필요하다.
// fallback 이 null 이면 서버가 보내는 HTML 에 지도 영역이 비어 있어 LCP 후보가 하이드레이션
// 이후에야 생긴다. 스켈레톤을 두면 첫 HTML 에 로딩 UI가 담기고, 높이를 MapContainer(100dvh)와
// 맞춰 지도로 교체될 때 레이아웃이 밀리지 않는다.
export default function MapPage() {
  const appKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY
  const apiOrigin = process.env.NEXT_PUBLIC_API_URL
    ? new URL(process.env.NEXT_PUBLIC_API_URL).origin
    : null

  return (
    <>
      <link rel="preconnect" href="https://mts.daumcdn.net" />
      {/* API는 credentials: 'include'로 호출하므로 기본 credential 모드로 연결한다. */}
      {apiOrigin && <link rel="preconnect" href={apiOrigin} />}
      {appKey && <link rel="preload" as="script" href={getKakaoMapSdkUrl(appKey)} />}
      <Suspense
        fallback={
          <div className="h-dvh">
            <MapSkeleton />
          </div>
        }
      >
        <MapContainer />
      </Suspense>
    </>
  )
}
