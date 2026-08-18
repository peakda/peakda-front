import { describe, it, expect } from 'vitest'
import { TIMINGS, timingToStatus, timingToStatuses } from './timing'

// 시기 탭은 "언제 갈 거냐"(date)가 아니라 "지금 어떤 상태냐"(status)를 고른다.
describe('lib/utils/timing', () => {
  it('탭은 절정·피기시작·이르다 3개다', () => {
    expect(TIMINGS.map((t) => t.key)).toEqual(['PEAK_NOW', 'STARTING', 'EARLY'])
  })

  describe('timingToStatus', () => {
    it('선택이 없으면 status 를 보내지 않는다', () => {
      expect(timingToStatus(null)).toBeUndefined()
    })

    it('탭마다 대응하는 개화 상태로 바꾼다', () => {
      expect(timingToStatus('PEAK_NOW')).toBe('PEAK')
      expect(timingToStatus('STARTING')).toBe('STARTED')
      expect(timingToStatus('EARLY')).toBe('PREPARING')
    })
  })

  describe('timingToStatuses', () => {
    it('선택이 없으면 상태로 거르지 않는다', () => {
      expect(timingToStatuses(null)).toEqual([])
    })

    // 서버 판정은 핀 단위라, 고른 꽃이 그 상태인지는 클라에서 다시 본다.
    it('고른 탭의 상태 하나만 남긴다', () => {
      expect(timingToStatuses('PEAK_NOW')).toEqual(['PEAK'])
      expect(timingToStatuses('STARTING')).toEqual(['STARTED'])
      expect(timingToStatuses('EARLY')).toEqual(['PREPARING'])
    })

    it('서버로 보내는 값과 클라에서 거르는 값이 일치한다', () => {
      for (const { key, status } of TIMINGS) {
        expect(timingToStatuses(key)).toEqual([timingToStatus(key)])
        expect(timingToStatus(key)).toBe(status)
      }
    })
  })
})
