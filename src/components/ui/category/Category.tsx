'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils/cn'
import CategoryChip from './CategoryChip'

const DEFAULT_CATEGORIES = ['전체', '명소', '동네']

interface CategoryProps {
  categories?: string[]
  className?: string
  isMap?: boolean
}

export default function Category({
  categories = DEFAULT_CATEGORIES,
  className,
  isMap,
}: CategoryProps) {
  const [selected, setSelected] = useState(categories[0])

  return (
    <div className={cn('absolute top-[110px] z-10 flex w-full justify-center', className)}>
      <div className="bg-bg-primary-80 border-border-primary shadow-background flex gap-1 rounded-full border p-1">
        {categories.map((cate) => (
          <CategoryChip
            label={cate}
            key={cate}
            selected={selected}
            onClick={() => setSelected(cate)}
            className={cn(isMap ? '' : 'w-auto')}
          />
        ))}
      </div>
    </div>
  )
}
