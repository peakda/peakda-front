import { useEffect, useRef } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { createElement } from 'react'
import { Pin, type FlowerItem } from '@/components/Map/Pin'

type Stage = 'Before' | 'Start' | 'Peak'

export interface MapSpot {
  lat: number
  lng: number
  flowers: FlowerItem[]
  maxStage: Stage
}

export function useMapPins(map: kakao.maps.Map | null, spots: MapSpot[]) {
  const overlaysRef = useRef<kakao.maps.CustomOverlay[]>([])
  const rootsRef = useRef<Root[]>([])

  useEffect(() => {
    if (!map) return

    overlaysRef.current.forEach((o) => o.setMap(null))
    rootsRef.current.forEach((r) => r.unmount())
    overlaysRef.current = []
    rootsRef.current = []

    spots.forEach((spot) => {
      const container = document.createElement('div')
      container.style.display = 'inline-block'
      const root = createRoot(container)
      root.render(createElement(Pin, { flowers: spot.flowers, maxStage: spot.maxStage }))

      const overlay = new kakao.maps.CustomOverlay({
        position: new kakao.maps.LatLng(spot.lat, spot.lng),
        content: container,
        xAnchor: 0.5,
        yAnchor: 1,
      })
      overlay.setMap(map)

      overlaysRef.current.push(overlay)
      rootsRef.current.push(root)
    })

    return () => {
      overlaysRef.current.forEach((o) => o.setMap(null))
      rootsRef.current.forEach((r) => r.unmount())
      overlaysRef.current = []
      rootsRef.current = []
    }
  }, [map, spots])
}
