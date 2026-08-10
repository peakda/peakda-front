import Image from 'next/image'
import { cn } from '@/lib/utils/cn'
import { useRouter } from 'next/navigation'

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
  const router = useRouter()

  return (
    <div className={cn('absolute top-12 z-10 w-full px-4 py-1', className)}>
      <div className="border-border-primary bg-bg-primary-80 flex items-center gap-2 rounded-4xl border px-4 py-1.5 backdrop-blur-[8px]">
        <Image src="/icons/search.svg" alt="검색" width={24} height={24} />
        <div className="flex flex-1 flex-col gap-0.5">
          <input
            type="text"
            placeholder={placeholder}
            readOnly
            onClick={() => router.push('/search')}
            className="placeholder:text-text-primary w-full cursor-pointer bg-transparent text-base leading-tight font-medium text-text-primary outline-none "
          />
          {description && (
            <p className="text-xs leading-tight tracking-tight text-[#4E5666]">{description}</p>
          )}
        </div>
        <button type="button" className="relative cursor-pointer" onClick={onFilterClick}>
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
