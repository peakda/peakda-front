'use client'

import Image from 'next/image'
import { CardBadge, type CardBadgeVariant } from '@/components/ui/card/CardBadge'
import { useShouldRenderSlideImage } from '@/hooks/useShouldRenderSlideImage'
import { cn } from '@/lib/utils/cn'
import { toHttpsImageUrl } from '@/lib/utils/imageUrl'

// 카드 클릭 시 이동은 호출부에서 넘긴다(카드 내부에서 라우터를 쓰지 않는다).
interface ExplorCardBaseProps {
  onClick?: () => void
  // 슬라이더처럼 카드 폭을 바깥에서 정해야 하는 곳에서만 넘긴다.
  className?: string
  // 첫 화면에 보이는 카드(LCP 후보)만 true. 전부 주면 우선순위가 의미 없어진다.
  priority?: boolean
}

interface PeakCardProps extends ExplorCardBaseProps {
  type: 'peak'
  image: string
  name: string
  description: string
  visitorCount?: number
  bloomPercent?: number
}

interface FestivalCardProps extends ExplorCardBaseProps {
  type: 'festival'
  image: string
  name: string
  description: string
  dateRange: string
  status: string
  // 진행 상태 뱃지 색. 안 넘기면 기존처럼 green(진행중) 으로 렌더된다.
  statusVariant?: CardBadgeVariant
}

interface CourseCardProps extends ExplorCardBaseProps {
  type: 'course'
  image: string
  title: string
  subtitle: string
}

export type ExplorCardProps = PeakCardProps | FestivalCardProps | CourseCardProps

export function ExplorCard(props: ExplorCardProps) {
  const isCourse = props.type === 'course'
  // 캐러셀에서 아직 화면에 들어오지 않은 카드는 이미지를 그리지 않는다(Carousel 의 eagerImageCount).
  const shouldRenderImage = useShouldRenderSlideImage()

  return (
    <div
      className={cn('w-60 shrink-0', props.onClick && 'cursor-pointer', props.className)}
      onClick={props.onClick}
      role={props.onClick ? 'button' : undefined}
      tabIndex={props.onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (props.onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          props.onClick()
        }
      }}
    >
      {/* 이미지 영역 — 이미지를 아직 안 그린 카드도 같은 높이로 자리를 지킨다 */}
      <div className="relative h-[180px] overflow-hidden rounded-2xl bg-gray-200">
        {shouldRenderImage && (
          <Image
            src={toHttpsImageUrl(props.image) ?? props.image}
            alt={isCourse ? props.title : props.name}
            width={250}
            height={180}
            priority={props.priority}
            className="h-[180px] w-full object-cover"
          />
        )}

        {/* Peak 뱃지 */}
        {props.type === 'peak' && (
          <>
            {props.visitorCount != null && (
              <CardBadge
                variant="dark"
                label={`${props.visitorCount}명 다녀옴`}
                className="absolute top-2 left-2"
              />
            )}
            {props.bloomPercent != null && (
              <CardBadge
                variant="bloom"
                label={`만개 ${props.bloomPercent}%`}
                className="absolute top-2 right-2"
              />
            )}
          </>
        )}

        {/* Festival 뱃지 */}
        {props.type === 'festival' && (
          <>
            <CardBadge
              variant="secondary"
              label={props.dateRange}
              className="absolute top-2 left-2"
            />
            <CardBadge
              variant={props.statusVariant ?? 'green'}
              label={props.status}
              className="absolute top-2 right-2"
            />
          </>
        )}

        {/* Course 텍스트 오버레이 */}
        {props.type === 'course' && (
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 to-transparent p-3">
            <p className="text-sm font-semibold text-white">{props.title}</p>
            <p className="mt-0.5 text-xs text-white/80">{props.subtitle}</p>
          </div>
        )}
      </div>

      {/* Peak / Festival 하단 텍스트 */}
      {!isCourse && (
        <div className="mt-2 px-0.5">
          <p className="text-sm font-semibold text-gray-900">{props.name}</p>
          <p className="text-text-secondary mt-0.5 text-xs">{props.description}</p>
        </div>
      )}
    </div>
  )
}
