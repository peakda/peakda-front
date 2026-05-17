'use client'

import { useState } from 'react'
import CategoryChip from './CategoryChip'

const CATEGORY_LIST = ['전체', '명소', '동네']

export default function Category() {
  const [selected, setSelected] = useState('전체')

  return (
    <div className="absolute top-[110px] z-10 flex w-full justify-center">
      <div className="bg-bg-primary-80 border-border-primary shadow-background flex gap-2 rounded-full border p-1">
        {CATEGORY_LIST.map((cate) => (
          <CategoryChip label={cate} key={cate} selected={selected} onClick={() => setSelected(cate)} />
        ))}
      </div>
    </div>
  )
}
