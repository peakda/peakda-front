import { describe, it, expect } from 'vitest'
import { filterFromTab, reactionToggleAction, buildReportRequest, toReactionSummary } from './feed'

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

  describe('toReactionSummary', () => {
    it('응답의 counts/myReactions 를 그대로 옮긴다', () => {
      expect(
        toReactionSummary({
          recordId: 3,
          counts: [{ reactionType: 'HEART', count: 2 }],
          myReactions: ['HEART'],
        })
      ).toEqual({
        counts: [{ reactionType: 'HEART', count: 2 }],
        myReactions: ['HEART'],
      })
    })
    it('응답 payload 가 없으면 빈 요약', () => {
      expect(toReactionSummary(null)).toEqual({ counts: [], myReactions: [] })
      expect(toReactionSummary(undefined)).toEqual({ counts: [], myReactions: [] })
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
