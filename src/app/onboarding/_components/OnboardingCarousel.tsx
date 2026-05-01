'use client'

import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Header from '@/components/ui/Header'
import OnboardingMessage from '@/components/ui/OnboardingMessage'
import { useCarousel } from '@/hooks/useEmblaCarousel'
import { cn } from '@/lib/utils/cn'
import type { stepProps } from '@/types/types'
import { useRouter } from 'next/navigation'
import Indecator from './Indecator'
import SkipButton from './SkipButton'
import { Divide } from 'lucide-react'

interface Props {
  steps: readonly stepProps[]
}

export default function OnboardingCarousel({ steps }: Props) {
  const router = useRouter()
  const { emblaRef, selectedIndex, scrollSnaps, scrollTo, scrollNext } = useCarousel(
    {
      loop: false,
      align: 'center',
    },
    steps.length
  )

  const isLast = selectedIndex === steps.length - 1

  const handleNext = () => {
    if (isLast) {
      localStorage.setItem('is_onboarding_done', 'true')
      router.replace('/login')
    } else {
      scrollNext()
    }
  }

  const handleSkip = () => {
    localStorage.setItem('is_onboarding_done', 'true')
    router.replace('/login')
  }

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden py-11">
      {/* Header — 위에서 내려오며 등장 */}

      <Header
        right={<SkipButton handleSkip={handleSkip} isLast={isLast} />}
        center={
          <Indecator scrollSnaps={scrollSnaps} selectedIndex={selectedIndex} scrollTo={scrollTo} />
        }
      />

      {/* 캐러셀 — 아래에서 페이드인 */}
      <div
        ref={emblaRef}
        className="animate-in fade-in slide-in-from-bottom-2 flex-1 overflow-hidden delay-100 duration-500"
      >
        <div className="flex h-full touch-pan-y">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative flex h-full flex-[0_0_100%] flex-col items-center justify-between px-4"
            >
              <div className="relative z-10 flex w-full flex-1 flex-col items-center justify-center gap-10 pt-20">
                <OnboardingMessage step={step} />
                <div
                  className={cn(
                    'grid w-full',
                    step.Card?.length === 1 ? 'grid-cols-1' : 'grid-cols-3 gap-2'
                  )}
                >
                  {step.Card?.map((card, idx) => (
                    <Card
                      key={idx}
                      variant={card.variant ?? 'big'}
                      title={card.title ?? ''}
                      description={card.description ?? ''}
                      image={card.image ?? ''}
                      className="w-full"
                    />
                  ))}
                </div>
              </div>
              <div className="h-[70%] flex-none" />
            </div>
          ))}
        </div>
      </div>

      {/* CTA 버튼 — 아래에서 슬라이드업 */}
      <div className="absolute right-0 bottom-0 left-0 z-20 px-6 pb-10 delay-200 duration-500">
        <Button
          variant="filled"
          size="lg"
          color="primary"
          onClick={handleNext}
          className="bg-brand-secondary hover:bg-brand-secondary text-white"
        >
          다음
        </Button>
      </div>
    </div>
  )
}
