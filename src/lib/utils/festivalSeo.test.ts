import { describe, it, expect } from 'vitest'
import type { FestivalDetailResponse } from '@/api/facades/generated/peakdaApi.schemas'
import { toFestivalJsonLd, toFestivalSeoDescription } from './festivalSeo'

const festival: FestivalDetailResponse = {
  festivalId: 4718,
  name: '하동 북천 코스모스·메밀꽃축제',
  venue: '경남 하동군 북천면 직전1길 7',
  roadAddress: null,
  latitude: 35.0,
  longitude: 127.9,
  startsOn: '2026-09-18',
  endsOn: '2026-10-04',
  phase: 'ENDING_SOON',
  editorial: null,
}

const graph = (f: FestivalDetailResponse) => toFestivalJsonLd(f)['@graph']

describe('lib/utils/festivalSeo', () => {
  describe('toFestivalSeoDescription', () => {
    it('기간 · 장소 · 진행 상태 순으로 잇는다', () => {
      expect(toFestivalSeoDescription(festival)).toBe(
        '9.18~10.4 · 경남 하동군 북천면 직전1길 7 · 곧 종료'
      )
    })

    it('도로명 주소가 있으면 장소명 대신 쓰고, 없는 값은 건너뛴다', () => {
      expect(
        toFestivalSeoDescription({
          ...festival,
          roadAddress: '경남 하동군 북천면 직전리',
          endsOn: null,
          phase: undefined,
        })
      ).toBe('9.18 · 경남 하동군 북천면 직전리')
    })
  })

  describe('toFestivalJsonLd', () => {
    it('Event 에 기간·장소·좌표를 담고 BreadcrumbList 를 함께 낸다', () => {
      const [event, breadcrumb] = graph(festival)
      expect(event).toMatchObject({
        '@type': 'Event',
        url: 'https://www.peakda.com/festivals/4718',
        startDate: '2026-09-18',
        endDate: '2026-10-04',
        eventStatus: 'https://schema.org/EventScheduled',
        location: {
          '@type': 'Place',
          name: '경남 하동군 북천면 직전1길 7',
          geo: { latitude: 35.0, longitude: 127.9 },
        },
      })
      expect(breadcrumb).toMatchObject({ '@type': 'BreadcrumbList' })
    })

    // 화면에 없는 값을 지어 넣으면 구조화 데이터 스팸으로 취급될 수 있다.
    it('좌표·종료일·이미지가 없으면 해당 필드를 빼고, 대표 이미지가 있으면 넣는다', () => {
      const [event] = graph({ ...festival, latitude: null, endsOn: null })
      expect(event).not.toHaveProperty('endDate')
      expect(event).not.toHaveProperty('image')
      expect(event).not.toHaveProperty('location.geo')

      const [withImage] = graph({
        ...festival,
        editorial: {
          heroImageUrl: 'https://cdn.peakda.com/a.png',
        } as FestivalDetailResponse['editorial'],
      })
      expect(withImage).toHaveProperty('image', 'https://cdn.peakda.com/a.png')
    })

    it('시작일이 없으면 Event 없이 BreadcrumbList 만 낸다', () => {
      const items = graph({ ...festival, startsOn: null })
      expect(items).toHaveLength(1)
      expect(items[0]).toMatchObject({ '@type': 'BreadcrumbList' })
    })
  })
})
