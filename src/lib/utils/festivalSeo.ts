import type { FestivalDetailResponse } from '@/api/facades/generated/peakdaApi.schemas'
import { SITE_NAME, SITE_URL } from '@/constants/site'
import { FESTIVAL_PHASE_LABEL, formatMonthDay } from '@/lib/utils/explore'

// 검색 결과 설명문: '9.18~10.4 · 경남 하동군 … · 곧 종료'. 기간 · 장소 · 진행 상태 순.
export function toFestivalSeoDescription(festival: FestivalDetailResponse): string {
  const { startsOn, endsOn, phase } = festival
  const period = startsOn
    ? endsOn
      ? `${formatMonthDay(startsOn)}~${formatMonthDay(endsOn)}`
      : formatMonthDay(startsOn)
    : null
  return [
    period,
    festival.roadAddress ?? festival.venue,
    phase ? FESTIVAL_PHASE_LABEL[phase] : null,
  ]
    .filter(Boolean)
    .join(' · ')
}

// 화면에 보이는 이름·기간·장소·이미지만 담는다 (구조화 데이터는 실제 내용과 일치해야 한다).
// Event 는 startDate 가 필수라, 시작일이 없는 축제는 BreadcrumbList 만 낸다.
export function toFestivalJsonLd(festival: FestivalDetailResponse) {
  const url = `${SITE_URL}/festivals/${festival.festivalId}`
  const image = festival.editorial?.heroImageUrl
  const hasGeo = festival.latitude != null && festival.longitude != null

  const event = festival.startsOn && {
    '@type': 'Event',
    '@id': url,
    name: festival.name,
    description: toFestivalSeoDescription(festival),
    url,
    startDate: festival.startsOn,
    ...(festival.endsOn && { endDate: festival.endsOn }),
    // 서버 phase 에는 취소·연기 값이 없다. 끝난 축제도 '예정대로 열린' 행사라 Scheduled 가 맞다.
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: festival.venue,
      address: festival.roadAddress ?? festival.venue,
      ...(hasGeo && {
        geo: {
          '@type': 'GeoCoordinates',
          latitude: festival.latitude,
          longitude: festival.longitude,
        },
      }),
    },
    ...(image && { image }),
  }

  return {
    '@context': 'https://schema.org',
    '@graph': [
      ...(event ? [event] : []),
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: SITE_NAME, item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: '탐색', item: `${SITE_URL}/explore` },
          { '@type': 'ListItem', position: 3, name: festival.name, item: url },
        ],
      },
    ],
  }
}
