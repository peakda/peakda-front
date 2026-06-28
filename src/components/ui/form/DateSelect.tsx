'use client'

import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface DateSelectProps {
  placeholder?: string
  value: string
  onChange: (value: string) => void
  isError?: boolean
  errorText?: string
}

const WEEK_DAYS = ['일', '월', '화', '수', '목', '금', '토']

function buildCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay()
  const lastDate = new Date(year, month + 1, 0).getDate()
  const prevLastDate = new Date(year, month, 0).getDate()

  const days: { date: number; type: 'prev' | 'cur' | 'next' }[] = []

  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({ date: prevLastDate - i, type: 'prev' })
  }
  for (let d = 1; d <= lastDate; d++) {
    days.push({ date: d, type: 'cur' })
  }
  for (let d = 1; d <= 42 - days.length; d++) {
    days.push({ date: d, type: 'next' })
  }

  return days
}

const DateSelect = ({
  placeholder = '날짜를 입력해주세요 (yyyy.mm.dd)',
  value,
  onChange,
  isError,
  errorText = '에러 메시지입니다.',
}: DateSelectProps) => {
  const [open, setOpen] = useState(false)
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const containerRef = useRef<HTMLDivElement>(null)

  const parsed = value
    ? (() => {
        const [y, m, d] = value.split('.').map(Number)
        return { year: y, month: m - 1, date: d }
      })()
    : null

  useEffect(() => {
    if (!open) return
    const onMouseDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [open])

  const selectDay = (day: number) => {
    const m = String(viewMonth + 1).padStart(2, '0')
    const d = String(day).padStart(2, '0')
    onChange(`${viewYear}.${m}.${d}`)
    setOpen(false)
  }

  const goToPrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11) }
    else setViewMonth((m) => m - 1)
  }

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0) }
    else setViewMonth((m) => m + 1)
  }

  const days = buildCalendarDays(viewYear, viewMonth)

  const borderColor = isError
    ? 'border-warning'
    : open
      ? 'border-brand-secondary'
      : value
        ? 'border-border-secondary'
        : 'border-border-primary'

  return (
    <div ref={containerRef} className="relative w-full">
      {/* 트리거 */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => e.key === 'Enter' && setOpen((v) => !v)}
        className={cn(
          'flex cursor-pointer items-center gap-2 rounded-3xl border p-3 transition-all duration-200 bg-bg-secondary',
          borderColor
        )}
      >
        <Image
          src="./icons/Calendar.svg"
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

      {/* 달력 드롭다운 */}
      {open && (
        <div className="absolute bottom-[calc(30%+8px)] left-0 z-50 w-full rounded-2xl border border-gray-100 bg-white p-4 shadow-xl">
          {/* 월 네비게이션 */}
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={goToPrev}
              className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
            >
              <ChevronLeft size={18} className="text-text-secondary" />
            </button>
            <span className="text-sm font-semibold text-text-primary">
              {viewYear}년 {viewMonth + 1}월
            </span>
            <button
              onClick={goToNext}
              className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
            >
              <ChevronRight size={18} className="text-text-secondary" />
            </button>
          </div>

          {/* 요일 헤더 */}
          <div className="mb-1 grid grid-cols-7 text-center">
            {WEEK_DAYS.map((d, i) => (
              <span
                key={d}
                className={cn(
                  'py-1 text-xs font-medium',
                  i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-text-tertiary'
                )}
              >
                {d}
              </span>
            ))}
          </div>

          {/* 날짜 그리드 */}
          <div className="grid grid-cols-7">
            {days.map((cell, i) => {
              const isCur = cell.type === 'cur'
              const isSelected =
                isCur &&
                parsed?.year === viewYear &&
                parsed?.month === viewMonth &&
                parsed?.date === cell.date
              const isToday =
                isCur &&
                today.getFullYear() === viewYear &&
                today.getMonth() === viewMonth &&
                today.getDate() === cell.date

              return (
                <div key={i} className="flex items-center justify-center py-0.5">
                  <button
                    disabled={!isCur}
                    onClick={() => selectDay(cell.date)}
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors',
                      !isCur && 'cursor-default text-gray-300',
                      isCur && !isSelected && 'cursor-pointer text-text-primary hover:bg-green-50',
                      isToday && !isSelected && 'font-bold text-brand-secondary',
                      isSelected && 'bg-brand-secondary font-semibold text-white'
                    )}
                  >
                    {cell.date}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default DateSelect
