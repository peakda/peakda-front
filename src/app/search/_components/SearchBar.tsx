import IconBtn from '@/components/ui/button/IconBtn'
import Input from '@/components/ui/form/Input'
import { X } from 'lucide-react'
import Image from 'next/image'
import { Dispatch, SetStateAction } from 'react'

interface SearchBarProps {
  query: string
  hasQuery: boolean
  setQuery: Dispatch<SetStateAction<string>>
}

export default function SearchBar({ query, hasQuery, setQuery }: SearchBarProps) {
  return (
    <div className="flex items-center gap-4 px-4 pt-2 pb-2">
      <div className="flex-1">
        <Input
          value={query}
          variant="none"
          leftIcon={<Image src={'./icons/search.svg'} alt="검색 아이콘" width={24} height={24} />}
          rightIcon={
            hasQuery ? (
              <button type="button" onClick={() => setQuery('')}>
                <IconBtn size="sm" className="bg-bg-quaternary-2">
                  <X size={14} color="white" />
                </IconBtn>
              </button>
            ) : undefined
          }
          onChange={(e) => setQuery(e.target.value)}
          placeholder="검색어를 입력하세요."
        />
      </div>

      <button onClick={() => setQuery('')} className="text-text-secondary shrink-0 text-sm">
        취소
      </button>
    </div>
  )
}
