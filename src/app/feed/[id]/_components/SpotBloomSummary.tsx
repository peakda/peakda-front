'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { useBloomCalendar } from '@/api/facades/seasonal-bloom'
import { formatPeakPeriod, peakHeadline } from '@/lib/utils/bloomCalendar'
import type { BloomCalendarResponseCategory } from '@/api/facades/generated/peakdaApi.schemas'

export interface SpotBloomSummaryProps {
  spotId: number
  name: string
  address: string
  recordCount?: number
  /** 명소 id — 동네(LOCAL) 스팟이면 null 이라 캘린더를 조회하지 않는다 */
  attractionId?: number | null
  /** 스팟의 대표 꽃 카테고리 — 없으면 캘린더를 조회하지 않는다 */
  category?: BloomCalendarResponseCategory | null
}

// 피드 상세의 스팟 요약 행 + '올해 만개 시기'.
// 요약 행은 이름·기록 수·주소만 보여주는 이동 링크고, 절정 문구·구간·지속일은
// 명소×카테고리 캘린더(온디맨드 시뮬레이션)에서 가져와 아래 섹션에 모아둔다.
export function SpotBloomSummary({
  spotId,
  name,
  address,
  recordCount,
  attractionId,
  category,
}: SpotBloomSummaryProps) {
  // 캘린더는 서버에서 미리 받지 않는다 — peakHeadline 이 new Date() 로 오늘을 정해서, 서버(UTC)에서 그리면
  // KST 0~9시에 날짜가 하루 어긋나 하이드레이션이 깨진다.
  const calendarParams = attractionId && category ? { attractionId, category } : null
  const { data: calendar, isPending } = useBloomCalendar(calendarParams)

  const period = formatPeakPeriod(calendar?.peakStartDate, calendar?.peakEndDate)

  return (
    <>
      <Link
        href={`/spot/${spotId}`}
        className="border-border-primary flex items-center justify-between gap-2 border-y px-4 py-3.5 text-left"
      >
        <div className="flex flex-col gap-1">
          <h1 className="text-text-primary text-sm font-semibold">{name}</h1>
          {(recordCount != null || address) && (
            <span className="text-text-tertiary text-xs">
              {[recordCount != null && `방문 기록 ${recordCount}`, address]
                .filter(Boolean)
                .join(' · ')}
            </span>
          )}
        </div>
        <ChevronRight className="text-icon-quaternary h-5 w-5 shrink-0" />
      </Link>

      {calendar ? (
        <section className="mx-4 flex flex-col gap-2">
          <h2 className="text-text-primary text-base font-semibold">올해 만개 시기</h2>
          <div className="flex items-center justify-between gap-2 rounded-xl bg-green-50 px-4 py-3">
            <span className="text-sm font-semibold text-green-600">{peakHeadline(calendar)}</span>
            {period && <span className="text-sm font-medium text-green-500">{period}</span>}
          </div>
          {calendar.peakDurationDays ? (
            <span className="text-text-tertiary text-xs">
              만개 지속 {calendar.peakDurationDays}일
            </span>
          ) : null}
        </section>
      ) : (
        // 캘린더는 하이드레이션 뒤에 받아 와서, 받는 동안 같은 높이(제목·배너 44px·지속일 줄)로 자리를 잡아 둔다.
        // 늦게 끼어들며 아래 꽃 태그·본문을 밀던 것이 피드 상세 CLS 의 원인이었다.
        calendarParams &&
        isPending && (
          <section aria-busy="true" className="mx-4 flex flex-col gap-2">
            <h2 className="text-text-primary text-base font-semibold">올해 만개 시기</h2>
            <div className="h-11 animate-pulse rounded-xl bg-green-50" />
            <div className="h-4 w-20 animate-pulse rounded bg-gray-100" />
          </section>
        )
      )}
    </>
  )
}
