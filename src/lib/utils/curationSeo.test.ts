import { describe, it, expect } from 'vitest'
import type {
  CurationChapterResponse,
  CurationDetailResponse,
  CurationRecommendationResponse,
} from '@/api/facades/generated/peakdaApi.schemas'
import { toCurationJsonLd } from './curationSeo'

const curation = (overrides: Partial<CurationDetailResponse> = {}): CurationDetailResponse =>
  ({
    id: 7,
    weekLabel: '8월 4주차',
    weekStartDate: '2026-08-22',
    weekEndDate: '2026-08-28',
    title: '처서가 지나면,\n노란 코스모스',
    subtitle: '황화코스모스가 슬슬 얼굴을 내밀어요',
    heroImageUrl: 'https://cdn.peakda.com/editorial/hero.png',
    chapters: [
      { placeName: '뚝섬한강공원', spotId: 12 } as CurationChapterResponse,
      { placeName: '올림픽공원', spotId: null } as CurationChapterResponse,
    ],
    recommendations: [{ placeName: '뚝섬한강공원', spotId: 12 } as CurationRecommendationResponse],
    ...overrides,
  }) as CurationDetailResponse

const article = (data: CurationDetailResponse) =>
  toCurationJsonLd(data)['@graph'][0] as Record<string, unknown>

describe('toCurationJsonLd', () => {
  it('제목 줄바꿈을 한 줄로 펴서 headline 으로 쓴다', () => {
    expect(article(curation()).headline).toBe('처서가 지나면, 노란 코스모스')
  })

  it('발행일이 없으므로 datePublished 를 지어내지 않는다', () => {
    expect(article(curation())).not.toHaveProperty('datePublished')
  })

  it('소개 장소는 이름으로 중복을 없애고, spotId 가 있을 때만 스팟 상세로 잇는다', () => {
    expect(article(curation()).mentions).toEqual([
      { '@type': 'Place', name: '뚝섬한강공원', url: 'https://www.peakda.com/spot/12' },
      { '@type': 'Place', name: '올림픽공원' },
    ])
  })

  it('부제·대표 이미지·장소가 없으면 해당 필드를 뺀다', () => {
    const data = article(
      curation({ subtitle: null, heroImageUrl: null, chapters: [], recommendations: [] })
    )
    expect(data).not.toHaveProperty('description')
    expect(data).not.toHaveProperty('image')
    expect(data).not.toHaveProperty('mentions')
  })
})
