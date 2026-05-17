export const handleKakaoLogin = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL
  window.location.href = `${baseUrl}/oauth2/authorization/kakao`
}
