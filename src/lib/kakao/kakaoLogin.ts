export const handleKakaoLogin = () => {
  // same-origin 프록시(/oauth2)를 경유해 백엔드 OAuth 로 진입한다.
  window.location.href = '/oauth2/authorization/kakao'
}
