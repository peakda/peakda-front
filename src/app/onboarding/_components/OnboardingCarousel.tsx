'use client'

import { Button } from '@/components/ui/button/Button'
import { Header } from '@/components/ui/layout/Header'
import { useCarousel } from '@/hooks/useEmblaCarousel'
import type { StepProps } from '@/types/types'
import { writeStorage } from '@/lib/utils/storage'
import { track } from '@/lib/analytics'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Indecator } from './Indecator'
import { SkipButton } from './SkipButton'
import { OnboardingMain } from './OnboardingMain'

interface Props {
  steps: readonly StepProps[]
}

export function OnboardingCarousel({ steps }: Props) {
  const router = useRouter()
  const { emblaRef, selectedIndex, scrollSnaps, scrollTo, scrollNext } = useCarousel(
    {
      loop: false,
      align: 'center',
    },
    steps.length
  )

  const isLast = selectedIndex === steps.length - 1
  // 1부터 센다. 몇 번째 장에서 그만두는지 본다.
  const step = selectedIndex + 1

  useEffect(() => {
    track('onboarding_step', { step })
  }, [step])

  const completeOnboarding = () => {
    writeStorage('is_onboarding_done', 'true')
    router.replace('/map')
  }

  const handleNext = () => {
    if (isLast) {
      completeOnboarding()
    } else {
      scrollNext()
    }
  }

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden py-11">
      <Header
        right={
          <SkipButton
            handleSkip={() => {
              track('onboarding_skip', { step })
              completeOnboarding()
            }}
            isLast={isLast}
          />
        }
        center={
          <Indecator scrollSnaps={scrollSnaps} selectedIndex={selectedIndex} scrollTo={scrollTo} />
        }
      />

      <div ref={emblaRef} className="slide-in-from-bottom-2 flex-1 overflow-hidden">
        <OnboardingMain steps={steps} selectedIndex={selectedIndex} />
      </div>

      <div className="absolute right-0 bottom-0 left-0 z-20 px-6 pb-10 delay-200 duration-500">
        <Button
          variant="filled"
          size="lg"
          color="primary"
          onClick={handleNext}
          className="text-white"
        >
          다음
        </Button>
      </div>
    </div>
  )
}
