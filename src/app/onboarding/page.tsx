import type { Metadata } from 'next'
import { STEPS } from '@/constants'
import OnboardingCarousel from './_components/OnboardingCarousel'

export const metadata: Metadata = {
  title: '온보딩',
  description: '피크다와 함께 계절 여행 타이밍을 놓치지 마세요.',
}

export default function OnboardingPage() {
  return <OnboardingCarousel steps={STEPS} />
}
