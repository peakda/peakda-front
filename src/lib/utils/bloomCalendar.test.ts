import { describe, it, expect } from 'vitest'
import { formatBloomDate, formatPeakPeriod, bloomStatusOn, peakHeadline } from './bloomCalendar'
import type { BloomCalendarDay } from '@/api/facades/generated/peakdaApi.schemas'

// 'YYYY-MM-DD' 목록을 상태 하나로 채운 타임라인
const timeline = (entries: [string, BloomCalendarDay['status']][]): BloomCalendarDay[] =>
  entries.map(([date, status]) => ({ date, status }))

describe('lib/utils/bloomCalendar', () => {
  describe('formatBloomDate', () => {
    it('M.D(요일) 로 표기한다', () => {
      expect(formatBloomDate('2026-03-28')).toBe('3.28(토)')
    })

    // 날짜만 오는 문자열을 UTC 로 읽으면 KST 기준 하루가 밀린다.
    it('일시 문자열이 와도 날짜 부분만 쓴다', () => {
      expect(formatBloomDate('2026-04-05T00:00:00')).toBe('4.5(일)')
    })
  })

  describe('formatPeakPeriod', () => {
    it('시작·종료가 모두 있으면 구간으로 표기한다', () => {
      expect(formatPeakPeriod('2026-03-28', '2026-04-05')).toBe('3.28(토) ~ 4.5(일)')
    })

    it('시작만 있으면 시작일만', () => {
      expect(formatPeakPeriod('2026-03-28', null)).toBe('3.28(토) ~')
    })

    it('종료만 있으면 종료일만', () => {
      expect(formatPeakPeriod(null, '2026-04-05')).toBe('~ 4.5(일)')
    })

    it('둘 다 없으면 빈 문자열', () => {
      expect(formatPeakPeriod(null, null)).toBe('')
    })
  })

  describe('bloomStatusOn', () => {
    const days = timeline([
      ['2026-03-26', 'STARTED'],
      ['2026-03-27', 'PEAK'],
    ])

    it('해당 날짜의 상태를 찾는다', () => {
      expect(bloomStatusOn(days, new Date(2026, 2, 27))).toBe('PEAK')
    })

    it('매칭되는 날짜가 없으면 첫 항목으로 대체한다', () => {
      expect(bloomStatusOn(days, new Date(2026, 5, 1))).toBe('STARTED')
    })

    it('타임라인이 비면 null', () => {
      expect(bloomStatusOn([], new Date(2026, 2, 27))).toBeNull()
    })
  })

  describe('peakHeadline', () => {
    // 2026-03-25 는 수요일 → 다가오는 주말은 3/28(토)·3/29(일)
    const wednesday = new Date(2026, 2, 25)

    it('다가오는 주말이 절정이면 주말을 추천한다', () => {
      const days = timeline([
        ['2026-03-25', 'STARTED'],
        ['2026-03-26', 'STARTED'],
        ['2026-03-27', 'STARTED'],
        ['2026-03-28', 'PEAK'],
        ['2026-03-29', 'PEAK'],
      ])
      expect(peakHeadline({ days, peakStartDate: '2026-03-28' }, wednesday)).toBe(
        '이번 주말이 딱이에요'
      )
    })

    it('오늘이 절정이고 주말은 절정이 아니면 지금을 알린다', () => {
      const days = timeline([
        ['2026-03-25', 'PEAK'],
        ['2026-03-28', 'ENDED'],
        ['2026-03-29', 'ENDED'],
      ])
      expect(peakHeadline({ days, peakStartDate: '2026-03-20' }, wednesday)).toBe(
        '지금이 절정이에요'
      )
    })

    it('절정이 주말 밖 미래면 남은 일수를 센다', () => {
      const days = timeline([
        ['2026-03-25', 'PREPARING'],
        ['2026-03-28', 'PREPARING'],
        ['2026-03-29', 'PREPARING'],
      ])
      expect(peakHeadline({ days, peakStartDate: '2026-04-02' }, wednesday)).toBe(
        '8일 뒤 절정이 시작돼요'
      )
    })

    it('절정이 지났으면 지났다고 알린다', () => {
      const days = timeline([['2026-03-25', 'ENDED']])
      expect(peakHeadline({ days, peakStartDate: '2026-03-10' }, wednesday)).toBe(
        '올해 절정은 지났어요'
      )
    })

    it('이제 막 피기 시작한 상태를 그대로 알린다', () => {
      const days = timeline([['2026-03-25', 'STARTED']])
      expect(peakHeadline({ days, peakStartDate: null }, wednesday)).toBe('이제 막 피기 시작했어요')
    })

    it('절정일이 없고 준비 중이면 곧 핀다고 알린다', () => {
      const days = timeline([['2026-03-25', 'PREPARING']])
      expect(peakHeadline({ days }, wednesday)).toBe('곧 피기 시작해요')
    })

    // 일요일에 조회하면 '이번 주말' 은 오늘 자신이다.
    it('일요일 당일이 절정이면 주말 추천이 뜬다', () => {
      const sunday = new Date(2026, 2, 29)
      const days = timeline([['2026-03-29', 'PEAK']])
      expect(peakHeadline({ days }, sunday)).toBe('이번 주말이 딱이에요')
    })
  })
})
