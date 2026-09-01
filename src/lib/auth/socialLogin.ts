import { Browser } from '@capacitor/browser'
import { isNativeAndroid } from '@/lib/auth/nativeAuth'

// 웹은 백엔드가 HttpOnly 쿠키를 심는 기존 OAuth 흐름을 유지한다. Android는 Custom Tab을
// 열고, 백엔드가 peakda://auth/callback?code=... 로 복귀시키는 앱 전용 흐름을 사용한다.
export type SocialLoginProvider = 'google' | 'kakao' | 'naver'

async function redirectToSocialLogin(provider: SocialLoginProvider): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
  if (isNativeAndroid()) {
    await Browser.open({ url: `${baseUrl}/oauth2/authorization/${provider}?client=app` })
    return
  }
  window.location.href = `${baseUrl}/oauth2/authorization/${provider}`
}

export const handleKakaoLogin = () => redirectToSocialLogin('kakao')
export const handleNaverLogin = () => redirectToSocialLogin('naver')
export const handleGoogleLogin = () => redirectToSocialLogin('google')
