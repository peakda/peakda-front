import { describe, it, expect } from 'vitest'
import { toFestivalStatus, toFestivalDateRange, toFestivalDescription } from './explore'
import type { ExploreFestivalItem } from '@/api/facades/generated/peakdaApi.schemas'

// 판정에 필요한 필드만 값을 바꿔가며 채우고 나머지는 고정 기본값으로 둔다.
const festival = (overrides: Partial<ExploreFestivalItem>): ExploreFestivalItem => ({
  festivalId: 1,
  name: '테스트 축제',
  venue: '테스트 공원',
  startsOn: '2026-04-01',
  category: 'CHERRY',
  displayName: '벚꽃',
  phase: 'ONGOING',
  ...overrides,
})

describe('lib/utils/explore', () => {
  // 날짜로 직접 판정하면 취소·연기를 표현할 수 없고 서버와 기준이 갈린다.
  describe('toFestivalStatus', () => {
    it('서버 phase 를 그대로 배지로 옮긴다', () => {
      expect(toFestivalStatus(festival({ phase: 'UPCOMING' }))).toEqual({
        label: '예정',
        variant: 'starting',
      })
      expect(toFestivalStatus(festival({ phase: 'ONGOING' }))).toEqual({
        label: '진행중',
        variant: 'green',
      })
      expect(toFestivalStatus(festival({ phase: 'ENDING_SOON' }))).toEqual({
        label: '곧 종료',
        variant: 'starting',
      })
      expect(toFestivalStatus(festival({ phase: 'ENDED' }))).toEqual({
        label: '종료',
        variant: 'late',
      })
    })

    // 시작일이 지났어도 서버가 예정이라고 하면 예정이다(연기 등).
    it('날짜가 아니라 phase 만 본다', () => {
      const item = festival({ startsOn: '2020-01-01', endsOn: '2020-01-02', phase: 'ONGOING' })
      expect(toFestivalStatus(item).label).toBe('진행중')
    })
  })

  describe('toFestivalDateRange', () => {
    it('종료일이 있으면 기간으로 보여준다', () => {
      expect(toFestivalDateRange(festival({ startsOn: '2026-04-01', endsOn: '2026-04-10' }))).toBe(
        '4.1~4.10'
      )
    })

    it('종료일이 없으면 시작일만 보여준다', () => {
      expect(toFestivalDateRange(festival({ startsOn: '2026-04-01' }))).toBe('4.1')
    })
  })

  describe('toFestivalDescription', () => {
    it('지역과 남은 일수를 함께 보여준다', () => {
      expect(toFestivalDescription(festival({ region: '경남 창원', endsInDays: 5 }))).toBe(
        '경남 창원 · 종료 D-5'
      )
    })

    // 종료일이 없으면 D 라벨을 붙이지 않는다.
    it('남은 일수가 없으면 지역만 보여준다', () => {
      expect(toFestivalDescription(festival({ region: '경남 창원' }))).toBe('경남 창원')
    })
  })
})
