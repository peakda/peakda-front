import { describe, it, expect } from 'vitest'
import {
  filterFromTab,
  buildReportRequest,
  applyReactionToggle,
  isLegacyReactions,
  mergeReactionState,
  toReactionOverview,
} from './feed'

const HEART = { key: 'u:2764-fe0f', emoji: '❤️' }
const PARTY = { key: 'u:1f389', emoji: '🎉' }
const overview = (...items: { key: string; emoji: string; count: number; reactedByMe: boolean }[]) => ({
  items,
  hasMore: false,
})

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

  describe('toReactionOverview', () => {
    it('v2 응답은 참조를 그대로 돌려준다', () => {
      const reactions = overview({ ...PARTY, count: 1, reactedByMe: false })
      expect(toReactionOverview(reactions)).toBe(reactions)
      expect(isLegacyReactions(reactions)).toBe(false)
    })
    it('v1 응답의 HEART·SMILE 을 v2 키로 옮긴다', () => {
      const reactions = {
        counts: [
          { reactionType: 'HEART' as const, count: 2 },
          { reactionType: 'SMILE' as const, count: 1 },
        ],
        myReactions: ['SMILE' as const],
      }
      expect(isLegacyReactions(reactions)).toBe(true)
      expect(toReactionOverview(reactions)).toEqual(
        overview(
          { ...HEART, count: 2, reactedByMe: false },
          { key: 'u:1f600', emoji: '😀', count: 1, reactedByMe: true }
        )
      )
    })
    it('v1 응답에서 아무도 남기지 않은 반응은 칩을 만들지 않는다', () => {
      expect(toReactionOverview({ counts: [], myReactions: [] })).toEqual(overview())
    })
  })

  describe('applyReactionToggle', () => {
    it('add: 기존 칩에 +1 하고 선택 상태로 바꾼다', () => {
      expect(
        applyReactionToggle(overview({ ...HEART, count: 2, reactedByMe: false }), HEART, 'add')
      ).toEqual(overview({ ...HEART, count: 3, reactedByMe: true }))
    })
    it('add: 칩이 없던 이모지면 count 1 로 추가한다', () => {
      expect(applyReactionToggle(overview(), PARTY, 'add')).toEqual(
        overview({ ...PARTY, count: 1, reactedByMe: true })
      )
    })
    it('remove: 남은 사람이 있으면 -1 하고 선택을 해제한다', () => {
      expect(
        applyReactionToggle(overview({ ...HEART, count: 2, reactedByMe: true }), HEART, 'remove')
      ).toEqual(overview({ ...HEART, count: 1, reactedByMe: false }))
    })
    it('remove: 마지막 한 명이면 칩을 뺀다', () => {
      expect(
        applyReactionToggle(overview({ ...HEART, count: 1, reactedByMe: true }), HEART, 'remove')
      ).toEqual(overview())
    })
    it('remove: 상위 8종 밖이라 칩이 없으면 그대로 둔다', () => {
      const current = overview({ ...HEART, count: 1, reactedByMe: false })
      expect(applyReactionToggle(current, PARTY, 'remove')).toBe(current)
    })
    it('hasMore 를 유지한다', () => {
      expect(applyReactionToggle({ items: [], hasMore: true }, PARTY, 'add').hasMore).toBe(true)
    })
  })

  describe('mergeReactionState', () => {
    const state = (count: number, reactedByMe: boolean) => ({ recordId: 1, ...PARTY, count, reactedByMe })

    it('해당 이모지 칩만 서버 값으로 맞춘다', () => {
      const other = { ...HEART, count: 5, reactedByMe: false }
      expect(
        mergeReactionState(overview(other, { ...PARTY, count: 1, reactedByMe: true }), state(4, true))
      ).toEqual(overview(other, { ...PARTY, count: 4, reactedByMe: true }))
    })
    it('칩이 없는데 남은 사람이 있으면 칩을 넣는다', () => {
      expect(mergeReactionState(overview(), state(3, false))).toEqual(
        overview({ ...PARTY, count: 3, reactedByMe: false })
      )
    })
    it('0명이면 칩을 뺀다', () => {
      expect(
        mergeReactionState(overview({ ...PARTY, count: 1, reactedByMe: true }), state(0, false))
      ).toEqual(overview())
    })
    it('응답 payload 가 없으면 그대로 둔다', () => {
      const current = overview({ ...PARTY, count: 1, reactedByMe: true })
      expect(mergeReactionState(current, null)).toBe(current)
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
