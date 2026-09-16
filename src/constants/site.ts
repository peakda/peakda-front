import type { Metadata } from 'next'

// 검색엔진에 알리는 대표 주소(canonical). 프리뷰 배포에서도 이 주소를 가리켜야 색인이 갈리지 않는다.
export const SITE_URL = 'https://www.peakda.com'
export const SITE_NAME = 'Peakda'
export const SITE_TITLE = 'Peakda | 계절 여행 타이밍'
export const SITE_DESCRIPTION =
  '계절 명소의 타이밍을 한눈에. 벚꽃·유채꽃·철쭉·수국·단풍·억새까지, 지금 이 순간 가장 예쁜 곳을 Peakda에서 확인하세요.'

// app/opengraph-image.tsx 가 만드는 기본 공유 카드 주소 (metadataBase 기준으로 절대 URL 이 된다).
// 페이지가 openGraph 를 직접 정의하면 이 파일 기반 이미지를 상속하지 않아 og:image 가 빠지므로 명시해서 쓴다.
export const DEFAULT_OG_IMAGE = '/opengraph-image'

// 페이지가 openGraph 를 정의하면 layout 의 openGraph 를 통째로 덮어쓰므로(얕은 병합) 공통값을 펼쳐 쓴다.
export const BASE_OPEN_GRAPH = {
  siteName: SITE_NAME,
  locale: 'ko_KR',
  type: 'website',
} satisfies Metadata['openGraph']
