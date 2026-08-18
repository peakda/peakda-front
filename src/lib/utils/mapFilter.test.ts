import { describe, it, expect } from 'vitest'
import { filterMapSpots } from './mapFilter'
import type { MapSpot } from '@/hooks/useMapPins'
import type {
  BloomMapPinType,
  BloomSlotCategory,
  BloomSlotStatus,
} from '@/api/facades/generated/peakdaApi.schemas'
import type { PinTypeFilter } from '@/stores/useFilterStore'
import { CATEGORY_ICON, toMaxStage } from '@/constants/map'

// 실제 핀과 같은 모양으로 만든다 — flowers·statuses·categories 는 꽃 순서가 같은 병렬 배열이고
// maxStage 는 statuses 에서 파생된다. 꽃 좁히기 테스트가 이 정렬에 기댄다.
const spot = (
  title: string,
  type: BloomMapPinType,
  statuses: BloomSlotStatus[],
  categories: BloomSlotCategory[] = ['CHERRY']
): MapSpot => ({
  lat: 37.5,
  lng: 127,
  flowers: categories.map((category) => ({ src: CATEGORY_ICON[category], alt: category })),
  maxStage: toMaxStage(statuses),
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
      expect(
        filterMapSpots(ALL_SPOTS, filter({ categories: ['LOTUS', 'MAPLE'] })).map((s) => s.title)
      ).toEqual(['동네-복수', '명소-종료'])
    })

    it('빈 배열이면 꽃으로 거르지 않는다', () => {
      expect(filterMapSpots(ALL_SPOTS, filter({ categories: [] }))).toEqual(ALL_SPOTS)
    })

    // 핀을 통과시키기만 하면 벚꽃으로 걸러도 같은 핀의 단풍 아이콘이 그대로 뜨고
    // 핀 색도 단풍(Peak) 기준으로 남는다. 고른 꽃만 남기고 색도 다시 계산해야 한다.
    it('핀에 꽃이 여러 개면 고른 꽃만 남기고 핀 색도 다시 계산한다', () => {
      const [narrowed] = filterMapSpots([localMulti], filter({ categories: ['CHERRY'] }))

      expect(narrowed.categories).toEqual(['CHERRY'])
      expect(narrowed.statuses).toEqual(['PREPARING'])
      expect(narrowed.flowers).toEqual([{ src: CATEGORY_ICON.CHERRY, alt: 'CHERRY' }])
      // 좁히기 전에는 단풍(PEAK) 때문에 Peak 였다.
      expect(narrowed.maxStage).toBe('Before')
      expect(localMulti.maxStage).toBe('Peak')
    })

    it('꽃이 전부 남으면 같은 객체를 그대로 돌려준다', () => {
      const [same] = filterMapSpots([localMulti], filter({ categories: ['CHERRY', 'MAPLE'] }))
      expect(same).toBe(localMulti)
    })
  })

  it('세 조건을 동시에 적용한다', () => {
    const result = filterMapSpots(
      ALL_SPOTS,
      filter({ pinType: 'LOCAL', statuses: ['PEAK'], categories: ['MAPLE'] })
    )

    expect(result.map((s) => s.title)).toEqual(['동네-복수'])
    expect(result[0].categories).toEqual(['MAPLE'])
  })

  // 꽃과 상태를 같이 걸면 "고른 꽃이 그 상태인 핀" 이어야 한다.
  // 좁히기 전 기준으로 보면 벚꽃은 개화 전인데 단풍이 절정이라는 이유로 통과해 버린다.
  it('꽃을 좁힌 뒤 상태를 보므로 다른 꽃의 상태로는 통과하지 않는다', () => {
    expect(
      filterMapSpots([localMulti], filter({ statuses: ['PEAK'], categories: ['CHERRY'] }))
    ).toEqual([])
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
