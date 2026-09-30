import type { CurationDetailResponse } from '@/api/facades/generated/peakdaApi.schemas'
import { SITE_NAME, SITE_URL } from '@/constants/site'

// 큐레이션(주간 에디토리얼) 상세의 구조화 데이터. 검색엔진·생성형 검색이 '누가 쓴 어떤 글이 어떤 장소를 다루는지'
// 로 읽을 수 있게 Article + 소개 장소(mentions) + BreadcrumbList 로 낸다.
// datePublished 는 넣지 않는다 — 응답에 발행일이 없고, weekStartDate(다루는 주의 시작일)를 발행일로 쓰면 사실과 다를 수 있다.
export function toCurationJsonLd(curation: CurationDetailResponse) {
  const url = `${SITE_URL}/creators/${curation.id}`
  // 화면에서 줄바꿈되는 제목을 한 줄로 편다 (generateMetadata 와 같은 규칙)
  const headline = curation.title.replace(/\s*\n\s*/g, ' ')
  const organization = {
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
  }

  // 같은 장소가 챕터·추천에 겹쳐 나올 수 있어 이름으로 한 번만 넣는다.
  // spotId 가 있으면 스팟 상세로 잇는다 (운영 데이터는 아직 null 이 많다).
  const places = new Map<string, { '@type': 'Place'; name: string; url?: string }>()
  for (const { placeName, spotId } of [...curation.chapters, ...curation.recommendations]) {
    if (!placeName || places.has(placeName)) continue
    places.set(placeName, {
      '@type': 'Place',
      name: placeName,
      ...(spotId != null && { url: `${SITE_URL}/spot/${spotId}` }),
    })
  }

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': url,
        headline,
        ...(curation.subtitle && { description: curation.subtitle }),
        url,
        mainEntityOfPage: url,
        // 대표 이미지는 CDN(cdn.peakda.com) 영구 URL 이라 크롤러가 나중에 다시 가져가도 깨지지 않는다.
        ...(curation.heroImageUrl && { image: curation.heroImageUrl }),
        inLanguage: 'ko-KR',
        author: organization,
        publisher: organization,
        ...(places.size > 0 && { mentions: [...places.values()] }),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: SITE_NAME, item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: '탐색', item: `${SITE_URL}/explore` },
          { '@type': 'ListItem', position: 3, name: headline, item: url },
        ],
      },
    ],
  }
}
