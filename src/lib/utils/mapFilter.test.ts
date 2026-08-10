import { describe, it, expect } from 'vitest'
import { filterMapSpots } from './mapFilter'
import type { MapSpot } from '@/hooks/useMapPins'
import type {
  BloomMapPinType,
  BloomSlotCategory,
  BloomSlotStatus,
} from '@/api/facades/generated/peakdaApi.schemas'
import type { PinTypeFilter } from '@/stores/useFilterStore'

const spot = (
  title: string,
  type: BloomMapPinType,
  statuses: BloomSlotStatus[],
  categories: BloomSlotCategory[] = ['CHERRY']
): MapSpot => ({
  lat: 37.5,
  lng: 127,
  flowers: [{ src: '/flowers/cherry-blossom.svg', alt: '벚꽃' }],
  maxStage: 'Peak',
  title,
  type,
  statuses,
  categories,
})

// 조건을 안 넘긴 항목은 "거르지 않음" 으로 채운다.
const filter = (over: {
  pinType?: PinTypeFilter
  statuses?: BloomSlotStatus[]
  categories?: BloomSlotCategory[]
}) => ({ pinType: 'ALL' as PinTypeFilter, statuses: [], categories: [], ...over })

const attractionPeak = spot('명소-절정', 'ATTRACTION', ['PEAK'])
const localStarted = spot('동네-개화시작', 'LOCAL', ['STARTED'])
const localMulti = spot('동네-복수', 'LOCAL', ['PREPARING', 'PEAK'], ['CHERRY', 'MAPLE'])
const attractionEnded = spot('명소-종료', 'ATTRACTION', ['ENDED'], ['LOTUS'])

const ALL_SPOTS = [attractionPeak, localStarted, localMulti, attractionEnded]

describe('lib/utils/mapFilter', () => {
  it('거를 조건이 없으면 원본 그대로', () => {
    expect(filterMapSpots(ALL_SPOTS, filter({}))).toEqual(ALL_SPOTS)
  })

  it('pinType LOCAL 이면 동네형 핀만 남는다', () => {
    expect(filterMapSpots(ALL_SPOTS, filter({ pinType: 'LOCAL' }))).toEqual([
      localStarted,
      localMulti,
    ])
  })

  it('pinType ATTRACTION 이면 명소형 핀만 남는다', () => {
    expect(filterMapSpots(ALL_SPOTS, filter({ pinType: 'ATTRACTION' }))).toEqual([
      attractionPeak,
      attractionEnded,
    ])
  })

  // 핀 하나에 꽃이 여러 개일 수 있으므로 "하나라도 해당" 이면 남긴다.
  it('statuses 는 핀의 꽃 중 하나라도 해당하면 통과', () => {
    expect(filterMapSpots(ALL_SPOTS, filter({ statuses: ['PEAK'] }))).toEqual([
      attractionPeak,
      localMulti,
    ])
  })

  it('statuses 가 복수면 OR 조건', () => {
    expect(filterMapSpots(ALL_SPOTS, filter({ statuses: ['STARTED', 'ENDED'] }))).toEqual([
      localStarted,
      attractionEnded,
    ])
  })

  // 서버 category 파라미터는 값 하나만 받는다. 복수 선택은 여기서 거른다.
  describe('categories (꽃 종류 복수 선택)', () => {
    it('선택한 꽃을 가진 핀만 남는다', () => {
      expect(filterMapSpots(ALL_SPOTS, filter({ categories: ['LOTUS'] }))).toEqual([
        attractionEnded,
      ])
    })

    it('복수 선택은 OR 조건', () => {
      expect(filterMapSpots(ALL_SPOTS, filter({ categories: ['LOTUS', 'MAPLE'] }))).toEqual([
        localMulti,
        attractionEnded,
      ])
    })

    it('핀에 꽃이 여러 개면 하나라도 걸리면 통과', () => {
      expect(filterMapSpots([localMulti], filter({ categories: ['MAPLE'] }))).toEqual([localMulti])
    })

    it('빈 배열이면 꽃으로 거르지 않는다', () => {
      expect(filterMapSpots(ALL_SPOTS, filter({ categories: [] }))).toEqual(ALL_SPOTS)
    })
  })

  it('세 조건을 동시에 적용한다', () => {
    expect(
      filterMapSpots(ALL_SPOTS, filter({ pinType: 'LOCAL', statuses: ['PEAK'], categories: ['MAPLE'] }))
    ).toEqual([localMulti])
  })

  it('빈 배열을 넣으면 빈 배열', () => {
    expect(filterMapSpots([], filter({ pinType: 'LOCAL' }))).toEqual([])
  })

  it('조건에 맞는 핀이 없으면 빈 배열', () => {
    expect(filterMapSpots(ALL_SPOTS, filter({ pinType: 'ATTRACTION', statuses: ['STARTED'] }))).toEqual(
      []
    )
  })
})
