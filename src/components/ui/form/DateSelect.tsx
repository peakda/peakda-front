'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils/cn'
import { useDrawerStore } from '@/stores/useDrawerStore'

interface DateSelectProps {
  placeholder?: string
  value: string
  onChange: (value: string) => void
  isError?: boolean
  errorText?: string
}

export const DateSelect = ({
  placeholder = '날짜를 입력해주세요 (yyyy.mm.dd)',
  value,
  onChange,
  isError,
  errorText = '에러 메시지입니다.',
}: DateSelectProps) => {
  const openDateSelectDrawer = useDrawerStore((s) => s.openDateSelectDrawer)

  const borderColor = isError
    ? 'border-warning'
    : value
      ? 'border-border-secondary'
      : 'border-border-primary'

  return (
    <div className="relative w-full">
      {/* 트리거 */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => openDateSelectDrawer(value, onChange)}
        onKeyDown={(e) => e.key === 'Enter' && openDateSelectDrawer(value, onChange)}
        className={cn(
          'flex cursor-pointer items-center gap-2 rounded-3xl border p-3 transition-all duration-200 bg-bg-secondary',
          borderColor
        )}
      >
        <Image
          src="/icons/Calendar.svg"
          alt="캘린더"
          width={20}
          height={20}
          className="h-5 w-5 shrink-0"
        />
        <span className={cn('flex-1 text-[16px]', value ? 'text-text-secondary' : 'text-text-tertiary')}>
          {value || placeholder}
        </span>
      </div>

      {(value || isError) && (
        <span className={cn('ml-3 mt-1 block text-sm', isError ? 'text-orange-500' : 'text-gray-500')}>
          {isError ? errorText : ''}
        </span>
      )}
    </div>
  )
}

