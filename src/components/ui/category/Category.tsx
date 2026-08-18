'use client'

import { cn } from '@/lib/utils/cn'
import { CategoryChip } from './CategoryChip'

const DEFAULT_CATEGORIES = ['전체', '명소', '동네']

interface CategoryProps {
  value: string
  onChange: (value: string) => void
  categories?: string[]
  className?: string
  isMap?: boolean
}

export function Category({
  value,
  onChange,
  categories = DEFAULT_CATEGORIES,
  className,
  isMap,
}: CategoryProps) {
  return (
    <div className={cn('absolute top-[110px] z-10 flex w-full justify-center', className)}>
      <div className="bg-bg-primary-80 border-border-primary shadow-background flex gap-1 rounded-full border p-1">
        {categories.map((cate) => (
          <CategoryChip
            label={cate}
            key={cate}
            selected={value}
            onClick={() => onChange(cate)}
            className={isMap ? '' : 'w-auto'}
          />
        ))}
      </div>
    </div>
  )
}
