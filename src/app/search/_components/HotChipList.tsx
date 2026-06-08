import Image from 'next/image'
import { Dispatch, SetStateAction } from 'react'

interface Tag {
  src?: string
  icon?: string
  label: string
  badge?: number
}

const POPULAR_TAGS: Tag[] = [
  { src: '/flowers/cherry-blossom.svg', label: '벚꽃 명소', badge: 7 },
  { src: '/flowers/canola.svg', label: '유채꽃밭' },
  { icon: '📍', label: '숨은 명소' },
  { label: '만개 현황' },
  { src: '/flowers/maple.svg', label: '강원 단풍' },
  { src: '/flowers/canola.svg', label: '제주 유채꽃' },
  { src: '/flowers/azalea.svg', label: '봄꽃 축제' },
  { icon: '🌿', label: '근교 산책' },
]

interface Props {
  setQuery: Dispatch<SetStateAction<string>>
}

export default function HotChipList({ setQuery }: Props) {
  return (
    <section>
      <p className="mb-3 text-sm font-semibold text-gray-800">지금 많이 찾는</p>
      <div className="flex flex-wrap gap-2">
        {POPULAR_TAGS.map(({ src, icon, label, badge }) => (
          <button
            key={label}
            onClick={() => setQuery(label)}
            className="relative flex cursor-pointer items-center gap-1.5 rounded-full border border-[#F0F2F5] bg-[#F5F7FA] px-3 py-1.5 text-xs text-gray-600"
          >
            {src && (
              <Image src={src} alt="" aria-hidden width={16} height={16} className="h-4 w-4" />
            )}
            {icon && <span>{icon}</span>}
            <span>{label}</span>
            {badge && (
              <span className="absolute -top-1.5 -left-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </section>
  )
}
