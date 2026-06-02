import Image from 'next/image'
import { CardBadge } from '@/components/ui/card/CardBadge'

interface PeakCardProps {
  type: 'peak'
  image: string
  name: string
  description: string
  visitorCount: number
  bloomPercent: number
}

interface FestivalCardProps {
  type: 'festival'
  image: string
  name: string
  description: string
  dateRange: string
  status: string
}

interface CourseCardProps {
  type: 'course'
  image: string
  title: string
  subtitle: string
}

export type ExplorCardProps = PeakCardProps | FestivalCardProps | CourseCardProps

export function ExplorCard(props: ExplorCardProps) {
  const isCourse = props.type === 'course'

  return (
    <div className="w-60 shrink-0">
      {/* 이미지 영역 */}
      <div className="relative overflow-hidden rounded-2xl">
        <Image
          src={props.image}
          alt={isCourse ? props.title : props.name}
          width={250}
          height={180}
          className="h-[180px] w-full object-cover"
        />

        {/* Peak 뱃지 */}
        {props.type === 'peak' && (
          <>
            <CardBadge variant="dark" label={`${props.visitorCount}명 다녀옴`} className="absolute top-2 left-2" />
            <CardBadge variant="bloom" label={`만개 ${props.bloomPercent}%`} className="absolute top-2 right-2" />
          </>
        )}

        {/* Festival 뱃지 */}
        {props.type === 'festival' && (
          <>
            <CardBadge variant="secondary" label={props.dateRange} className="absolute top-2 left-2" />
            <CardBadge variant="green" label={props.status} className="absolute top-2 right-2" />
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
          <p className="mt-0.5 text-xs text-gray-500">{props.description}</p>
        </div>
      )}
    </div>
  )
}
