'use client'

import { cn } from '@/lib/utils/cn'
import { CategoryChip } from './CategoryChip'

const DEFAULT_CATEGORIES = ['전체', '명소', '동네']

interface CategoryProps {
  value: string
  onChange: (value: string) => void
  categories?: string[]
  /** 지금 고를 수 없는 항목(예: 방문예정일 조회 중인 '동네') */
  disabled?: string[]
  className?: string
  isMap?: boolean
}

export function Category({
  value,
  onChange,
  categories = DEFAULT_CATEGORIES,
  disabled = [],
  className,
  isMap,
}: CategoryProps) {
  return (
    <div className={cn('absolute top-[110px] z-10 flex w-full justify-center', className)}>
      <div className="bg-bg-primary-80 border-border-primary shadow-background flex gap-1 rounded-full border p-1">
        {categories.map((cate) => {
          const isDisabled = disabled.includes(cate)
          return (
            <CategoryChip
              label={cate}
              key={cate}
              selected={value}
              onClick={() => !isDisabled && onChange(cate)}
              className={cn(isMap ? '' : 'w-auto', isDisabled && 'cursor-not-allowed opacity-40')}
            />
          )
        })}
      </div>
    </div>
  )
}
