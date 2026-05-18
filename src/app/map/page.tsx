import type { Metadata } from 'next'
import { MapContainer } from '@/components/Map/MapContainer'

export const metadata: Metadata = {
  title: '지도',
  description: '지도에서 내 주변 계절 명소와 실시간 개화 상태를 확인하세요.',
}

export default function MapPage() {
  return <MapContainer />
}
  