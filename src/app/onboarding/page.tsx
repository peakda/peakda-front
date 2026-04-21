'use client'

import { useCarousel } from '@/hooks/useEmblaCarousel'
import { cn } from '@/lib/utils/cn'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

const STEPS = [
  {
    title: 'Peakdo와 함께',
    desc: '지금 가기 가장 좋은 곳을\n찾아요',
    img: '/step1.png',
    bg: 'from-emerald-50 to-green-100',
    accent: '#22c55e',
    emoji: '🌸',
  },
  {
    title: '실시간 데이터',
    desc: '관광공사 API로\n정확한 정보를 제공해요',
    img: '/step2.png',
    bg: 'from-sky-50 to-blue-100',
    accent: '#3b82f6',
    emoji: '📍',
  },
  {
    title: '준비 되셨나요?',
    desc: '나만의 여행 지도를\n완성해보세요',
    img: '/step3.png',
    bg: 'from-rose-50 to-pink-100',
    accent: '#f43f5e',
    emoji: '🗺️',
  },
] as const

export default function OnboardingPage() {
  const router = useRouter()
  const { emblaRef, selectedIndex, scrollSnaps, scrollTo, scrollNext, canScrollNext } = useCarousel(
    { loop: false, align: 'center' }
  )

  // 마지막 스텝에서 스와이프 방지
  const isLast = selectedIndex === STEPS.length - 1

  const handleNext = () => {
    if (isLast) {
      // 온보딩 완료 → 메인으로
      localStorage.setItem('onboarding_done', 'true')
      router.replace('/')
    } else {
      scrollNext()
    }
  }

  const handleSkip = () => {
    localStorage.setItem('onboarding_done', 'true')
    router.replace('/')
  }

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-white">
      {/* 슬라이드 */}
      <div ref={emblaRef} className="h-full overflow-hidden">
        <div className="flex h-full touch-pan-y">
          {STEPS.map((step, index) => (
            <div
              key={index}
              className="relative flex h-full flex-[0_0_100%] flex-col items-center justify-between"
            >
              {/* 배경 그라디언트 */}
              <div
                className={cn(
                  'absolute inset-0 bg-gradient-to-b opacity-60 transition-opacity duration-500',
                  step.bg
                )}
              />

              {/* 상단 skip */}
              <div className="relative z-10 flex w-full justify-end px-6 pt-14">
                {!isLast && (
                  <button
                    onClick={handleSkip}
                    className="text-sm text-gray-400 transition-colors hover:text-gray-600"
                  >
                    건너뛰기
                  </button>
                )}
              </div>

              {/* 이미지 영역 */}
              <div className="relative z-10 flex flex-1 items-center justify-center px-8">
                <div className="relative flex aspect-square w-full max-w-[280px] items-center justify-center">
                  {/* 원형 배경 */}
                  <div
                    className="absolute inset-0 rounded-full opacity-20"
                    style={{ backgroundColor: step.accent }}
                  />
                  {/* 이미지 or 이모지 fallback */}
                  <span className="text-[120px] leading-none">{step.emoji}</span>
                </div>
              </div>

              {/* 텍스트 */}
              <div className="relative z-10 w-full px-8 pb-12 text-center">
                <p className="mb-2 text-sm font-medium tracking-widest text-gray-400 uppercase">
                  {index + 1} / {STEPS.length}
                </p>
                <h1 className="mb-3 text-3xl font-bold tracking-tight text-gray-900">
                  {step.title}
                </h1>
                <p className="text-base leading-relaxed whitespace-pre-line text-gray-500">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 하단 고정 UI */}
      <div className="absolute right-0 bottom-0 left-0 z-20 px-6 pb-10">
        {/* 도트 인디케이터 */}
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

        {/* CTA 버튼 */}
        <button
          onClick={handleNext}
          className={cn(
            'w-full rounded-2xl py-4 text-base font-semibold',
            'transition-all duration-300 active:scale-95',
            isLast
              ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20'
              : 'bg-gray-900 text-white'
          )}
        >
          {isLast ? '시작하기 🌸' : '다음'}
        </button>
      </div>
    </main>
  )
}
