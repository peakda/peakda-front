'use client'

import { MainMessage } from '@/components/ui/message/MainMessage'
import { STEPS } from '@/constants'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { OnboardingCarousel } from '@/app/onboarding/_components/OnboardingCarousel'

export function SplashScreen() {
  const router = useRouter()
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    const isOnboardingDone = localStorage.getItem('is_onboarding_done') === 'true'

    if (isOnboardingDone) {
      // 재방문자는 바로 지도로 이동한다. 지도 자체의 스켈레톤이 로딩을 안내한다.
      router.replace('/map')
    } else {
      // 첫 방문 온보딩을 루트 안에서 보여 준다. /onboarding 으로 자동 이동하면 검색 크롤러가
      // 루트 URL 에 온보딩 title·본문을 연결하므로 홈의 canonical·metadata 를 유지해야 한다.
      setShowOnboarding(true)
    }
  }, [router])

  if (showOnboarding) return <OnboardingCarousel steps={STEPS} />

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-11">
      <MainMessage />
    </div>
  )
}
