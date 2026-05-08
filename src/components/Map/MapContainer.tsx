'use client'

import { useLazyMapLoad } from '@/hooks/useLazyMapLoad'
import { useEffect, useRef } from 'react'
import MainMessage from '../ui/MainMessage'
import Header from '../ui/Header'
import Image from 'next/image'

const initMap = (container: HTMLElement) => {
  return new kakao.maps.Map(container, {
    center: new kakao.maps.LatLng(36.5665, 127.978),
    level: 13,
    draggable: true,
    scrollwheel: true,
    disableDoubleClickZoom: false,
    mapTypeId: kakao.maps.MapTypeId.ROADMAP,
  })
}

export const MapContainer = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const isReady = useLazyMapLoad(containerRef)

  useEffect(() => {
    if (!isReady || !containerRef.current) return
    initMap(containerRef.current)
  }, [isReady])

  return (
    <div
      ref={containerRef}
      id="kakao-map"
      className="py-11"
      style={{ width: '100%', height: '100dvh', contain: 'strict' }}
    >
      {isReady && (
        <Header
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
            <div className="bg-bg-primary border-border-primary rounded-full p-1">
              <Image
                src={'/icons/alram.svg'}
                alt="알람"
                width={20}
                height={20}
                className="h-6 w-6"
              />
            </div>
          }
        />
      )}

      {!isReady && (
        <div className="flex min-h-screen flex-col items-center justify-center py-11">
          <MainMessage />
        </div>
      )}
    </div>
  )
}
