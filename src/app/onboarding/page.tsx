// OnboardingPage.tsx
'use client'

import Card from '@/components/ui/Card'
import OnboardingMessage from '@/components/ui/OnboardingMessage'
import { STEPS } from '@/constants'
import { useCarousel } from '@/hooks/useEmblaCarousel'
import { cn } from '@/lib/utils/cn'
import { useRouter } from 'next/navigation'

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
      router.replace('/')
    } else {
      scrollNext()
    }
  }

  const handleSkip = () => {
    localStorage.setItem('is_onboarding_done', 'true')
    router.replace('/')
  }

  return (
    <main className="relative h-dvh w-full overflow-hidden">
      {/* 슬라이드 */}
      <div ref={emblaRef} className="h-full overflow-hidden">
        <div className="flex h-full touch-pan-y">
          {STEPS.map((step, index) => (
            <div
              key={index}
              className="relative flex h-full flex-[0_0_100%] flex-col items-center justify-between"
            >
              {/* 상단 skip */}
              <div className="relative z-10 flex h-9 w-full justify-end px-4 pt-2">
                {!isLast && (
                  <button
                    onClick={handleSkip}
                    className="text-sm font-medium text-gray-700 transition-colors hover:text-gray-600"
                  >
                    건너뛰기
                  </button>
                )}
              </div>

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

      {/* 도트 인디케이터 */}
      <div className="absolute top-4.5 right-0 left-0 z-20 px-6 pb-10">
        <div role="tablist" aria-label="온보딩 단계" className="mb-6 flex justify-center gap-2">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              role="tab"
              aria-selected={index === selectedIndex}
              aria-label={`${index + 1}단계`}
              onClick={() => scrollTo(index)}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                index === selectedIndex ? 'w-6 bg-gray-900' : 'w-2 bg-gray-300'
              )}
            />
          ))}
        </div>
      </div>

      {/* CTA 버튼 */}
      <div className="absolute right-0 bottom-0 left-0 z-20 px-6 pb-10">
        <button
          onClick={handleNext}
          className={cn(
            'w-full rounded-2xl px-4 py-3 text-base font-semibold',
            'transition-all duration-300 active:scale-95',
            'bg-[#8DC468] text-white'
          )}
        >
          {isLast ? '시작하기' : '다음'}
        </button>
      </div>
    </main>
  )
}
