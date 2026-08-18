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
        imageUrl: undefined,
        status: '',
        nameList: ['명소'],
        favorited: false,
      })
    })
    it('LOCAL 은 동네 태그로 표시', () => {
      expect(toSpotProps({ ...base, type: 'LOCAL' }).nameList).toEqual(['동네'])
    })

    it('썸네일과 찜 상태를 그대로 옮긴다', () => {
      const result = toSpotProps({
        ...base,
        type: 'ATTRACTION',
        thumbnailUrl: 'https://img/a.jpg',
        favorited: true,
      })
      expect(result.imageUrl).toBe('https://img/a.jpg')
      expect(result.favorited).toBe(true)
    })

    // 개화 배지는 찜·탐색·스팟 상세와 같은 표기를 쓴다.
    it('개화 정보가 있으면 상태 배지를 만든다', () => {
      const result = toSpotProps({
        ...base,
        type: 'ATTRACTION',
        bloom: { category: 'CHERRY', displayName: '벚꽃', status: 'PEAK' },
      })
      expect(result.status).toBe('절정')
      expect(result.statusVariant).toBe('bloom')
    })

    it('개화 정보가 없으면 배지를 비운다', () => {
      expect(toSpotProps({ ...base, type: 'ATTRACTION' }).status).toBe('')
    })
  })

  describe('toUserProps', () => {
    const base = { userId: 7, nickname: '봄이', following: false, recordCount: 24, followerCount: 1280 }

    it('profileImageUrl 을 imageUrl 로 넘긴다', () => {
      expect(toUserProps({ ...base, profileImageUrl: 'https://img/a.png' })).toEqual({
        id: 7,
        name: '봄이',
        stats: '기록 24 · 팔로워 1280',
        following: false,
        imageUrl: 'https://img/a.png',
      })
    })
    it('profileImageUrl 이 없으면 imageUrl 은 null', () => {
      expect(toUserProps(base).imageUrl).toBeNull()
    })

    // 새로고침해도 팔로우 버튼이 '팔로우'로 되돌아가지 않도록 서버 값을 그대로 쓴다.
    it('팔로우 여부를 그대로 옮긴다', () => {
      expect(toUserProps({ ...base, following: true }).following).toBe(true)
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
