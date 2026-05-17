'use client'

import { useLazyMapLoad } from '@/hooks/useLazyMapLoad'
import { useEffect, useRef, useState } from 'react'
import MainMessage from '../ui/MainMessage'
import Header from '../ui/Header'
import Image from 'next/image'
import { prefetchInitialTiles } from '@/lib/kakao/tilePrefetch'
import Nav from '../ui/Nav'
import LocationBtn from '../ui/LocationBtn'
import { SearchBar } from '../ui/SearchBar'
import Category from '../ui/Category'

const DEFAULT_CENTER = {
  lat: 36.5665,
  lng: 127.978,
}

const initMap = (container: HTMLElement) => {
  const map = new kakao.maps.Map(container, {
    center: new kakao.maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng),
    level: 13,
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
  const isReady = useLazyMapLoad(containerRef)
  const [search, setSearch] = useState('')
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/map-tile-sw.js').catch(console.error)
    }
  }, [])

  useEffect(() => {
    if (!isReady || !containerRef.current) return

    prefetchInitialTiles(DEFAULT_CENTER, 13)
    initMap(containerRef.current)
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
      <LocationBtn />
      <Nav activeTab="map" />
    </div>
  )
}
