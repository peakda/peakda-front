'use client'

import { useCarousel } from '@/hooks/useEmblaCarousel'
import { SlideImageContext } from '@/hooks/useShouldRenderSlideImage'
import { cn } from '@/lib/utils/cn'
import { Children, ComponentPropsWithoutRef, useEffect, useState } from 'react'

interface CarouselProps extends ComponentPropsWithoutRef<'div'> {
  loop?: boolean
  align?: 'start' | 'center' | 'end'
  dragFree?: boolean
  showDots?: boolean
  showArrows?: boolean
  // 주면 앞에서 이 수만큼의 슬라이드만 처음부터(서버 HTML 포함) 이미지를 그리고, 나머지는 화면에 들어온 뒤에 그린다.
  // Chrome 은 overflow:hidden 캐러셀 안의 loading="lazy" 이미지도 가로로 2장 거리까지 바로 받아서, 그리지 않는 수밖에 없다.
  eagerImageCount?: number
}

export const Carousel = ({
  loop,
  align = 'start',
  dragFree,
  showDots = false,
  showArrows = false,
  eagerImageCount,
  className,
  children,
  ...props
}: CarouselProps) => {
  const {
    emblaRef,
    emblaApi,
    selectedIndex,
    scrollSnaps,
    canScrollPrev,
    canScrollNext,
    scrollPrev,
    scrollNext,
    scrollTo,
  } = useCarousel({ loop, align, dragFree })

  // 필터 변경 등으로 슬라이드 수가 바뀌면 embla 가 다시 측정해야 한다.
  const slideCount = Children.count(children)
  useEffect(() => {
    emblaApi?.reInit()
  }, [emblaApi, slideCount])

  // 이미지를 그린 슬라이드 수(앞에서부터). 화면에 들어온 슬라이드까지 늘리고, 한 번 그린 이미지는 지우지 않는다.
  const [imageCount, setImageCount] = useState(eagerImageCount ?? Infinity)
  useEffect(() => {
    if (!emblaApi || eagerImageCount == null) return
    const revealInView = () => {
      const lastInView = Math.max(-1, ...emblaApi.slidesInView())
      setImageCount((count) => Math.max(count, lastInView + 1))
    }
    emblaApi.on('slidesInView', revealInView)
    return () => {
      emblaApi.off('slidesInView', revealInView)
    }
  }, [emblaApi, eagerImageCount])

  return (
    <div className={cn('relative', className)} {...props}>
      {/* 뷰포트 */}
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex touch-pan-y">
          {Children.map(children, (child, index) => (
            <SlideImageContext.Provider value={index < imageCount}>{child}</SlideImageContext.Provider>
          ))}
        </div>
      </div>

      {/* 화살표 */}
      {showArrows && (
        <>
          <button
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            aria-label="이전 슬라이드"
            className={cn(
              'absolute top-1/2 left-2 z-10 -translate-y-1/2',
              'size-8 rounded-full bg-white shadow-md',
              'flex items-center justify-center',
              'disabled:cursor-not-allowed disabled:opacity-30',
              'transition-opacity'
            )}
          >
            ‹
          </button>
          <button
            onClick={scrollNext}
            disabled={!canScrollNext}
            aria-label="다음 슬라이드"
            className={cn(
              'absolute top-1/2 right-2 z-10 -translate-y-1/2',
              'size-8 rounded-full bg-white shadow-md',
              'flex items-center justify-center',
              'disabled:cursor-not-allowed disabled:opacity-30',
              'transition-opacity'
            )}
          >
            ›
          </button>
        </>
      )}

      {/* 도트 인디케이터 */}
      {showDots && scrollSnaps.length > 1 && (
        <div role="tablist" aria-label="슬라이드 목록" className="mt-3 flex justify-center gap-1.5">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              role="tab"
              aria-selected={index === selectedIndex}
              aria-label={`${index + 1}번 슬라이드`}
              onClick={() => scrollTo(index)}
              className={cn(
                'size-1.5 rounded-full transition-all duration-200',
                index === selectedIndex
                  ? 'bg-brand-secondary w-4'
                  : 'bg-bg-quaternary'
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// 슬라이드 아이템 래퍼
interface CarouselItemProps extends ComponentPropsWithoutRef<'div'> {
  size?: 'full' | 'auto'
}

export const CarouselItem = ({
  size = 'full',
  className,
  children,
  ...props
}: CarouselItemProps) => (
  <div
    role="tabpanel"
    className={cn(
      'min-w-0 shrink-0',
      size === 'full' ? 'flex-[0_0_100%]' : 'flex-[0_0_auto]',
      className
    )}
    {...props}
  >
    {children}
  </div>
)
