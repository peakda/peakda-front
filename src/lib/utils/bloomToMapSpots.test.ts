import { describe, it, expect } from 'vitest'
import { bloomToMapSpots } from './bloomToMapSpots'
import type {
  BloomMapPin,
  BloomMapResponse,
  BloomSlot,
} from '@/api/facades/generated/peakdaApi.schemas'

const bloom = (
  category: BloomSlot['category'],
  status: BloomSlot['status'],
  displayName: string
): BloomSlot => ({ category, status, displayName, confidence: 0.9 })

const response = (pins: BloomMapPin[]): BloomMapResponse => ({
  count: pins.length,
  pins,
  attractions: [],
})

describe('lib/utils/bloomToMapSpots', () => {
  it('핀 유형(type)을 그대로 싣는다', () => {
    const spots = bloomToMapSpots(
      response([
        {
          type: 'LOCAL',
          name: '우리 동네',
          latitude: 37.5,
          longitude: 127,
          blooms: [bloom('CHERRY', 'PEAK', '벚꽃')],
        },
      ])
    )

    expect(spots).toHaveLength(1)
    expect(spots[0].type).toBe('LOCAL')
  })

  it('꽃 슬롯의 status 를 statuses 배열로 싣는다', () => {
    const spots = bloomToMapSpots(
      response([
        {
          type: 'ATTRACTION',
          name: '여의도',
          latitude: 37.52,
          longitude: 126.93,
          blooms: [bloom('CHERRY', 'PEAK', '벚꽃'), bloom('CANOLA', 'PREPARING', '유채꽃')],
        },
      ])
    )

    expect(spots[0].statuses).toEqual(['PEAK', 'PREPARING'])
  })

  // 서버 category 가 단일 값이라 꽃 종류 복수 선택은 이 배열로 클라에서 거른다.
  it('꽃 슬롯의 category 를 categories 배열로 싣는다', () => {
    const spots = bloomToMapSpots(
      response([
        {
          type: 'ATTRACTION',
          name: '여의도',
          latitude: 37.52,
          longitude: 126.93,
          blooms: [bloom('CHERRY', 'PEAK', '벚꽃'), bloom('CANOLA', 'PREPARING', '유채꽃')],
        },
      ])
    )

    expect(spots[0].categories).toEqual(['CHERRY', 'CANOLA'])
  })

  it('좌표가 없는 핀은 제외한다', () => {
    const spots = bloomToMapSpots(
      response([
        { type: 'ATTRACTION', name: '위도 없음', longitude: 127, blooms: [] },
        { type: 'LOCAL', name: '경도 null', latitude: 37.5, longitude: null, blooms: [] },
        {
          type: 'LOCAL',
          name: '정상',
          latitude: 37.5,
          longitude: 127,
          blooms: [bloom('MAPLE', 'STARTED', '단풍')],
        },
      ])
    )

    expect(spots.map((s) => s.title)).toEqual(['정상'])
  })

  it('꽃 아이콘·이름과 최고 단계(maxStage)를 함께 만든다', () => {
    const spots = bloomToMapSpots(
      response([
        {
          type: 'ATTRACTION',
          name: '진해',
          latitude: 35.15,
          longitude: 128.66,
          attractionId: 7,
          spotId: 3,
          blooms: [bloom('CHERRY', 'PREPARING', '벚꽃'), bloom('MAPLE', 'PEAK', '단풍')],
        },
      ])
    )

    expect(spots[0]).toMatchObject({
      lat: 35.15,
      lng: 128.66,
      maxStage: 'Peak',
      title: '진해',
      attractionId: 7,
      spotId: 3,
      flowers: [
        { src: '/flowers/cherry-blossom.webp', alt: '벚꽃' },
        { src: '/flowers/maple.webp', alt: '단풍' },
      ],
    })
  })

  it('핀이 없으면 빈 배열', () => {
    expect(bloomToMapSpots(response([]))).toEqual([])
  })
})
