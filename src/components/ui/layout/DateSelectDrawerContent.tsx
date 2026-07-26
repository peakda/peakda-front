'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button/Button'
import type { DateSelectData } from '@/stores/useDrawerStore'

interface Props extends DateSelectData {
  onClose: () => void
}

const WEEK_DAYS = ['일', '월', '화', '수', '목', '금', '토']
const YEAR_RANGE = 5

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

function parseValue(value: string) {
  if (!value) return null
  const [y, m, d] = value.split('.').map(Number)
  return { year: y, month: m - 1, date: d }
}

export function DateSelectDrawerContent({ value, onSelect, onClose }: Props) {
  const today = new Date()
  const parsed = parseValue(value)
  const [mode, setMode] = useState<'calendar' | 'year-month'>('calendar')
  const [viewYear, setViewYear] = useState(parsed?.year ?? today.getFullYear())
  const [viewMonth, setViewMonth] = useState(parsed?.month ?? today.getMonth())
  const [selectedDay, setSelectedDay] = useState<number | null>(
    parsed && parsed.year === viewYear && parsed.month === viewMonth ? parsed.date : null
  )
  const listRef = useRef<HTMLDivElement>(null)

  const days = useMemo(() => buildCalendarDays(viewYear, viewMonth), [viewYear, viewMonth])

  const yearMonthOptions = useMemo(() => {
    const opts: { year: number; month: number }[] = []
    for (let y = today.getFullYear() - YEAR_RANGE; y <= today.getFullYear() + YEAR_RANGE; y++) {
      for (let m = 0; m < 12; m++) opts.push({ year: y, month: m })
    }
    return opts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (mode !== 'year-month') return
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'center' })
  }, [mode])

  const goToPrev = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1)
      setViewMonth(11)
    } else {
      setViewMonth((m) => m - 1)
    }
    setSelectedDay(null)
  }

  const goToNext = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1)
      setViewMonth(0)
    } else {
      setViewMonth((m) => m + 1)
    }
    setSelectedDay(null)
  }

  const handleConfirm = () => {
    if (selectedDay == null) return
    const m = String(viewMonth + 1).padStart(2, '0')
    const d = String(selectedDay).padStart(2, '0')
    onSelect(`${viewYear}.${m}.${d}`)
    onClose()
  }

  if (mode === 'year-month') {
    return (
      <div className="flex flex-col gap-4 px-5 pt-2 pb-8">
        <div className="flex flex-col gap-1">
          <h2 className="text-text-primary text-lg font-bold">촬영 일자 선택</h2>
          <p className="text-text-tertiary text-sm">날짜를 입력해주세요</p>
        </div>

        <button
          onClick={() => setMode('calendar')}
          className="text-text-primary flex items-center justify-center gap-1 text-sm font-semibold"
        >
          {viewYear}년 {viewMonth + 1}월
          <ChevronUp size={16} />
        </button>

        <div ref={listRef} className="no-scrollbar h-52 overflow-y-auto">
          {yearMonthOptions.map(({ year, month }) => {
            const isActive = year === viewYear && month === viewMonth
            return (
              <button
                key={`${year}-${month}`}
                data-active={isActive}
                onClick={() => {
                  setViewYear(year)
                  setViewMonth(month)
                  setSelectedDay(null)
                }}
                className={cn(
                  'flex w-full items-center justify-center gap-6 rounded-xl py-2.5 text-sm',
                  isActive
                    ? 'bg-green-50 font-semibold text-brand-secondary'
                    : 'text-text-tertiary'
                )}
              >
                <span>{year}년</span>
                <span>{month + 1}월</span>
              </button>
            )
          })}
        </div>

        <Button variant="filled" color="primary" size="lg" onClick={() => setMode('calendar')}>
          선택
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 px-5 pt-2 pb-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-text-primary text-lg font-bold">촬영 일자 선택</h2>
        <p className="text-text-tertiary text-sm">날짜를 입력해주세요</p>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={goToPrev}
          className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
        >
          <ChevronLeft size={18} className="text-text-secondary" />
        </button>
        <button
          onClick={() => setMode('year-month')}
          className="text-text-primary flex items-center gap-1 text-sm font-semibold"
        >
          {viewYear}년 {viewMonth + 1}월
          <ChevronDown size={16} />
        </button>
        <button
          onClick={goToNext}
          className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
        >
          <ChevronRight size={18} className="text-text-secondary" />
        </button>
      </div>

      <div className="grid grid-cols-7 text-center">
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

      <div className="grid grid-cols-7">
        {days.map((cell, i) => {
          const isCur = cell.type === 'cur'
          const isSelected = isCur && selectedDay === cell.date
          const isToday =
            isCur &&
            today.getFullYear() === viewYear &&
            today.getMonth() === viewMonth &&
            today.getDate() === cell.date

          return (
            <div key={i} className="flex items-center justify-center py-0.5">
              <button
                disabled={!isCur}
                onClick={() => setSelectedDay(cell.date)}
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

      <Button
        variant="filled"
        color="primary"
        size="lg"
        disabled={selectedDay == null}
        onClick={handleConfirm}
      >
        선택 완료
      </Button>
      <button onClick={onClose} className="text-text-tertiary mx-auto text-sm">
        닫기
      </button>
    </div>
  )
}
