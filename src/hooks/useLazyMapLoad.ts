'use client'

import { kakaoLoader } from '@/lib/kakao/kakaoLoader'
import { RefObject, useCallback, useEffect, useState } from 'react'

export const useLazyMapLoad = (containerRef: RefObject<HTMLDivElement | null>) => {
  const [shouldLoad, setShouldLoad] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px', threshold: 0 }
    )

    if (containerRef.current) observer.observe(containerRef.current)

    return () => observer.disconnect()
  }, [containerRef])

  useEffect(() => {
    if (!shouldLoad) return

    setError(null)
    kakaoLoader
      .load(process.env.NEXT_PUBLIC_KAKAO_MAP_KEY!)
      .then(() => setIsReady(true))
      .catch((err: Error) => {
        setError(err)
        console.error(err)
      })
  }, [shouldLoad, retryCount])

  const retry = useCallback(() => setRetryCount((c) => c + 1), [])

  return { isReady, error, retry }
}
