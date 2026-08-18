import { describe, it, expect } from 'vitest'
import { formatDistance, toPinListItems } from './spotPreview'
import type { SpotPreviewItem } from '@/api/facades/generated/peakdaApi.schemas'

const item = (over: Partial<SpotPreviewItem> = {}): SpotPreviewItem => ({
  spotId: 1,
  type: 'ATTRACTION',
  name: '남산',
  thumbnailUrl: 'https://img/1.jpg',
  badge: { category: 'CHERRY', displayName: '벚꽃', status: 'PEAK' },
  distanceMeters: 1234,
  // 아직 toPinListItems 가 쓰지 않는 신규 필드 — 연동은 preview 보강 작업에서 한다.
  favorited: false,
  notifyEnabled: false,
  photoUrls: [],
  recordCount: 0,
  badges: [],
  ...over,
})

describe('lib/utils/spotPreview', () => {
  describe('formatDistance', () => {
    it('1km 미만은 m 단위', () => {
      expect(formatDistance(350)).toBe('350m')
      expect(formatDistance(999)).toBe('999m')
    })

    it('1km 이상은 소수 한 자리 km', () => {
      expect(formatDistance(1000)).toBe('1km')
      expect(formatDistance(1234)).toBe('1.2km')
      expect(formatDistance(15000)).toBe('15km')
    })

    // 좌표를 안 보내면 서버가 null 을 준다.
    it('거리를 모르면 빈 문자열', () => {
      expect(formatDistance(null)).toBe('')
      expect(formatDistance(undefined)).toBe('')
    })

    // 0m 는 "모름"이 아니라 "바로 여기"다. falsy 로 걸러지면 안 된다.
    it('0m 는 그대로 표시한다', () => {
      expect(formatDistance(0)).toBe('0m')
    })
  })

  describe('toPinListItems', () => {
    it('프리뷰 카드를 PinList props 로 옮긴다', () => {
      expect(toPinListItems([item()])).toEqual([
        {
          type: 'list',
          spotId: 1,
          title: '남산',
          location: '1.2km',
          description: '벚꽃',
          tagText: '만개',
          badgeIcon: '/flowers/cherry-blossom.svg',
          Badges: ['벚꽃'],
          isFavorite: false,
          images: ['https://img/1.jpg'],
        },
      ])
    })

    it('썸네일이 없으면 이미지 칸을 비운다', () => {
      expect(toPinListItems([item({ thumbnailUrl: null })])[0].images).toEqual([])
    })

    it('개화 정보가 없으면 뱃지·태그를 비운다', () => {
      const result = toPinListItems([item({ badge: null })])[0]
      expect(result.Badges).toEqual([])
      expect(result.tagText).toBeUndefined()
      expect(result.badgeIcon).toBeUndefined()
      expect(result.description).toBe('')
    })

    it('상태 라벨은 지도 핀과 같은 표기를 쓴다', () => {
      const tagOf = (status: 'ENDED' | 'PREPARING' | 'STARTED') =>
        toPinListItems([item({ badge: { category: 'MAPLE', displayName: '단풍', status } })])[0]
          .tagText

      expect(tagOf('ENDED')).toBe('개화 종료')
      expect(tagOf('PREPARING')).toBe('개화 전')
      expect(tagOf('STARTED')).toBe('개화 시작')
    })

    it('빈 목록은 빈 배열', () => {
      expect(toPinListItems([])).toEqual([])
    })
  })
})
