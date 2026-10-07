import type { Metadata } from 'next'
import { createPageMetadata } from '@/lib/utils/pageMetadata'
import { Suspense } from 'react'
import { MapContainer } from '@/components/Map/MapContainer'
import { MapSkeleton } from '@/components/Map/MapSkeleton'
import { getKakaoMapSdkBootstrap, getKakaoMapSdkUrl } from '@/lib/kakao/kakaoLoader'

export const metadata: Metadata = createPageMetadata({
  title: '전국 명소 지도·개화 지도',
  description:
    '벚꽃·유채꽃·수국 등 계절 명소의 위치와 개화 추정 상태를 지도에서 확인하세요. 단풍·억새 명소와 최근 방문 기록을 살펴보고 여행할 장소를 골라보세요.',
  path: '/map',
})

// MapContainer 는 useSearchParams 를 쓰지 않아(쿼리는 effect 에서 직접 읽는다) 서버 HTML 에
// 헤더·검색바·내비·스켈레톤까지 그대로 담긴다. useSearchParams 를 다시 쓰면 이 경계까지
// 클라이언트 렌더링으로 빠져 아래 fallback(스켈레톤)만 남으니 주의할 것.
export default function MapPage() {
  const appKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY
  const apiOrigin = process.env.NEXT_PUBLIC_API_URL
    ? new URL(process.env.NEXT_PUBLIC_API_URL).origin
    : null

  return (
    <>
      <link rel="preconnect" href="https://mts.kakaocdn.net" />
      {/* API는 credentials: 'include'로 호출하므로 기본 credential 모드로 연결한다. */}
      {apiOrigin && <link rel="preconnect" href={apiOrigin} />}
      {appKey && <link rel="preload" as="script" href={getKakaoMapSdkUrl(appKey)} />}
      {/* 번들을 기다리지 않고 HTML 을 읽는 즉시 SDK·엔진 로드를 시작한다(getKakaoMapSdkBootstrap 참고).
          다른 화면에서 클라이언트 이동으로 들어오면 React 가 이 스크립트를 실행하지 않아 로더가 직접 시작한다. */}
      {appKey && <script dangerouslySetInnerHTML={{ __html: getKakaoMapSdkBootstrap(appKey) }} />}
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
