'use client'

import MainMessage from '@/components/ui/message/MainMessage'
import { cn } from '@/lib/utils/cn'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function SplashScreen() {
  const router = useRouter()
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const isOnboardingDone = localStorage.getItem('is_onboarding_done') === 'true'

    const timers: ReturnType<typeof setTimeout>[] = []

    if (isOnboardingDone) {
      timers.push(setTimeout(() => setIsExiting(true), 1500))
      timers.push(setTimeout(() => router.replace('/login'), 2000))
    } else {
      timers.push(setTimeout(() => setIsExiting(true), 1500))
      timers.push(setTimeout(() => router.push('/onboarding'), 2000))
    }

    return () => timers.forEach(clearTimeout)
  }, [router])

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
