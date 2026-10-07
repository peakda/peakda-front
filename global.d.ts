// import/export 가 없는 스크립트 파일이라 최상위 interface 가 전역 Window 에 합쳐진다.
// (여기서 declare global 로 감싸면 'global' 이라는 별도 네임스페이스가 돼 아무 효과가 없다)
// window.kakao 는 src/types/kakao.d.ts 가 선언한다.
interface Window {
  // GA4 초기화 스크립트(layout 의 ga-init)가 운영 배포에서만 정의한다
  gtag?: (...args: unknown[]) => void
}
