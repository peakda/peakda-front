// OnboardingPage.tsx
'use client'

import Card from '@/components/ui/Card'
import OnboardingMessage from '@/components/ui/OnboardingMessage'
import { STEPS } from '@/constants'
import { useCarousel } from '@/hooks/useEmblaCarousel'
import { cn } from '@/lib/utils/cn'
import { useRouter } from 'next/navigation'
import SkipButton from './_components/SkipButton'
import Indecator from './_components/Indecator'
import Button from '@/components/ui/Button'
import Header from '@/components/ui/Header'

export default function OnboardingPage() {
  const router = useRouter()
  const { emblaRef, selectedIndex, scrollSnaps, scrollTo, scrollNext } = useCarousel({
    loop: false,
    align: 'center',
  })

  const isLast = selectedIndex === STEPS.length - 1

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
    <main className="relative h-dvh w-full overflow-hidden">
      {/* 상단 skip */}
      <Header
        right={<SkipButton handleSkip={handleSkip} isLast={isLast} />}
        center={
          <Indecator scrollSnaps={scrollSnaps} selectedIndex={selectedIndex} scrollTo={scrollTo} />
        }
      />
      {/* 슬라이드 */}
      <div ref={emblaRef} className="h-full overflow-hidden">
        <div className="flex h-full touch-pan-y">
          {STEPS.map((step, index) => (
            <div
              key={index}
              className="relative flex h-full flex-[0_0_100%] flex-col items-center justify-between"
            >
              {/* 메인 영역 */}
              <div className="relative z-10 flex w-full flex-1 flex-col items-center justify-center gap-10 px-8 pt-20">
                <OnboardingMessage step={step} />
                <div
                  className={cn(
                    'grid w-full',
                    step.Card?.length === 1 ? 'grid-cols-1' : 'grid-cols-3 gap-2'
                  )}
                >
                  {step.Card &&
                    step.Card.map((card, idx) => (
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

              {/* 하단 빈 공간 */}
              <div className="h-[70%] flex-none" />
            </div>
          ))}
        </div>
      </div>

      {/* CTA 버튼 */}
      <div className="absolute right-0 bottom-0 left-0 z-20 px-6 pb-10">
        <Button
          variant="filled"
          size="lg"
          color="primary"
          onClick={handleNext}
          className="bg-[#8DC468] text-white hover:bg-[#8DC468]"
        >
          {isLast ? '시작하기' : '다음'}
        </Button>
      </div>
    </main>
  )
}
