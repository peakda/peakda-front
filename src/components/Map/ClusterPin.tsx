import Image from 'next/image'
import type { MapSpot } from '@/hooks/useMapPins'

type Stage = 'Before' | 'Start' | 'Peak'

const STAGE_PRIORITY: Record<Stage, number> = { Before: 0, Start: 1, Peak: 2 }

const BG_COLOR: Record<Stage, string> = {
  Before: '#a8b0bc',
  Start: '#ff7f92',
  Peak: '#f7576b',
}

interface ClusterPinProps {
  spots: MapSpot[]
}

export function ClusterPin({ spots }: ClusterPinProps) {
  const maxStage = spots.reduce<Stage>(
    (max, s) => (STAGE_PRIORITY[s.maxStage] > STAGE_PRIORITY[max] ? s.maxStage : max),
    'Before'
  )

  const bgColor = BG_COLOR[maxStage]

  const allFlowers = spots.flatMap((s) => s.flowers)
  const countBySrc = new Map<string, { flower: (typeof allFlowers)[0]; count: number }>()
  for (const f of allFlowers) {
    const entry = countBySrc.get(f.src)
    if (entry) {
      entry.count++
    } else {
      countBySrc.set(f.src, { flower: f, count: 1 })
    }
  }
  const topFlower = [...countBySrc.values()].reduce((a, b) => (b.count > a.count ? b : a)).flower

  const count = spots.length
  const label = count > 99 ? '99+' : `${count}`

  return (
    <div
      className="flex h-14 w-14 flex-col items-center justify-center gap-0.5 rounded-full shadow-lg"
      style={{ backgroundColor: bgColor }}
    >
      <Image
        src={topFlower.src}
        alt={topFlower.alt ?? ''}
        width={24}
        height={24}
        className="object-contain brightness-0 invert"
      />
      <span className="text-[13px] font-bold leading-none text-white">{label}</span>
    </div>
  )
}
