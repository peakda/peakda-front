import { Dispatch, SetStateAction } from 'react'

const POPULAR_TAGS = [
  '꽃 명소',
  '유채꽃밭',
  '즐겨 명소',
  '단풍 명소',
  '강원 단풍',
  '단풍축제',
  '★ 금강 단풍',
  '☆ 제주 유채꽃',
  '봄꽃 축제',
  '근교 선택',
]

interface Props {
  setQuery: Dispatch<SetStateAction<string>>
}

export default function HotChipList({ setQuery }: Props) {
  return (
    <section>
      <p className="mb-3 text-sm font-semibold text-gray-800">🌸 요즘 급하게 찾는</p>
      <div className="flex flex-wrap gap-2">
        {POPULAR_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => setQuery(tag)}
            className="rounded-full border border-gray-200 px-3 py-1.5 text-xs text-gray-600"
          >
            {tag}
          </button>
        ))}
      </div>
    </section>
  )
}
