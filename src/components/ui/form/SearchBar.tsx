import Image from 'next/image'
import { cn } from '@/lib/utils/cn'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface SearchBarProps {
  placeholder?: string
  description?: string

  onFilterClick?: () => void
  className?: string
}

export const SearchBar = ({
  placeholder,
  description,
  value: valueProp,
  onChange: onChangeProp,
  onFilterClick,
  className,
}: SearchBarProps) => {
  const [internalValue, setInternalValue] = useState('')
  const value = valueProp ?? internalValue
  const router = useRouter()
  const onChange =
    onChangeProp ?? ((e: React.ChangeEvent<HTMLInputElement>) => setInternalValue(e.target.value))
  const isInput = value.length > 0
  return (
    <div
      className={cn('absolute top-12 z-10 flex h-12 w-full flex-col gap-1 px-4 py-1', className)}
    >
      <div className="border-border-primary bg-bg-primary-80 relative flex flex-col rounded-4xl border px-4 py-3">
        <div className="flex items-center gap-2">
          <Image src="./icons/search.svg" alt="검색" width={24} height={24} />
          <input
            type="text"
            placeholder={placeholder}
            readOnly
            onClick={() => router.push('/search')}
            className="placeholder:text-text-primary flex-1 cursor-pointer bg-transparent text-base font-medium text-slate-900 outline-none placeholder:-translate-y-1"
          />
          <button type="button" className="cursor-pointer" onClick={onFilterClick}>
            <Image src="./icons/filter.svg" alt="필터" width={24} height={24} />
          </button>
        </div>
        {description && !isInput && (
          <p className="absolute bottom-1 pl-8 text-xs tracking-tight text-[#4E5666]">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}
