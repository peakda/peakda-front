import Image from 'next/image'
import { cn } from '@/lib/utils/cn'

type Stage = 'Before' | 'Start' | 'Peak'

export interface FlowerItem {
  src: string
  alt?: string
}

interface PinProps {
  flowers: FlowerItem[]
  maxStage: Stage
}

const BORDER_COLOR: Record<Stage, string> = {
  Before: '#a8b0bc',
  Start: '#ff7f92',
  Peak: '#f7576B',
}

const BORDER_CLASS: Record<Stage, string> = {
  Before: 'border-border-tertiary',
  Start: 'border-pink-300',
  Peak: 'border-pink-400',
}

export function Pin({ flowers, maxStage }: PinProps) {
  const borderColor = BORDER_COLOR[maxStage]
  const borderClass = BORDER_CLASS[maxStage]

  const visibleFlowers = flowers.slice(0, Math.min(flowers.length, 3))
  const showBadge = flowers.length >= 2
  const badgeLabel = flowers.length > 99 ? '+99' : `+${flowers.length}`

  return (
    <div className="relative inline-block">
      {/* pill */}
      <div
        className={cn(
          'relative z-10 flex items-center gap-1 rounded-full border bg-white p-1.5 shadow-sm',
          borderClass
        )}
      >
        {visibleFlowers.map((flower, i) => (
          <Image
            key={i}
            src={flower.src}
            alt={flower.alt ?? ''}
            width={24}
            height={24}
            className={cn(
              'object-contain',
              maxStage === 'Before' && 'opacity-40 grayscale',
            )}
          />
        ))}
        {showBadge && (
          <div
            className="flex items-center justify-center rounded-full px-1 py-0.5   text-[11px] font-semibold text-white"
            style={{ backgroundColor: borderColor }}
          >
            {badgeLabel}
          </div>
        )}
      </div>

      {/* tail: SVG triangle centered below pill, overlaps 2px to hide junction */}
      <div className="absolute -bottom-2 left-1/2 z-10 -mt-[2px] -translate-x-1/2">
        <svg width="10" height="10" viewBox="0 0 14 9" fill={borderColor}>
          <polygon points="0,0 14,0 7,9" fill={borderColor} />
          <polyline
            points="0,0 7,9 14,0"
            fill="none"
            stroke={borderColor}
            strokeWidth="2"
            strokeLinecap="butt"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  )
}
