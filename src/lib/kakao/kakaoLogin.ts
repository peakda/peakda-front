export const handleKakaoLogin = () => {
  // 프론트(Vercel)·백엔드(Railway) 도메인이 달라, 프록시 경유 시 OAuth 세션 쿠키가 끊긴다.
  // 인가 시작~콜백을 모두 백엔드 도메인에서 처리하도록 백엔드 OAuth 로 직접 진입한다.
  window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/oauth2/authorization/kakao`
}
