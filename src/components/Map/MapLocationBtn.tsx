'use client'

import { LocationBtn } from '@/components/ui/button/LocationBtn'
import { useDrawerStore } from '@/stores/useDrawerStore'

interface MapLocationBtnProps {
  onLocate: () => void
}

// snapHeight 는 드로어를 스냅할 때마다 바뀐다. MapContainer 가 직접 구독하면
// 그때마다 지도 UI 전체(헤더·칩·검색바·Nav·드로어)가 다시 렌더되므로 이 버튼만 구독한다.
export function MapLocationBtn({ onLocate }: MapLocationBtnProps) {
  const snapHeight = useDrawerStore((s) => s.snapHeight)

  return (
    <LocationBtn
      onLocate={onLocate}
      style={{
        bottom: snapHeight > 0 ? `${snapHeight + 16}px` : '96px',
        transition: 'bottom 0.5s cubic-bezier(0.32,0.72,0,1)',
      }}
    />
  )
}
