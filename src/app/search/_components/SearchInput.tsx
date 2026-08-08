'use client'
import { IconBtn } from '@/components/ui/button/IconBtn'
import { Input } from '@/components/ui/form/Input'
import { X } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Dispatch, SetStateAction } from 'react'

interface SearchBarProps {
  query?: string
  hasQuery?: boolean
  setQuery?: Dispatch<SetStateAction<string>>
  isCancle?: boolean
  placeholder?: string
  onFocus?: () => void
  // 입력 대신 클릭만 받는 용도 (예: 탐색 페이지에서 검색 페이지로 이동)
  readOnly?: boolean
  onClick?: () => void
  // Enter 로 검색을 확정할 때 현재 입력값을 넘긴다 (최근 검색어 저장 등)
  onSubmit?: (value: string) => void
}

export function SearchInput({
  query = '',
  hasQuery = false,
  setQuery,
  isCancle,
  placeholder = '검색어를 입력하세요.',
  onFocus,
  readOnly,
  onClick,
  onSubmit,
}: SearchBarProps) {
  const router = useRouter()
  return (
    <div className="flex items-center gap-4 px-4 pt-2 pb-2">
      <div className="flex-1">
        <Input
          value={query}
          variant="none"
          leftIcon={
            <Image
              src={'/icons/search.svg'}
              alt="검색 아이콘"
              width={24}
              height={24}
              className="text-icon-quaternary"
            />
          }
          rightIcon={
            hasQuery ? (
              <button type="button" onClick={() => setQuery?.('')}>
                <IconBtn size="sm" className="bg-bg-quaternary-2">
                  <X size={14} color="white" />
                </IconBtn>
              </button>
            ) : undefined
          }
          onChange={(e) => setQuery?.(e.target.value)}
          onKeyDown={(e) => {
            // 한글 입력 중 조합을 확정하는 Enter 는 검색 확정으로 보지 않는다
            if (e.key === 'Enter' && !e.nativeEvent.isComposing) onSubmit?.(query)
          }}
          onFocus={onFocus}
          placeholder={placeholder}
          readOnly={readOnly}
          onClick={onClick}
          className={readOnly ? 'cursor-pointer' : undefined}
        />
      </div>

      {isCancle && (
        <button
          onClick={() => router.back()}
          className="text-text-secondary shrink-0 cursor-pointer text-sm"
        >
          취소
        </button>
      )}
    </div>
  )
}
