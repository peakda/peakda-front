'use client'

import { useRouter } from 'next/navigation'
import { Bell, ChevronRight, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/display/Badge'
import { CardBadge } from '@/components/ui/card/CardBadge'
import { useBloomCalendar } from '@/api/facades/seasonal-bloom'
import { useDrawerStore } from '@/stores/useDrawerStore'
import { toStatusBadge } from '@/lib/utils/bloomStatus'
import {
  BLOOM_CATEGORY_EMOJI,
  bloomStatusOn,
  formatPeakPeriod,
  peakHeadline,
} from '@/lib/utils/bloomCalendar'
import type { BloomCalendarResponseCategory } from '@/api/facades/generated/peakdaApi.schemas'

export interface SpotBloomSummaryProps {
  spotId: number
  name: string
  address: string
  recordCount: number
  /** 명소 id — 동네(LOCAL) 스팟이면 null 이라 캘린더를 조회하지 않는다 */
  attractionId?: number | null
  /** 스팟의 대표 꽃 카테고리 — 없으면 캘린더를 조회하지 않는다 */
  category?: BloomCalendarResponseCategory | null
}

// 피드 상세의 스팟 요약 카드 + '올해 만개 시기'.
// 절정 뱃지·지속일·구간은 명소×카테고리 캘린더(온디맨드 시뮬레이션)에서 가져오고,
// 명소 연결이 없는 동네 스팟은 이름·주소·기록 수만 남는다.
export function SpotBloomSummary({
  spotId,
  name,
  address,
  recordCount,
  attractionId,
  category,
}: SpotBloomSummaryProps) {
  const router = useRouter()
  const openSaveSpotDrawer = useDrawerStore((s) => s.openSaveSpotDrawer)
  const { data: calendar } = useBloomCalendar(
    attractionId && category ? { attractionId, category } : null
  )

  const badge = toStatusBadge(calendar ? bloomStatusOn(calendar.days, new Date()) : null)
  const period = formatPeakPeriod(calendar?.peakStartDate, calendar?.peakEndDate)

  return (
    <>
      <div className="bg-bg-secondary mx-4 flex flex-col gap-2 rounded-xl px-3.5 py-3">
        <div className="flex items-start justify-between gap-2">
          <button
            type="button"
            onClick={() => router.push(`/spot/${spotId}`)}
            className="flex flex-1 cursor-pointer flex-col gap-1 text-left"
          >
            <span className="flex items-center gap-1.5">
              {badge.statusVariant && (
                <CardBadge label={badge.status} variant={badge.statusVariant} />
              )}
              <span className="text-text-primary text-sm font-semibold">{name}</span>
              <ChevronRight className="text-icon-quaternary h-4 w-4 shrink-0" />
            </span>
            <span className="text-text-tertiary flex items-center gap-1 text-xs">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {address}
            </span>
          </button>

          <button
            type="button"
            aria-label="만개 알림 받기"
            onClick={() => openSaveSpotDrawer({ spotId, name, location: address })}
            className="text-icon-quaternary shrink-0 cursor-pointer"
          >
            <Bell className="h-5 w-5" />
          </button>
        </div>

        <span className="text-text-tertiary text-xs">
          방문 기록 {recordCount}
          {calendar?.peakDurationDays ? ` · 만개지속일 ${calendar.peakDurationDays}일` : ''}
        </span>

        {calendar && (
          <div>
            <Badge
              label={calendar.displayName}
              leftIcon={<span>{BLOOM_CATEGORY_EMOJI[calendar.category]}</span>}
              variant="filled"
              color="pink"
            />
          </div>
        )}
      </div>

      {calendar && (
        <section className="mx-4 flex flex-col gap-2">
          <h2 className="text-text-primary text-base font-semibold">올해 만개 시기</h2>
          <div className="flex items-center justify-between gap-2 rounded-xl bg-green-50 px-4 py-3">
            <span className="text-sm font-semibold text-green-600">{peakHeadline(calendar)}</span>
            {period && <span className="text-sm font-medium text-green-500">{period}</span>}
          </div>
        </section>
      )}
    </>
  )
}
