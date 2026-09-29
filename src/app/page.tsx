import type { Metadata } from 'next'
import { SplashScreen } from '@/app/_components/SplashScreen'
import {
  BASE_OPEN_GRAPH,
  DEFAULT_OG_IMAGE,
  SITE_BRAND_NAME,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_NAME_KO,
  SITE_TITLE,
  SITE_URL,
} from '@/constants/site'
import { toJsonLdScript } from '@/lib/utils/spotSeo'

export const metadata: Metadata = {
  // 레이아웃 템플릿을 타면 브랜드가 두 번 붙으므로 홈 제목은 완성형으로 쓴다.
  title: { absolute: SITE_TITLE },
  description: SITE_DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: {
    ...BASE_OPEN_GRAPH,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    images: [{ url: DEFAULT_OG_IMAGE, alt: `${SITE_BRAND_NAME} — 계절 명소 개화·절정 타이밍` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
}

// 검색엔진에 사이트 이름·로고를 알린다. 스플래시에 보이는 로고·이름과 같은 값만 담는다.
const HOME_JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      alternateName: SITE_NAME_KO,
      url: SITE_URL,
      logo: `${SITE_URL}/images/logo.png`,
      // 공식 SNS 계정. 검색엔진이 사이트와 같은 주체로 묶는다.
      sameAs: ['https://www.instagram.com/peakda.official/', 'https://www.youtube.com/@peakda'],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: SITE_NAME,
      alternateName: SITE_NAME_KO,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      inLanguage: 'ko-KR',
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
  ],
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLdScript(HOME_JSON_LD) }}
      />
      <SplashScreen />
    </>
  )
}
