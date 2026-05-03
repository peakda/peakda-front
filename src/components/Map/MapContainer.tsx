'use client'

import { useLazyMapLoad } from '@/hooks/useLazyMapLoad'
import { useEffect, useRef } from 'react'
import { MapSkeleton } from './MapSkeleton'
import MainMessage from '../ui/MainMessage'

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
      style={{ width: '100%', height: '100dvh', contain: 'strict' }}
    >
      {!isReady &&<div className="flex min-h-screen flex-col items-center justify-center py-11">
            <MainMessage />
          </div>}
    </div>
  )
}