'use client'

import { kakaoLoader } from '@/lib/kakao/kakaoLoader'
import { RefObject, useEffect, useState } from 'react'

export const useLazyMapLoad = (containerRef: RefObject<HTMLDivElement | null>) => {
  const [shouldLoad, setShouldLoad] = useState(false)
  const [isReady, setIsReady] = useState(false)

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

    kakaoLoader
      .load(process.env.NEXT_PUBLIC_KAKAO_MAP_KEY!)
      .then(() => setIsReady(true))
      .catch(console.error)
  }, [shouldLoad])

  return isReady
}
