import Image from 'next/image'
import React, { useState } from 'react'

interface DateSelectProps {
  label?: string
  errorText?: string
  isError?: boolean
  placeholder?: string
  value: string
  onChange: (value: string) => void
}

const DateSelect = ({
  placeholder = '날짜를 입력해주세요 (yyyy.mm.dd)',
  value,
  onChange,
  isError,
  errorText = '에러 메시지입니다.',
}: DateSelectProps) => {
  const [isFocused, setIsFocused] = useState(false)

  // 현재 상태에 따른 테두리 색상 결정
  const getBorderColor = () => {
    if (isError) return 'border-warning' // Error 상태
    if (isFocused) return 'border-brand-secondary' // Focus 상태
    if (value) return 'border-border-secondary' // Filled 상태
    return 'border-border-primary' // Default 상태
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-1">
      <div
        className={`flex items-center gap-2 rounded-3xl border p-3 transition-all duration-200 ${getBorderColor()} bg-bg-secondary`}
      >
        {/* 달력 아이콘 */}
        <Image
          src={'./icons/Calendar.svg'}
          alt="캘린더 아이콘"
          width={20}
          height={20}
          className="h-6 w-6 text-gray-500"
        />

        <input
          type="text"
          readOnly
          value={value}
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={(e) => onChange(e.target.value)}
          className="text-text-secondary placeholder-text-tertiary w-full bg-transparent text-[16px] outline-none"
        />
      </div>

      {/* 하단 보조 텍스트 (Filled 또는 Error 상태일 때 노출) */}
      {(value || isError) && (
        <span className={`ml-2 text-sm ${isError ? 'text-orange-500' : 'text-gray-500'}`}>
          {isError ? errorText : 'Text'}
        </span>
      )}
    </div>
  )
}

export default DateSelect
