'use client'

import { useLazyMapLoad } from '@/hooks/useLazyMapLoad'
import { useCallback, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import MainMessage from '../ui/message/MainMessage'
import Header from '../ui/layout/Header'
import Image from 'next/image'
import { prefetchInitialTiles } from '@/lib/kakao/tilePrefetch'
import Nav from '../ui/layout/Nav'
import LocationBtn from '../ui/button/LocationBtn'
import { SearchBar } from '../ui/form/SearchBar'
import Category from '../ui/category/Category'
import { toast } from 'sonner'
import { useMapCluster } from '@/hooks/useMapPins'
import { useDrawerStore } from '@/stores/useDrawerStore'
import { TEST_SPOTS } from '@/constants/testSpots'

const Drawer = dynamic(
  () => import('@/components/ui/layout/Drawer').then((m) => ({ default: m.Drawer })),
  { ssr: false }
)

const DEFAULT_CENTER = {
  lat: 37.5662,
  lng: 126.9785,
}

const NETWORK_TOAST_ID = 'map-network-error'

function panToCurrentLocation(map: kakao.maps.Map, onPermissionDenied?: () => void) {
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => map.panTo(new kakao.maps.LatLng(coords.latitude, coords.longitude)),
    (err) => {
      if (err.code === err.PERMISSION_DENIED) onPermissionDenied?.()
    }
  )
}

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

export const MapContainer = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<kakao.maps.Map | null>(null)
  const [mapInstance, setMapInstance] = useState<kakao.maps.Map | null>(null)
  const { isReady, error, retry } = useLazyMapLoad(containerRef)
  const { snapHeight, openDrawer } = useDrawerStore()

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
    if (!mapRef.current) return
    panToCurrentLocation(mapRef.current, () => {
      toast.error('위치 권한이 필요합니다.', {
        description: '브라우저 설정에서 위치 권한을 허용해주세요.',
      })
    })
  }, [])

  useEffect(() => {
    if (!isReady || !containerRef.current || mapRef.current) return

    prefetchInitialTiles(DEFAULT_CENTER, 13)
    mapRef.current = initMap(containerRef.current)
    setMapInstance(mapRef.current)
    panToCurrentLocation(mapRef.current)
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
        placeholder="지금 피크인 곳을 검색해보세요."
        description="벚꽃 만개 지역"
        onFilterClick={openDrawer}
      />
      <LocationBtn
        onLocate={handleLocate}
        style={{
          bottom: snapHeight > 0 ? `${snapHeight + 16}px` : '96px',
          transition: 'bottom 0.5s cubic-bezier(0.32,0.72,0,1)',
        }}
      />
      <Nav activeTab="map" />
      <Drawer />
    </div>
  )
}
