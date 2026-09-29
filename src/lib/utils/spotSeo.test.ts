import { describe, it, expect } from 'vitest'
import type { BloomMapPin, SpotDetailResponse } from '@/api/facades/generated/peakdaApi.schemas'
import {
  isSitemapSpotPin,
  toJsonLdScript,
  toSpotJsonLd,
  toSpotSeoDescription,
  toSpotSeoTitle,
  toSpotShareImage,
} from './spotSeo'

const attraction: SpotDetailResponse = {
  id: 166,
  type: 'ATTRACTION',
  name: '남산',
  address: '서울특별시 중구',
  latitude: 37.5512,
  longitude: 126.9882,
  attractionId: 195,
  representativeImageUrl: 'http://tong.visitkorea.or.kr/cms/a.jpg',
  bloom: {
    category: 'CHERRY',
    displayName: '벚꽃',
    status: 'PEAK',
    confidence: 0.8,
    peakStartDate: '2027-04-01',
    peakEndDate: '2027-04-10',
    peakDurationDays: 10,
    baseDate: '2026-09-14',
  },
  recordCount: 3,
  recordPreview: [],
  favorite: { favorited: false, notifyEnabled: false },
}

const local: SpotDetailResponse = {
  ...attraction,
  id: 7,
  type: 'LOCAL',
  name: '동네 공원',
  address: null,
  attractionId: null,
  representativeImageUrl: 'https://bucket.s3.amazonaws.com/a.jpg?X-Amz-Signature=x',
  bloom: null,
  recordCount: 0,
}

// 스팟 상세의 검색 metadata·구조화 데이터 조립.
describe('lib/utils/spotSeo', () => {
  describe('toSpotSeoTitle', () => {
    it('개화 정보가 있으면 꽃 이름과 "개화 시기"를 붙인다', () => {
      expect(toSpotSeoTitle(attraction)).toBe('남산 벚꽃 개화 시기')
    })

    it('개화 정보가 없으면 이름만', () => {
      expect(toSpotSeoTitle(local)).toBe('동네 공원')
    })
  })

  describe('toSpotSeoDescription', () => {
    it('상태·절정 예상·기준일·주소·기록 수를 순서대로 잇는다', () => {
      expect(toSpotSeoDescription(attraction)).toBe(
        '벚꽃 절정 · 절정 예상 4.1(목) ~ 4.10(토) · 9.14 기준 예측 · 서울특별시 중구 · 방문 기록 3개'
      )
    })

    it('없는 값은 건너뛴다', () => {
      expect(toSpotSeoDescription(local)).toBe('')
    })
  })

  describe('toSpotShareImage', () => {
    it('명소 이미지는 https 로 바꿔 쓴다', () => {
      expect(toSpotShareImage(attraction)).toBe('https://tong.visitkorea.or.kr/cms/a.jpg')
    })

    // 동네 스팟 대표 사진은 만료되는 presigned URL 이라 공유 카드에 쓰면 나중에 깨진다.
    it('동네 스팟은 null', () => {
      expect(toSpotShareImage(local)).toBeNull()
    })
  })

  describe('toSpotJsonLd', () => {
    it('명소는 TouristAttraction, 좌표·이미지·빵부스러기를 담는다', () => {
      const [place, breadcrumb] = toSpotJsonLd(attraction)['@graph']
      expect(place).toMatchObject({
        '@type': 'TouristAttraction',
        name: '남산',
        url: 'https://www.peakda.com/spot/166',
        address: '서울특별시 중구',
        geo: { latitude: 37.5512, longitude: 126.9882 },
        image: 'https://tong.visitkorea.or.kr/cms/a.jpg',
      })
      expect(breadcrumb).toMatchObject({ '@type': 'BreadcrumbList' })
    })

    it('동네 스팟은 Place, 주소·이미지 필드를 넣지 않는다', () => {
      const [place] = toSpotJsonLd(local)['@graph']
      expect(place['@type']).toBe('Place')
      expect(place).not.toHaveProperty('address')
      expect(place).not.toHaveProperty('image')
    })
  })

  describe('isSitemapSpotPin', () => {
    const pin = (overrides: Partial<BloomMapPin>): BloomMapPin => ({
      spotId: 22,
      attractionId: 490,
      type: 'ATTRACTION',
      name: '경인아라뱃길 매화동산',
      blooms: [{ category: 'PLUM', displayName: '매화', status: 'BEFORE_SEASON', confidence: 0.4 }],
      ...overrides,
    })
    const silvergrass = {
      category: 'SILVERGRASS',
      displayName: '억새',
      status: 'BEFORE_SEASON',
      confidence: 0.4,
    } as const

    it('꽃 명소는 넣는다', () => {
      expect(isSitemapSpotPin(pin({}))).toBe(true)
    })

    it('spotId 가 없거나 동네 스팟이면 뺀다', () => {
      expect(isSitemapSpotPin(pin({ spotId: null }))).toBe(false)
      expect(isSitemapSpotPin(pin({ type: 'LOCAL' }))).toBe(false)
    })

    it('억새만 달린 명소는 빼고, 다른 꽃과 함께면 넣는다', () => {
      expect(isSitemapSpotPin(pin({ name: '올리브영 광주상무역점', blooms: [silvergrass] }))).toBe(false)
      expect(isSitemapSpotPin(pin({ blooms: [...pin({}).blooms, silvergrass] }))).toBe(true)
    })

    it('음식점·숙박·시장 이름은 뺀다', () => {
      expect(isSitemapSpotPin(pin({ name: '미진분식' }))).toBe(false)
      expect(isSitemapSpotPin(pin({ name: '호텔 라온제나' }))).toBe(false)
      expect(isSitemapSpotPin(pin({ name: '동대구시장' }))).toBe(false)
    })
  })

  describe('toJsonLdScript', () => {
    it("'<' 를 이스케이프해 </script> 로 스크립트가 끝나지 않게 한다", () => {
      expect(toJsonLdScript({ name: '</script>' })).toBe('{"name":"\\u003c/script>"}')
    })
  })
})
