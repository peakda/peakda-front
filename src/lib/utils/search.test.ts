import { describe, it, expect } from 'vitest'
import {
  toSpotProps,
  toUserProps,
  addRecentSearch,
  removeRecentSearch,
  readRecentSearches,
} from './search'

describe('utils/search', () => {
  describe('toSpotProps', () => {
    // favorited·notifyEnabled 는 아직 toSpotProps 가 쓰지 않는다(검색 카드 보강 작업에서 연동).
    const base = {
      spotId: 1,
      name: '남산공원',
      latitude: 37.5,
      longitude: 127.0,
      favorited: false,
      notifyEnabled: false,
    }

    it('address 가 null 이면 location 은 빈 문자열', () => {
      expect(toSpotProps({ ...base, type: 'ATTRACTION', address: null }).location).toBe('')
    })
    it('address 가 없으면(undefined) location 은 빈 문자열', () => {
      expect(toSpotProps({ ...base, type: 'ATTRACTION' }).location).toBe('')
    })
    it('ATTRACTION 은 명소 태그로 표시', () => {
      expect(toSpotProps({ ...base, type: 'ATTRACTION', address: '서울 중구' })).toEqual({
        id: 1,
        name: '남산공원',
        location: '서울 중구',
        status: '',
        nameList: ['명소'],
      })
    })
    it('LOCAL 은 동네 태그로 표시', () => {
      expect(toSpotProps({ ...base, type: 'LOCAL' }).nameList).toEqual(['동네'])
    })
  })

  describe('toUserProps', () => {
    // following·recordCount·followerCount 는 아직 toUserProps 가 쓰지 않는다(검색 카드 보강 작업에서 연동).
    const base = { userId: 7, nickname: '봄이', following: false, recordCount: 0, followerCount: 0 }

    it('profileImageUrl 을 imageUrl 로 넘긴다', () => {
      expect(toUserProps({ ...base, profileImageUrl: 'https://img/a.png' })).toEqual({
        id: 7,
        name: '봄이',
        stats: '',
        following: false,
        imageUrl: 'https://img/a.png',
      })
    })
    it('profileImageUrl 이 없으면 imageUrl 은 null', () => {
      expect(toUserProps(base).imageUrl).toBeNull()
    })
  })

  describe('addRecentSearch', () => {
    it('새 항목이 맨 앞에 온다', () => {
      expect(addRecentSearch(['b'], 'a')).toEqual(['a', 'b'])
    })
    it('이미 있으면 중복 없이 맨 앞으로 이동', () => {
      expect(addRecentSearch(['a', 'b', 'c'], 'c')).toEqual(['c', 'a', 'b'])
    })
    it('앞뒤 공백은 제거하고 저장', () => {
      expect(addRecentSearch([], '  벚꽃  ')).toEqual(['벚꽃'])
    })
    it('공백만 있는 키워드는 무시', () => {
      expect(addRecentSearch(['a'], '   ')).toEqual(['a'])
    })
    it('빈 키워드는 무시', () => {
      expect(addRecentSearch(['a'], '')).toEqual(['a'])
    })
    it('11개째부터 가장 오래된 항목이 잘린다', () => {
      const ten = Array.from({ length: 10 }, (_, i) => `k${i}`)
      const result = addRecentSearch(ten, 'new')
      expect(result).toHaveLength(10)
      expect(result[0]).toBe('new')
      expect(result).not.toContain('k9')
    })
  })

  describe('removeRecentSearch', () => {
    it('해당 항목만 빠지고 나머지 순서는 유지', () => {
      expect(removeRecentSearch(['a', 'b', 'c'], 'b')).toEqual(['a', 'c'])
    })
    it('없는 항목이면 그대로', () => {
      expect(removeRecentSearch(['a', 'b'], 'z')).toEqual(['a', 'b'])
    })
  })

  describe('readRecentSearches', () => {
    it('null 이면 빈 배열', () => {
      expect(readRecentSearches(null)).toEqual([])
    })
    it('깨진 JSON 이면 빈 배열', () => {
      expect(readRecentSearches('{ not json')).toEqual([])
    })
    it('배열이 아닌 JSON 이면 빈 배열', () => {
      expect(readRecentSearches('{"a":1}')).toEqual([])
    })
    it('정상 배열이면 그대로 반환', () => {
      expect(readRecentSearches('["벚꽃","단풍"]')).toEqual(['벚꽃', '단풍'])
    })
    it('배열 안 문자열이 아닌 값은 걸러낸다', () => {
      expect(readRecentSearches('["벚꽃",1,null]')).toEqual(['벚꽃'])
    })
  })
})
