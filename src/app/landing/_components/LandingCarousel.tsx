'use client'

import { Children, type ReactNode } from 'react'
import { useCarousel } from '@/hooks/useEmblaCarousel'
import { cn } from '@/lib/utils/cn'

interface LandingCarouselProps {
  children: ReactNode
}

// 슬라이드 내용은 서버 컴포넌트가 그려 children 으로 넘긴다 — 6장 모두 첫 HTML 에 들어가 검색엔진이 읽는다.
// 한 화면에 모바일 1장·태블릿 2장·데스크톱 3장이 보이고, slidesToScroll 'auto' 로 보이는 장 수만큼 넘긴다.
export const LandingCarousel = ({ children }: LandingCarouselProps) => {
  const { emblaRef, selectedIndex, scrollSnaps, scrollTo } = useCarousel({ slidesToScroll: 'auto' })

  return (
    <div>
      <div ref={emblaRef} className="overflow-hidden">
        <ul className="flex touch-pan-y md:-ml-6 xl:-ml-10">
          {Children.map(children, (child) => (
            <li className="min-w-0 shrink-0 basis-full md:basis-1/2 md:pl-6 xl:basis-1/3 xl:pl-10">
              {child}
            </li>
          ))}
        </ul>
      </div>

      {/* 시안에서 모바일은 점 표시가 없다 */}
      {scrollSnaps.length > 1 && (
        <div className="mt-6 hidden justify-center gap-2 md:flex xl:mt-10">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`${index + 1}번째 화면 보기`}
              aria-current={index === selectedIndex}
              onClick={() => scrollTo(index)}
              className={cn(
                'h-2 rounded-full transition-all duration-200',
                index === selectedIndex ? 'w-6 bg-green-600' : 'w-2 bg-gray-200'
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}
