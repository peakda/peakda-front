import type { Metadata } from 'next'
import { SplashScreen } from '@/app/_components/SplashScreen'
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from '@/constants/site'
import { toJsonLdScript } from '@/lib/utils/spotSeo'

export const metadata: Metadata = {
  // 레이아웃 템플릿('Peakda | %s')을 타면 'Peakda | Peakda | …' 가 되므로 그대로 쓴다.
  title: { absolute: SITE_TITLE },
  description: SITE_DESCRIPTION,
  alternates: { canonical: '/' },
}

// 검색엔진에 사이트 이름·로고를 알린다. 스플래시에 보이는 로고·이름과 같은 값만 담는다.
const HOME_JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/images/logo.png`,
      // 공식 SNS 계정. 검색엔진이 사이트와 같은 주체로 묶는다.
      sameAs: ['https://www.instagram.com/peakda.official/'],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: SITE_NAME,
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
