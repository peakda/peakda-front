import { describe, it, expect } from 'vitest'
import { toPinListItems } from './spotPreview'
import type { SpotPreviewItem } from '@/api/facades/generated/peakdaApi.schemas'

const item = (over: Partial<SpotPreviewItem> = {}): SpotPreviewItem => ({
  spotId: 1,
  type: 'ATTRACTION',
  name: '남산',
  thumbnailUrl: 'https://img/1.jpg',
  badge: { category: 'CHERRY', displayName: '벚꽃', status: 'PEAK' },
  distanceMeters: 1234,
  address: '서울 중구 남산공원길',
  favorited: false,
  notifyEnabled: false,
  photoUrls: ['https://img/1.jpg'],
  recordCount: 3,
  badges: [{ category: 'CHERRY', displayName: '벚꽃', status: 'PEAK' }],
  ...over,
})

describe('lib/utils/spotPreview', () => {
  describe('toPinListItems', () => {
    it('프리뷰 카드를 PinList props 로 옮긴다', () => {
      expect(toPinListItems([item()])).toEqual([
        {
          type: 'list',
          spotId: 1,
          title: '남산',
          location: '서울 중구 남산공원길',
          description: '벚꽃',
          tagText: '만개',
          badges: [{ label: '벚꽃', icon: '/flowers/cherry-blossom.svg' }],
          isFavorite: false,
          images: ['https://img/1.jpg'],
        },
      ])
    })

    it('찜 상태를 그대로 반영한다', () => {
      expect(toPinListItems([item({ favorited: true })])[0].isFavorite).toBe(true)
    })

    // 주소가 없으면 위치 줄을 비운다(탐색 카드와 같은 처리).
    it('주소가 없으면 위치는 빈 문자열', () => {
      expect(toPinListItems([item({ address: null })])[0].location).toBe('')
    })

    // 카드가 4칸 그리드고 서버도 최대 4장을 준다.
    it('사진은 4장까지 쓴다', () => {
      const photoUrls = ['a', 'b', 'c', 'd', 'e']
      expect(toPinListItems([item({ photoUrls })])[0].images).toEqual(['a', 'b', 'c', 'd'])
    })

    it('사진이 없으면 이미지 칸을 비운다', () => {
      expect(toPinListItems([item({ photoUrls: [] })])[0].images).toEqual([])
    })

    it('개화 정보가 없으면 뱃지·태그를 비운다', () => {
      const result = toPinListItems([item({ badges: [] })])[0]
      expect(result.badges).toEqual([])
      expect(result.tagText).toBeUndefined()
      expect(result.description).toBe('')
    })

    // 꽃을 여러 개 고르면 서버가 그만큼 배지를 준다. 꽃마다 아이콘이 달라 라벨과 쌍으로 넘긴다.
    it('배지가 여러 개면 전부 아이콘과 함께 넘긴다', () => {
      const badges: SpotPreviewItem['badges'] = [
        { category: 'MAPLE', displayName: '단풍', status: 'PEAK' },
        { category: 'COSMOS', displayName: '코스모스', status: 'STARTED' },
      ]
      const result = toPinListItems([item({ badges })])[0]
      expect(result.badges).toEqual([
        { label: '단풍', icon: '/flowers/maple.svg' },
        { label: '코스모스', icon: '/flowers/cosmos.svg' },
      ])
    })

    // 제목 옆 상태 태그는 하나뿐이라 첫 배지를 대표로 쓴다.
    it('상태 태그는 첫 배지 기준이다', () => {
      const badges: SpotPreviewItem['badges'] = [
        { category: 'MAPLE', displayName: '단풍', status: 'PEAK' },
        { category: 'COSMOS', displayName: '코스모스', status: 'STARTED' },
      ]
      expect(toPinListItems([item({ badges })])[0].tagText).toBe('만개')
    })

    it('상태 라벨은 지도 핀과 같은 표기를 쓴다', () => {
      const tagOf = (status: 'PREPARING' | 'STARTED') =>
        toPinListItems([item({ badges: [{ category: 'MAPLE', displayName: '단풍', status }] })])[0]
          .tagText

      expect(tagOf('PREPARING')).toBe('개화 전')
      expect(tagOf('STARTED')).toBe('개화 시작')
    })

    it('빈 목록은 빈 배열', () => {
      expect(toPinListItems([])).toEqual([])
    })
  })
})
