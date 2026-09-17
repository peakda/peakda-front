'use client'

import { MainMessage } from '@/components/ui/message/MainMessage'
import { STEPS } from '@/constants'
import { cn } from '@/lib/utils/cn'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { OnboardingCarousel } from '@/app/onboarding/_components/OnboardingCarousel'

export function SplashScreen() {
  const router = useRouter()
  const [isExiting, setIsExiting] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    const isOnboardingDone = localStorage.getItem('is_onboarding_done') === 'true'

    const timers: ReturnType<typeof setTimeout>[] = []

    if (isOnboardingDone) {
      // 스플래시가 떠 있는 2초를 지도 화면 청크를 받는 데 쓴다.
      // 로그인은 강제하지 않는다 — 비로그인도 지도부터 둘러보고, 로그인이 필요한 기능에서 /login 으로 간다.
      router.prefetch('/map')
      timers.push(setTimeout(() => setIsExiting(true), 1500))
      timers.push(setTimeout(() => router.replace('/map'), 2000))
    } else {
      // 첫 방문 온보딩을 루트 안에서 보여 준다. /onboarding 으로 자동 이동하면 검색 크롤러가
      // 루트 URL 에 온보딩 title·본문을 연결하므로 홈의 canonical·metadata 를 유지해야 한다.
      timers.push(setTimeout(() => setIsExiting(true), 1500))
      timers.push(setTimeout(() => setShowOnboarding(true), 2000))
    }

    return () => timers.forEach(clearTimeout)
  }, [router])

  if (showOnboarding) return <OnboardingCarousel steps={STEPS} />

  return (
    <div
      className={cn(
        'flex min-h-screen flex-col items-center justify-center py-11 transition-opacity duration-500',
        isExiting ? 'opacity-0' : 'opacity-100'
      )}
    >
      <MainMessage />
    </div>
  )
}
