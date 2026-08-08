import { describe, it, expect } from 'vitest'
import { filterMapSpots } from './mapFilter'
import type { MapSpot } from '@/hooks/useMapPins'
import type {
  BloomMapPinType,
  BloomSlotStatus,
} from '@/api/facades/generated/peakdaApi.schemas'

const spot = (
  title: string,
  type: BloomMapPinType,
  statuses: BloomSlotStatus[]
): MapSpot => ({
  lat: 37.5,
  lng: 127,
  flowers: [{ src: '/flowers/cherry-blossom.svg', alt: '벚꽃' }],
  maxStage: 'Peak',
  title,
  type,
  statuses,
})

const attractionPeak = spot('명소-절정', 'ATTRACTION', ['PEAK'])
const localStarted = spot('동네-개화시작', 'LOCAL', ['STARTED'])
const localMulti = spot('동네-복수', 'LOCAL', ['PREPARING', 'PEAK'])
const attractionEnded = spot('명소-종료', 'ATTRACTION', ['ENDED'])

const ALL_SPOTS = [attractionPeak, localStarted, localMulti, attractionEnded]

describe('lib/utils/mapFilter', () => {
  it('pinType 이 ALL 이고 statuses 가 비면 원본 그대로', () => {
    expect(filterMapSpots(ALL_SPOTS, { pinType: 'ALL', statuses: [] })).toEqual(ALL_SPOTS)
  })

  it('pinType LOCAL 이면 동네형 핀만 남는다', () => {
    expect(filterMapSpots(ALL_SPOTS, { pinType: 'LOCAL', statuses: [] })).toEqual([
      localStarted,
      localMulti,
    ])
  })

  it('pinType ATTRACTION 이면 명소형 핀만 남는다', () => {
    expect(filterMapSpots(ALL_SPOTS, { pinType: 'ATTRACTION', statuses: [] })).toEqual([
      attractionPeak,
      attractionEnded,
    ])
  })

  // 핀 하나에 꽃이 여러 개일 수 있으므로 "하나라도 해당 상태" 면 남긴다.
  it('statuses 는 핀의 꽃 중 하나라도 해당하면 통과', () => {
    expect(filterMapSpots(ALL_SPOTS, { pinType: 'ALL', statuses: ['PEAK'] })).toEqual([
      attractionPeak,
      localMulti,
    ])
  })

  it('statuses 가 복수면 OR 조건', () => {
    expect(filterMapSpots(ALL_SPOTS, { pinType: 'ALL', statuses: ['STARTED', 'ENDED'] })).toEqual([
      localStarted,
      attractionEnded,
    ])
  })

  it('pinType 과 statuses 를 동시에 적용한다', () => {
    expect(filterMapSpots(ALL_SPOTS, { pinType: 'LOCAL', statuses: ['PEAK'] })).toEqual([localMulti])
  })

  it('빈 배열을 넣으면 빈 배열', () => {
    expect(filterMapSpots([], { pinType: 'LOCAL', statuses: ['PEAK'] })).toEqual([])
  })

  it('조건에 맞는 핀이 없으면 빈 배열', () => {
    expect(filterMapSpots(ALL_SPOTS, { pinType: 'ATTRACTION', statuses: ['STARTED'] })).toEqual([])
  })
})
