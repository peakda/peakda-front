import { Clock, X } from 'lucide-react'
import { Dispatch, SetStateAction } from 'react'

interface Props {
  setQuery: Dispatch<SetStateAction<string>>
  setRecentSearches: Dispatch<SetStateAction<string[]>>
  recentSearches: string[]
  removeRecent: (item: string) => void
}

export default function RecentList({
  setQuery,
  setRecentSearches,
  recentSearches,
  removeRecent,
}: Props) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-lg font-semibold text-gray-800">최근 검색</span>
        <button onClick={() => setRecentSearches([])} className="text-text-secondary text-sm">
          전체삭제
        </button>
      </div>
      <ul className="flex flex-col gap-3">
        {recentSearches.map((item) => (
          <li key={item} className="flex items-center gap-3 py-1">
            <button className="flex items-center gap-3" onClick={() => setQuery(item)}>
              <Clock className="text-icon-quaternary h-4 w-4 shrink-0" strokeWidth={1} />
              <span className="text-text-secondary text-sm">{item}</span>
            </button>
            <button onClick={() => removeRecent(item)}>
              <X className="text-icon-quaternary h-5 w-5" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
