'use client'

import { useLazyMapLoad } from '@/hooks/useLazyMapLoad'
import { useEffect, useRef } from 'react'
import { MapSkeleton } from './MapSkeleton'

const initMap = (container: HTMLElement) => {
  return new kakao.maps.Map(container, {
    center: new kakao.maps.LatLng(37.5665, 126.978),
    level: 3,
    draggable: true,
    scrollwheel: false,
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
      {!isReady && <MapSkeleton />}
    </div>
  )
}