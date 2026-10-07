'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useIsPageLoaded } from '@/hooks/useIsPageLoaded'
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
  // 검색 화면 prefetch 도 내비 탭과 같은 이유로 페이지 load 뒤에 시작한다 (Nav 참고).
  const prefetch = useIsPageLoaded() ? 'auto' : false
  return (
    <div className={cn('absolute top-12 z-10 w-full px-4 py-1', className)}>
      <div className="border-border-primary bg-bg-primary-80 flex items-stretch rounded-4xl border backdrop-blur-[8px]">
        <Link
          href="/search"
          prefetch={prefetch}
          aria-label="검색 페이지 열기"
          className="flex min-w-0 flex-1 items-center gap-2 rounded-l-4xl py-1.5 pl-4"
        >
          <Image src="/icons/search.svg" alt="" width={24} height={24} className="shrink-0" />
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-text-primary truncate text-base leading-tight font-medium">
              {placeholder || '스팟, 지역, 식물을 검색해보세요.'}
            </span>
            {/* 서버 추천 문구는 명소명 길이에 따라 길어져, 검색바 높이가 흔들리지 않게 한 줄로 자른다 */}
            {description && (
              <span className="truncate text-xs leading-tight tracking-tight text-[#4E5666]">
                {description}
              </span>
            )}
          </span>
        </Link>
        <button
          type="button"
          aria-label="필터 열기"
          className="flex shrink-0 cursor-pointer items-center rounded-r-4xl py-1.5 pr-4 pl-2"
          onClick={onFilterClick}
        >
          <span className="relative">
            <Image src="/icons/filter.svg" alt="" width={24} height={24} />
            {hasActiveFilter && (
              <span
                aria-label="필터 적용됨"
                className="absolute top-0 -right-0.5 h-1 w-1 rounded-full bg-red-500"
              />
            )}
          </span>
        </button>
      </div>
    </div>
  )
}
