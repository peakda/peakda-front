import { describe, it, expect } from 'vitest'
import { myRecordsHref, displayCount, shouldLoadMore } from './myRecords'

describe('utils/myRecords', () => {
  describe('myRecordsHref', () => {
    it('내 프로필이면 전체보기 경로', () => {
      expect(myRecordsHref(true)).toBe('/my/records')
    })
    // 남의 프로필에서 "내 기록 전체보기"로 가면 안 되므로 링크 자체를 만들지 않는다.
    it('남의 프로필이면 undefined', () => {
      expect(myRecordsHref(false)).toBeUndefined()
    })
  })

  describe('displayCount', () => {
    it('서버 총계가 있으면 총계를 쓴다', () => {
      expect(displayCount(37, 20)).toBe(37)
    })
    it('서버 총계가 없으면 로드된 개수를 쓴다', () => {
      expect(displayCount(undefined, 20)).toBe(20)
    })
    // 0 은 falsy 지만 유효한 총계다. 로드 개수로 폴백하면 안 된다.
    it('서버 총계가 0 이면 0 (로드 개수로 폴백하지 않는다)', () => {
      expect(displayCount(0, 5)).toBe(0)
    })
    it('아직 아무것도 로드되지 않았고 총계도 없으면 0', () => {
      expect(displayCount(undefined, 0)).toBe(0)
    })
  })

  describe('shouldLoadMore', () => {
    it('다음 페이지가 있고 가져오는 중이 아니면 true', () => {
      expect(shouldLoadMore(true, false)).toBe(true)
    })
    it('다음 페이지가 있어도 이미 가져오는 중이면 false', () => {
      expect(shouldLoadMore(true, true)).toBe(false)
    })
    it('다음 페이지가 없으면 false', () => {
      expect(shouldLoadMore(false, false)).toBe(false)
    })
    it('다음 페이지가 없고 가져오는 중이어도 false', () => {
      expect(shouldLoadMore(false, true)).toBe(false)
    })
  })
})
