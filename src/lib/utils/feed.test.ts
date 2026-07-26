import { describe, it, expect } from 'vitest'
import { filterFromTab, reactionToggleAction, buildReportRequest } from './feed'

describe('utils/feed', () => {
  describe('filterFromTab', () => {
    it('전체 → ALL', () => {
      expect(filterFromTab('전체')).toBe('ALL')
    })
    it('관심 식물 → INTEREST', () => {
      expect(filterFromTab('관심 식물')).toBe('INTEREST')
    })
    it('팔로잉 → FOLLOWING', () => {
      expect(filterFromTab('팔로잉')).toBe('FOLLOWING')
    })
    it('알 수 없는 값 → ALL(기본값)', () => {
      expect(filterFromTab('기타')).toBe('ALL')
    })
  })

  describe('reactionToggleAction', () => {
    it('myReactions에 type이 있으면 remove', () => {
      expect(reactionToggleAction(['HEART'], 'HEART')).toBe('remove')
    })
    it('myReactions에 type이 없으면 add', () => {
      expect(reactionToggleAction(['HEART'], 'SMILE')).toBe('add')
    })
    it('빈 배열이면 add', () => {
      expect(reactionToggleAction([], 'HEART')).toBe('add')
    })
  })

  describe('buildReportRequest', () => {
    it('detail 없이 신고 요청 생성', () => {
      expect(buildReportRequest(10, 'SPAM')).toEqual({
        targetType: 'SPOT_RECORD',
        targetId: 10,
        reason: 'SPAM',
      })
    })
    it('detail 포함 신고 요청 생성', () => {
      expect(buildReportRequest(7, 'ETC', '부적절한 내용')).toEqual({
        targetType: 'SPOT_RECORD',
        targetId: 7,
        reason: 'ETC',
        detail: '부적절한 내용',
      })
    })
  })
})
