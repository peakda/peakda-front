import type { Metadata } from 'next'

// 검색엔진에 알리는 대표 주소(canonical). 프리뷰 배포에서도 이 주소를 가리켜야 색인이 갈리지 않는다.
export const SITE_URL = 'https://www.peakda.com'
export const SITE_NAME = 'Peakda'
export const SITE_NAME_KO = '피크다'
export const SITE_BRAND_NAME = `${SITE_NAME_KO} ${SITE_NAME}`
export const SITE_TITLE = `${SITE_BRAND_NAME} | 계절 명소 개화·절정 타이밍`
export const SITE_DESCRIPTION =
  '피크다(Peakda)는 벚꽃·유채꽃·철쭉·수국·단풍·억새 등 계절 명소의 개화와 절정 타이밍을 알려드려요. 지금 가장 예쁜 여행지를 한눈에 확인하세요.'
export const SITE_KEYWORDS = [
  SITE_NAME_KO,
  SITE_NAME,
  '계절 여행',
  '계절 명소',
  '벚꽃 명소',
  '단풍 명소',
  '꽃구경',
  '개화 시기',
  '만개 시기',
  '개화 지도',
]

// app/opengraph-image.tsx 가 만드는 기본 공유 카드 주소 (metadataBase 기준으로 절대 URL 이 된다).
// 페이지가 openGraph 를 직접 정의하면 이 파일 기반 이미지를 상속하지 않아 og:image 가 빠지므로 명시해서 쓴다.
export const DEFAULT_OG_IMAGE = '/opengraph-image'

// 페이지가 openGraph 를 정의하면 layout 의 openGraph 를 통째로 덮어쓰므로(얕은 병합) 공통값을 펼쳐 쓴다.
export const BASE_OPEN_GRAPH = {
  siteName: SITE_BRAND_NAME,
  locale: 'ko_KR',
  type: 'website',
} satisfies Metadata['openGraph']
