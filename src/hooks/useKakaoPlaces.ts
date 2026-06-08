'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { kakaoLoader } from '@/lib/kakao/kakaoLoader'

export type KakaoPlace = kakao.maps.services.PlacesSearchResultItem

export const useKakaoPlaces = () => {
  const placesRef = useRef<kakao.maps.services.Places | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [results, setResults] = useState<KakaoPlace[]>([])

  useEffect(() => {
    kakaoLoader
      .load(process.env.NEXT_PUBLIC_KAKAO_MAP_KEY!)
      .then(() => {
        placesRef.current = new window.kakao.maps.services.Places()
        setIsReady(true)
      })
      .catch((err: Error) => console.error(err))
  }, [])

  const search = useCallback((keyword: string) => {
    if (!placesRef.current || keyword.trim().length === 0) {
      setResults([])
      return
    }

    placesRef.current.keywordSearch(keyword, (data, status) => {
      setResults(status === window.kakao.maps.services.Status.OK ? data : [])
    })
  }, [])

  return { isReady, results, search }
}
