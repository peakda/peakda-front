'use client'

import { useLazyMapLoad } from '@/hooks/useLazyMapLoad'
import { useCallback, useEffect, useRef, useState } from 'react'
import MainMessage from '../ui/message/MainMessage'
import Header from '../ui/layout/Header'
import Image from 'next/image'
import { prefetchInitialTiles } from '@/lib/kakao/tilePrefetch'
import Nav from '../ui/layout/Nav'
import LocationBtn from '../ui/button/LocationBtn'
import { SearchBar } from '../ui/form/SearchBar'
import Category from '../ui/category/Category'
import { toast } from 'sonner'
import { useMapCluster, type MapSpot } from '@/hooks/useMapPins'

const DEFAULT_CENTER = {
  lat: 37.5662,
  lng: 126.9785,
}

const NETWORK_TOAST_ID = 'map-network-error'

const initMap = (container: HTMLElement) => {
  const map = new kakao.maps.Map(container, {
    center: new kakao.maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng),
    level: 8,
    maxLevel: 13,
    draggable: true,
    scrollwheel: true,
    disableDoubleClickZoom: false,
    mapTypeId: kakao.maps.MapTypeId.ROADMAP,
  })

  return map
}

const TEST_SPOTS: MapSpot[] = [
  {
    lat: 37.5662,
    lng: 126.9785,
    maxStage: 'Peak',
    flowers: [{ src: '/flowers/cherry-blossom.svg', alt: '벚꽃' }, { src: '/flowers/plum.svg', alt: '매화' }],
  },
  {
    lat: 37.5700,
    lng: 126.9820,
    maxStage: 'Start',
    flowers: [{ src: '/flowers/cherry-blossom.svg', alt: '벚꽃' }],
  },
  {
    lat: 37.5640,
    lng: 126.9750,
    maxStage: 'Peak',
    flowers: [{ src: '/flowers/cherry-blossom.svg', alt: '벚꽃' }, { src: '/flowers/royal-azalea.svg', alt: '진달래' }],
  },
  {
    lat: 35.1796,
    lng: 129.0756,
    maxStage: 'Peak',
    flowers: [{ src: '/flowers/cherry-blossom.svg', alt: '벚꽃' }],
  },
  {
    lat: 35.1600,
    lng: 129.0600,
    maxStage: 'Start',
    flowers: [{ src: '/flowers/plum.svg', alt: '매화' }],
  },
  {
    lat: 33.4996,
    lng: 126.5312,
    maxStage: 'Before',
    flowers: [{ src: '/flowers/canola.svg', alt: '유채꽃' }],
  },
  {
    lat: 37.8813,
    lng: 127.7298,
    maxStage: 'Start',
    flowers: [{ src: '/flowers/royal-azalea.svg', alt: '진달래' }],
  },
]

export const MapContainer = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<kakao.maps.Map | null>(null)
  const [mapInstance, setMapInstance] = useState<kakao.maps.Map | null>(null)
  const { isReady, error, retry } = useLazyMapLoad(containerRef)
  const [search, setSearch] = useState('')

  useMapCluster(mapInstance, TEST_SPOTS)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/map-tile-sw.js').catch(console.error)
    }
  }, [])

  useEffect(() => {
    if (!error) return
    toast.error('지도를 불러오지 못했습니다.', {
      id: NETWORK_TOAST_ID,
      description: '네트워크 연결을 확인해주세요.',
      action: {
        label: '재시도',
        onClick: retry,
      },
      duration: Infinity,
    })
  }, [error, retry])

  useEffect(() => {
    if (!isReady) return
    toast.dismiss(NETWORK_TOAST_ID)
  }, [isReady])

  const handleLocate = useCallback(() => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        mapRef.current?.panTo(new kakao.maps.LatLng(coords.latitude, coords.longitude))
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          toast.error('위치 권한이 필요합니다.', {
            description: '브라우저 설정에서 위치 권한을 허용해주세요.',
          })
        }
      }
    )
  }, [])

  useEffect(() => {
    if (!isReady || !containerRef.current || mapRef.current) return

    prefetchInitialTiles(DEFAULT_CENTER, 13)
    mapRef.current = initMap(containerRef.current)
    setMapInstance(mapRef.current)

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        mapRef.current?.panTo(new kakao.maps.LatLng(coords.latitude, coords.longitude))
      },
      () => {
        // 권한 거부 또는 위치 오류 시 서울 시청(DEFAULT_CENTER) 유지
      }
    )
  }, [isReady])

  return (
    <div
      ref={containerRef}
      id="kakao-map"
      className="relative py-11"
      style={{ width: '100%', height: '100dvh', contain: 'strict' }}
    >
      {isReady && (
        <Header
          className="mt-2"
          left={
            <div className="flex items-center justify-center gap-2">
              <Image
                src={'/images/logo.png'}
                alt="로고"
                width={36}
                height={32}
                className="h-8 w-8.5"
              />
              <p className="font-advent text-color-green-700 text-center text-[30px] font-semibold! tracking-tight">
                Peakda
              </p>
            </div>
          }
          right={
            <div className="bg-bg-primary border-border-primary relative rounded-full p-1">
              <Image
                src={'/icons/alram.svg'}
                alt="알람"
                width={20}
                height={20}
                className="h-6 w-6"
              />
              <div className="absolute top-1.5 right-1.5 h-1 w-1 rounded-full bg-pink-500"></div>
            </div>
          }
        />
      )}

      {!isReady && (
        <div className="flex min-h-screen flex-col items-center justify-center py-11">
          <MainMessage />
        </div>
      )}

      <Category />

      <SearchBar
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="지금 피크인 곳을 검색해보세요."
        description="벚꽃 만개 지역"
      />
      <LocationBtn onLocate={handleLocate} />
      <Nav activeTab="map" />
    </div>
  )
}
