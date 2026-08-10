'use client'

import { MainMessage } from '@/components/ui/message/MainMessage'

// SDK 로드 전 지도 자리를 채운다. Suspense fallback 으로도 쓸 수 있게 컴포넌트로 분리.
export const MapSkeleton = () => (
  <div
    className="flex h-full w-full flex-col items-center justify-center"
    aria-label="지도 로딩 중"
    aria-busy="true"
  >
    <MainMessage />
  </div>
)
