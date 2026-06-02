import IconBtn from '@/components/ui/button/IconBtn'
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
        {recentSearches.length > 0 && (
          <button
            onClick={() => setRecentSearches([])}
            className="text-text-secondary cursor-pointer text-sm"
          >
            전체삭제
          </button>
        )}
      </div>
      {recentSearches.length === 0 ? (
        <div className="flex h-[300px] flex-col items-center justify-center gap-2 py-6 text-center">
          <IconBtn className="h-[72px] w-[72px]">
            <Clock className="text-icon-secondary h-10 w-10" strokeWidth={1} />
          </IconBtn>
          <p className="text-text-primary text-lg font-semibold">최근 검색이 없어요</p>
          <p className="text-text-tertiary text-base">검색한 내용은 여기에 모이에요</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {recentSearches.map((item) => (
            <li key={item} className="flex items-center gap-3 py-1">
              <button className="flex items-center gap-3" onClick={() => setQuery(item)}>
                <Clock className="text-icon-quaternary h-4 w-4 shrink-0" strokeWidth={1} />
                <span className="text-text-secondary cursor-pointer text-sm">{item}</span>
              </button>
              <button onClick={() => removeRecent(item)}>
                <X className="text-icon-quaternary h-5 w-5 cursor-pointer" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
