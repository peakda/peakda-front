import type { Metadata } from 'next'
import SplashScreen from '@/app/_components/SplashScreen'

export const metadata: Metadata = {
  title: 'Peakda | 계절 여행 타이밍',
  description: '벚꽃·단풍 등 20여 개 계절 명소의 실시간 개화 상태를 확인하세요.',
}

export default function Home() {
  return <SplashScreen />
}
