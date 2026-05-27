import { Dispatch, SetStateAction } from 'react'

interface Tag {
  icon: string
  label: string
}

const POPULAR_TAGS: Tag[] = [
  { icon: '🌸', label: '꽃 명소' },
  { icon: '🌼', label: '유채꽃밭' },
  { icon: '📍', label: '숨은 명소' },
  { icon: '🍂', label: '단풍 명소' },
  { icon: '🍁', label: '강원 단풍' },
  { icon: '🎉', label: '단풍축제' },
  { icon: '🏔️', label: '금강 단풍' },
  { icon: '🌺', label: '제주 유채꽃' },
  { icon: '🌷', label: '봄꽃 축제' },
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
        {POPULAR_TAGS.map(({ icon, label }) => (
          <button
            key={label}
            onClick={() => setQuery(label)}
            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-[#F0F2F5] bg-[#F5F7FA] px-3 py-1.5 text-xs text-gray-600"
          >
            <span>{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
