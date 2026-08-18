import { describe, it, expect } from 'vitest'
import { toFestivalStatus } from './explore'
import type { ExploreFestivalItem } from '@/api/facades/generated/peakdaApi.schemas'

// 판정에 필요한 필드만 값을 바꿔가며 채우고 나머지는 고정 기본값으로 둔다.
const festival = (overrides: Partial<ExploreFestivalItem>): ExploreFestivalItem => ({
  festivalId: 1,
  name: '테스트 축제',
  venue: '테스트 공원',
  startsOn: '2026-04-01',
  category: 'CHERRY',
  displayName: '벚꽃',
  // toFestivalStatus 는 날짜로만 판정하므로 이 값은 쓰이지 않는다(서버 phase 로 옮기면 제거).
  phase: 'ONGOING',
  ...overrides,
})

describe('lib/utils/explore', () => {
  describe('toFestivalStatus', () => {
    const today = new Date(2026, 3, 10) // 2026-04-10

    it('시작일이 오늘보다 미래면 예정', () => {
      const item = festival({ startsOn: '2026-04-11' })
      expect(toFestivalStatus(item, today)).toEqual({ label: '예정', variant: 'starting' })
    })

    it('시작일이 오늘이면 예정이 아니다(경계값)', () => {
      const item = festival({ startsOn: '2026-04-10' })
      expect(toFestivalStatus(item, today)).toEqual({ label: '진행중', variant: 'green' })
    })

    it('종료까지 3일 이하로 남으면 곧 종료(경계값: endsInDays === 3)', () => {
      const item = festival({ startsOn: '2026-04-01', endsOn: '2026-04-13', endsInDays: 3 })
      expect(toFestivalStatus(item, today)).toEqual({ label: '곧 종료', variant: 'starting' })
    })

    it('종료까지 4일 남으면 곧 종료가 아니다(경계값: endsInDays === 4)', () => {
      const item = festival({ startsOn: '2026-04-01', endsOn: '2026-04-14', endsInDays: 4 })
      expect(toFestivalStatus(item, today)).toEqual({ label: '진행중', variant: 'green' })
    })

    it('종료일이 오늘보다 과거면 종료', () => {
      const item = festival({ startsOn: '2026-03-01', endsOn: '2026-04-09', endsInDays: null })
      expect(toFestivalStatus(item, today)).toEqual({ label: '종료', variant: 'late' })
    })

    it('종료일이 오늘이면 종료가 아니다(경계값)', () => {
      const item = festival({ startsOn: '2026-03-01', endsOn: '2026-04-10', endsInDays: null })
      expect(toFestivalStatus(item, today)).toEqual({ label: '진행중', variant: 'green' })
    })

    it('그 외에는 진행중', () => {
      const item = festival({ startsOn: '2026-04-01', endsOn: '2026-04-20', endsInDays: 10 })
      expect(toFestivalStatus(item, today)).toEqual({ label: '진행중', variant: 'green' })
    })

    it('endsOn·endsInDays 가 모두 null 이어도 진행중으로 판정한다', () => {
      const item = festival({ startsOn: '2026-04-01', endsOn: null, endsInDays: null })
      expect(toFestivalStatus(item, today)).toEqual({ label: '진행중', variant: 'green' })
    })
  })
})
