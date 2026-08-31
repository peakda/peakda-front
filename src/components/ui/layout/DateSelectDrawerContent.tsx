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
const PICKER_ITEM_HEIGHT = 44
const PICKER_LIST_HEIGHT = 208
const PICKER_PADDING = (PICKER_LIST_HEIGHT - PICKER_ITEM_HEIGHT) / 2

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
  const yearListRef = useRef<HTMLDivElement>(null)
  const monthListRef = useRef<HTMLDivElement>(null)
  const yearScrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const monthScrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const days = useMemo(() => buildCalendarDays(viewYear, viewMonth), [viewYear, viewMonth])

  const yearOptions = useMemo(() => {
    const opts: number[] = []
    for (let y = today.getFullYear() - YEAR_RANGE; y <= today.getFullYear() + YEAR_RANGE; y++) {
      opts.push(y)
    }
    return opts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const monthOptions = useMemo(() => Array.from({ length: 12 }, (_, i) => i), [])

  // year-month 모드로 들어갈 때만 현재 선택 위치로 즉시 스크롤 (드래그 중엔 재실행 안 함)
  useEffect(() => {
    if (mode !== 'year-month') return
    yearListRef.current?.scrollTo({
      top: yearOptions.indexOf(viewYear) * PICKER_ITEM_HEIGHT,
      behavior: 'auto',
    })
    monthListRef.current?.scrollTo({ top: viewMonth * PICKER_ITEM_HEIGHT, behavior: 'auto' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])

  const handleYearScroll = () => {
    if (yearScrollTimeoutRef.current) clearTimeout(yearScrollTimeoutRef.current)
    yearScrollTimeoutRef.current = setTimeout(() => {
      const el = yearListRef.current
      if (!el) return
      const index = Math.round(el.scrollTop / PICKER_ITEM_HEIGHT)
      const year = yearOptions[Math.min(Math.max(index, 0), yearOptions.length - 1)]
      if (year != null) {
        setViewYear(year)
        setSelectedDay(null)
      }
    }, 100)
  }

  const handleMonthScroll = () => {
    if (monthScrollTimeoutRef.current) clearTimeout(monthScrollTimeoutRef.current)
    monthScrollTimeoutRef.current = setTimeout(() => {
      const el = monthListRef.current
      if (!el) return
      const index = Math.round(el.scrollTop / PICKER_ITEM_HEIGHT)
      const month = monthOptions[Math.min(Math.max(index, 0), monthOptions.length - 1)]
      if (month != null) {
        setViewMonth(month)
        setSelectedDay(null)
      }
    }, 100)
  }

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

        <div className="relative h-52">
          <div className="border-brand-secondary/30 pointer-events-none absolute inset-x-0 top-1/2 h-11 -translate-y-1/2 rounded-xl border-y" />
          <div className="flex h-full">
            <div
              ref={yearListRef}
              onScroll={handleYearScroll}
              className="no-scrollbar snap-y snap-mandatory flex-1 overflow-y-auto scroll-smooth"
            >
              <div style={{ height: PICKER_PADDING }} />
              {yearOptions.map((year) => {
                const isActive = year === viewYear
                return (
                  <button
                    key={year}
                    onClick={() => {
                      setViewYear(year)
                      setSelectedDay(null)
                      yearListRef.current?.scrollTo({
                        top: yearOptions.indexOf(year) * PICKER_ITEM_HEIGHT,
                        behavior: 'smooth',
                      })
                    }}
                    className={cn(
                      'flex h-11 w-full snap-center items-center justify-center text-sm',
                      isActive ? 'font-semibold text-brand-secondary' : 'text-text-tertiary'
                    )}
                  >
                    {year}년
                  </button>
                )
              })}
              <div style={{ height: PICKER_PADDING }} />
            </div>

            <div
              ref={monthListRef}
              onScroll={handleMonthScroll}
              className="no-scrollbar snap-y snap-mandatory flex-1 overflow-y-auto scroll-smooth"
            >
              <div style={{ height: PICKER_PADDING }} />
              {monthOptions.map((month) => {
                const isActive = month === viewMonth
                return (
                  <button
                    key={month}
                    onClick={() => {
                      setViewMonth(month)
                      setSelectedDay(null)
                      monthListRef.current?.scrollTo({
                        top: month * PICKER_ITEM_HEIGHT,
                        behavior: 'smooth',
                      })
                    }}
                    className={cn(
                      'flex h-11 w-full snap-center items-center justify-center text-sm',
                      isActive ? 'font-semibold text-brand-secondary' : 'text-text-tertiary'
                    )}
                  >
                    {month + 1}월
                  </button>
                )
              })}
              <div style={{ height: PICKER_PADDING }} />
            </div>
          </div>
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
