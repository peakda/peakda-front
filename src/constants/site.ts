import type { Metadata } from 'next'

// 검색엔진에 알리는 대표 주소(canonical). 프리뷰 배포에서도 이 주소를 가리켜야 색인이 갈리지 않는다.
export const SITE_URL = 'https://www.peakda.com'
// 랜딩 페이지 대표 주소. 같은 Vercel 프로젝트에 붙인 서브도메인으로, middleware 가 루트를 /landing 으로 rewrite 한다.
export const LANDING_URL = 'https://landing.peakda.com'
export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.peakda.app'
export const SITE_NAME = 'Peakda'
export const SITE_NAME_KO = '피크다'
export const SITE_BRAND_NAME = `${SITE_NAME_KO} ${SITE_NAME}`
export const SITE_TITLE = `명소 지도·개화 지도 | ${SITE_BRAND_NAME}`
export const SITE_DESCRIPTION =
  '피크다(Peakda)에서 전국 계절 명소 지도와 개화 지도를 확인하세요. 벚꽃·수국의 개화 추정 정보부터 단풍·억새의 절정 시기까지, 명소 위치와 방문 기록으로 여행을 준비하세요.'
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
