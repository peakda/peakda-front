import type { Metadata } from 'next'
import { STEPS } from '@/constants'
import { SITE_DESCRIPTION } from '@/constants/site'
import { OnboardingCarousel } from './_components/OnboardingCarousel'

export const metadata: Metadata = {
  title: { absolute: '피크다 Peakda 시작하기' },
  description: SITE_DESCRIPTION,
  robots: { index: false, follow: false },
}

export default function OnboardingPage() {
  return <OnboardingCarousel steps={STEPS} />
}
