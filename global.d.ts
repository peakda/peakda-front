declare global {
  interface Window {
    kakao: typeof kakao
    // GA4 태그(layout 의 GoogleAnalytics)가 운영 배포에서만 정의한다
    gtag?: (...args: unknown[]) => void
  }
}
