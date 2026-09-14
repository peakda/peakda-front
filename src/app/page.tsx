import type { Metadata } from 'next'
import { SplashScreen } from '@/app/_components/SplashScreen'
import { SITE_DESCRIPTION, SITE_TITLE } from '@/constants/site'

export const metadata: Metadata = {
  // 레이아웃 템플릿('Peakda | %s')을 타면 'Peakda | Peakda | …' 가 되므로 그대로 쓴다.
  title: { absolute: SITE_TITLE },
  description: SITE_DESCRIPTION,
  alternates: { canonical: '/' },
}

export default function Home() {
  return <SplashScreen />
}
