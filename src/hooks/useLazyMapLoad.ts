'use client'

import { kakaoLoader } from '@/lib/kakao/kakaoLoader'
import { useCallback, useEffect, useState } from 'react'

// 이 훅 자체가 /map 클라이언트 번들에서만 실행된다. 화면을 가득 채우는 지도를
// IntersectionObserver로 다시 지연하면 SDK 요청이 최소 한 프레임 늦어지므로 즉시 로드한다.
export const useLazyMapLoad = () => {
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    setError(null)
    kakaoLoader
      .load(process.env.NEXT_PUBLIC_KAKAO_MAP_KEY!)
      .then(() => setIsReady(true))
      .catch((err: Error) => {
        setError(err)
        console.error(err)
      })
  }, [retryCount])

  const retry = useCallback(() => {
    // sdk.js 는 실행됐는데 maps.load 가 못 끝난 상태. SDK 내부 스크립트 로더에 onerror 가 없어
    // 요청이 실패했다면 다시 load() 해도 콜백이 영영 오지 않으므로 새로 고침으로만 복구된다.
    if (window.kakao?.maps && !window.kakao.maps.Map) {
      window.location.reload()
      return
    }
    setRetryCount((c) => c + 1)
  }, [])

  return { isReady, error, retry }
}
