import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/constants/site'
import { PROTECTED_PATHS } from '@/lib/auth/session'

// 로그인이 필요한 화면은 비로그인 크롤러에게 어차피 /map 리다이렉트라 수집할 게 없다.
// 로그인·온보딩·검색처럼 200 으로 열리는 앱 전용 화면은 막지 않고 X-Robots-Tag noindex 로 처리한다
// (robots 로 막으면 noindex 를 읽지 못해 URL 만 색인될 수 있다 — next.config.ts headers 참고).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: [...PROTECTED_PATHS, '/auth/'] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
