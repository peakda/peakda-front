import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

interface SearchBarProps {
  placeholder?: string
  description?: string
  onFilterClick?: () => void
  /** 필터가 걸려 있으면 아이콘 오른쪽 위에 점을 찍는다 */
  hasActiveFilter?: boolean
  className?: string
}

export const SearchBar = ({
  placeholder,
  description,

  onFilterClick,
  hasActiveFilter = false,
  className,
}: SearchBarProps) => {
  return (
    <div className={cn('absolute top-12 z-10 w-full px-4 py-1', className)}>
      <div className="border-border-primary bg-bg-primary-80 flex items-center gap-2 rounded-4xl border px-4 py-1.5 backdrop-blur-[8px]">
        <Image src="/icons/search.svg" alt="검색" width={24} height={24} />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <Link
            href="/search"
            aria-label="검색 페이지 열기"
            className="text-text-primary block w-full truncate text-base leading-tight font-medium"
          >
            {placeholder || '스팟, 지역, 식물을 검색해보세요.'}
          </Link>
          {/* 서버 추천 문구는 명소명 길이에 따라 길어져, 검색바 높이가 흔들리지 않게 한 줄로 자른다 */}
          {description && (
            <p className="truncate text-xs leading-tight tracking-tight text-[#4E5666]">
              {description}
            </p>
          )}
        </div>
        <button
          type="button"
          aria-label="필터 열기"
          className="relative cursor-pointer"
          onClick={onFilterClick}
        >
          <Image src="/icons/filter.svg" alt="필터" width={24} height={24} />
          {hasActiveFilter && (
            <span
              aria-label="필터 적용됨"
              className="absolute top-0 -right-0.5 h-1 w-1 rounded-full bg-red-500"
            />
          )}
        </button>
      </div>
    </div>
  )
}
