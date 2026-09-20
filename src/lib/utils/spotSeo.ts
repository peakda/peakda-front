import type { SpotDetailResponse } from '@/api/facades/generated/peakdaApi.schemas'
import type { BloomStageStatus } from '@/lib/utils/bloomStatus'
import { SITE_NAME, SITE_URL } from '@/constants/site'
import { formatPeakPeriod } from '@/lib/utils/bloomCalendar'
import { formatMonthDay } from '@/lib/utils/explore'

// 검색 결과 설명문용 상태 표기. 화면 뱃지('이르다', '이제 막요')는 문맥 없이 읽히면 뜻이 흐려서 따로 둔다.
// PREPARING 은 '개화 전'이었는데, 진짜 개화 전인 BEFORE_SEASON 이 생겨 '개화 임박'으로 비켰다.
const STATUS_TEXT: Record<BloomStageStatus, string> = {
  BEFORE_SEASON: '개화 전',
  PREPARING: '개화 임박',
  STARTED: '개화 시작',
  PEAK: '절정',
  ENDED: '절정 지남',
}

// '남산 벚꽃 개화 시기'. 개화 정보가 없는 동네 스팟은 이름만.
export function toSpotSeoTitle(spot: SpotDetailResponse): string {
  return spot.bloom ? `${spot.name} ${spot.bloom.displayName} 개화 시기` : spot.name
}

// '벚꽃 절정 · 절정 예상 4.1(수) ~ 4.10(금) · 9.14 기준 예측 · 서울특별시 중구 · 방문 기록 3개'
export function toSpotSeoDescription(spot: SpotDetailResponse): string {
  const { bloom } = spot
  const period = bloom ? formatPeakPeriod(bloom.peakStartDate, bloom.peakEndDate) : ''

  return [
    bloom && `${bloom.displayName} ${STATUS_TEXT[bloom.status]}`,
    period && `절정 예상 ${period}`,
    bloom && `${formatMonthDay(bloom.baseDate)} 기준 예측`,
    spot.address,
    spot.recordCount > 0 && `방문 기록 ${spot.recordCount}개`,
  ]
    .filter(Boolean)
    .join(' · ')
}

// 공유 카드·구조화 데이터 이미지. 명소(TourAPI) 이미지만 쓴다 — 동네 스팟의 대표 사진은
// 방문 기록의 presigned URL 이라 만료되면 크롤러가 나중에 가져갈 때 깨진다.
export function toSpotShareImage(spot: SpotDetailResponse): string | null {
  if (spot.type !== 'ATTRACTION' || !spot.representativeImageUrl) return null
  // TourAPI 이미지가 http 로 내려오는 경우가 있다. 같은 호스트가 https 도 제공한다.
  return spot.representativeImageUrl.replace(/^http:\/\//, 'https://')
}

// 화면에 보이는 이름·주소·좌표·이미지만 담는다 (구조화 데이터는 실제 내용과 일치해야 한다).
export function toSpotJsonLd(spot: SpotDetailResponse) {
  const url = `${SITE_URL}/spot/${spot.id}`
  const image = toSpotShareImage(spot)

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': spot.type === 'ATTRACTION' ? 'TouristAttraction' : 'Place',
        '@id': url,
        name: spot.name,
        description: toSpotSeoDescription(spot),
        url,
        ...(spot.address && { address: spot.address }),
        geo: { '@type': 'GeoCoordinates', latitude: spot.latitude, longitude: spot.longitude },
        ...(image && { image }),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: SITE_NAME, item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: '지도', item: `${SITE_URL}/map` },
          { '@type': 'ListItem', position: 3, name: spot.name, item: url },
        ],
      },
    ],
  }
}

// <script type="application/ld+json"> 본문. 값에 '</script>' 가 섞여도 스크립트가 끝나지 않게 '<' 를 이스케이프한다.
export function toJsonLdScript(data: object): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
