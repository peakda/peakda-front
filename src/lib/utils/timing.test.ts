import { describe, it, expect } from 'vitest'
import { TIMINGS, timingToDate, timingToStatuses, isFutureTiming } from './timing'

// 시기 탭은 "지금 어떤 상태냐"가 아니라 "언제 갈 거냐"를 고른다.
// 서버 date 파라미터로 그날 기준 상태를 재계산받고, 프론트는 절정만 남긴다.
describe('lib/utils/timing', () => {
  it('탭은 절정·피기시작·이르다 3개다', () => {
    expect(TIMINGS.map((t) => t.key)).toEqual(['PEAK_NOW', 'STARTING', 'EARLY'])
  })

  describe('timingToDate', () => {
    // 2026-04-01 12:00 KST = 2026-04-01T03:00:00Z
    const noon = Date.UTC(2026, 3, 1, 3, 0, 0)

    it('선택 없으면 date 를 보내지 않는다', () => {
      expect(timingToDate(null, noon)).toBeUndefined()
    })

    it('절정은 오늘이므로 date 를 보내지 않는다 (서버 기본값에 맡긴다)', () => {
      expect(timingToDate('PEAK_NOW', noon)).toBeUndefined()
    })

    it('피기시작은 10일 뒤', () => {
      expect(timingToDate('STARTING', noon)).toBe('2026-04-11')
    })

    it('이르다는 25일 뒤', () => {
      expect(timingToDate('EARLY', noon)).toBe('2026-04-26')
    })

    it('월을 넘어가도 정확하다', () => {
      // 2026-04-25 12:00 KST → +10일 = 5월 5일
      expect(timingToDate('STARTING', Date.UTC(2026, 3, 25, 3, 0, 0))).toBe('2026-05-05')
    })

    // 브라우저 로컬 타임존으로 계산하면 해외 접속 시 하루 어긋난다.
    it('KST 기준으로 계산한다 — UTC 로는 전날인 시각', () => {
      // 2026-04-01T15:30Z = KST 2026-04-02 00:30 → 기준일은 4/2
      expect(timingToDate('STARTING', Date.UTC(2026, 3, 1, 15, 30, 0))).toBe('2026-04-12')
    })
  })

  describe('timingToStatuses', () => {
    it('선택이 없으면 상태로 거르지 않는다', () => {
      expect(timingToStatuses(null)).toEqual([])
    })

    // date 로 그날 상태를 재계산받으므로, 어떤 탭이든 "그날 절정"만 남기면 된다.
    it('탭을 고르면 절정만 남긴다', () => {
      expect(timingToStatuses('PEAK_NOW')).toEqual(['PEAK'])
      expect(timingToStatuses('STARTING')).toEqual(['PEAK'])
      expect(timingToStatuses('EARLY')).toEqual(['PEAK'])
    })
  })

  // 동네형 핀은 관측값이라 날짜 투영이 안 된다(서버 스펙). 미래 조회 시 명소로 강제해야 한다.
  describe('isFutureTiming', () => {
    it('선택 없음·절정은 오늘 조회다', () => {
      expect(isFutureTiming(null)).toBe(false)
      expect(isFutureTiming('PEAK_NOW')).toBe(false)
    })

    it('피기시작·이르다는 미래 조회다', () => {
      expect(isFutureTiming('STARTING')).toBe(true)
      expect(isFutureTiming('EARLY')).toBe(true)
    })
  })
})
