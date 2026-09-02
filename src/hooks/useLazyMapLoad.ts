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

  const retry = useCallback(() => setRetryCount((c) => c + 1), [])

  return { isReady, error, retry }
}
