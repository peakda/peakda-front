import { describe, expect, it } from 'vitest'
import type { PhotoEntry, SpotRecordSummaryResponse } from '@/api/facades/generated/peakdaApi.schemas'
import { toFeedCardProps } from '@/lib/utils/spotRecordToFeed'

const PLACEHOLDER = '/images/explore.png'

function photo(url: string, sortOrder: number): PhotoEntry {
  return { objectKey: `key-${sortOrder}`, url, sortOrder }
}

function summary(overrides: Partial<SpotRecordSummaryResponse> = {}): SpotRecordSummaryResponse {
  return {
    id: 1,
    spotId: 10,
    spotName: '남산',
    user: { id: 100, nickname: '피크다' },
    plants: [],
    status: 'PUBLISHED',
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
    reactions: { counts: [], myReactions: [] },
    ...overrides,
  }
}

describe('toFeedCardProps 의 images', () => {
  // 백엔드가 photos 를 배포하기 전후 모두 동작해야 한다.
  it('photos 가 없는 기존 응답은 대표 사진 한 장을 쓴다', () => {
    const props = toFeedCardProps(summary({ coverPhoto: photo('cover.jpg', 0) }))

    expect(props.images).toEqual(['cover.jpg'])
  })

  it('photos 가 오면 전부 사용한다', () => {
    const props = toFeedCardProps({
      ...summary({ coverPhoto: photo('a.jpg', 0) }),
      photos: [photo('a.jpg', 0), photo('b.jpg', 1), photo('c.jpg', 2)],
    })

    expect(props.images).toEqual(['a.jpg', 'b.jpg', 'c.jpg'])
  })

  it('사진이 아예 없으면 placeholder 를 쓴다', () => {
    expect(toFeedCardProps(summary()).images).toEqual([PLACEHOLDER])
    expect(toFeedCardProps({ ...summary(), photos: [] }).images).toEqual([PLACEHOLDER])
  })
})
