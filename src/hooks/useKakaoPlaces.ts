'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { kakaoLoader } from '@/lib/kakao/kakaoLoader'

export type KakaoPlace = kakao.maps.services.PlacesSearchResultItem
export type PlaceSearchStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error'
export type PlacesSdkStatus = 'loading' | 'ready' | 'error'

export const useKakaoPlaces = () => {
  const placesRef = useRef<kakao.maps.services.Places | null>(null)
  const [sdkStatus, setSdkStatus] = useState<PlacesSdkStatus>('loading')
  const [searchStatus, setSearchStatus] = useState<PlaceSearchStatus>('idle')
  const [searchedKeyword, setSearchedKeyword] = useState('')
  const [results, setResults] = useState<KakaoPlace[]>([])
  // 마지막 검색 번호. 늦게 도착한 이전 검색 응답이 최신 결과를 덮지 않도록 번호가 다르면 버린다.
  const requestIdRef = useRef(0)

  const retrySdk = useCallback(() => {
    setSdkStatus('loading')
    kakaoLoader
      .load(process.env.NEXT_PUBLIC_KAKAO_MAP_KEY!)
      .then(() => {
        placesRef.current = new window.kakao.maps.services.Places()
        setSdkStatus('ready')
      })
      .catch((err: Error) => {
        console.error(err)
        setSdkStatus('error')
      })
  }, [])

  useEffect(() => {
    retrySdk()
  }, [retrySdk])

  const search = useCallback((keyword: string) => {
    const requestId = ++requestIdRef.current
    const term = keyword.trim()
    setSearchedKeyword(term)
    setResults([])
    if (term.length === 0) {
      setSearchStatus('idle')
      return
    }
    if (!placesRef.current) return

    setSearchStatus('loading')
    try {
      placesRef.current.keywordSearch(term, (data, status) => {
        if (requestId !== requestIdRef.current) return
        if (status === window.kakao.maps.services.Status.OK) {
          setResults(data)
          setSearchStatus(data.length > 0 ? 'success' : 'empty')
        } else {
          setSearchStatus(
            status === window.kakao.maps.services.Status.ZERO_RESULT ? 'empty' : 'error'
          )
        }
      })
    } catch (err) {
      console.error(err)
      setSearchStatus('error')
    }
  }, [])

  return {
    isReady: sdkStatus === 'ready',
    sdkStatus,
    searchStatus,
    searchedKeyword,
    results,
    search,
    retrySdk,
  }
}
