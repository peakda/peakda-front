'use client'

import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'

import { cn } from '@/lib/utils'
import { CheckIcon } from 'lucide-react'

function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'peer relative shrink-0 cursor-pointer rounded-sm border transition-colors outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50',
        // 1. 크기 키움: size-4(16px) -> size-6(24px), 아이콘 중앙 정렬을 위한 flex
        'flex size-5 items-center justify-center',

        // 2. 선택 안 됐을 때 스타일: 회색 배경(bg-gray-300), 테두리 없음(border-none)
        'border-none bg-gray-300 text-white',

        // 3. 선택 됐을 때 스타일: 초록색 배경(bg-[#98C96D])
        'data-[state=checked]:bg-[#98C96D] data-[state=checked]:text-white',
        className
      )}
      {...props}
    >
      {/* 4. 선택되지 않았을 때 보이는 흰색 체크 (상시 노출, Indicator 아래 레이어) */}
      <CheckIcon
        className="absolute size-4.5 opacity-100 transition-opacity peer-data-[state=checked]:opacity-0"
        strokeWidth={2}
      />

      {/* 5. 선택되었을 때 나타나는 인디케이터 (상단 레이어) */}
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className={cn('flex items-center justify-center text-current transition-none')}
      >
        <CheckIcon className="size-4.5" strokeWidth={2} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
