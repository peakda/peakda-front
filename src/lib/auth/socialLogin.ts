import { Browser } from '@capacitor/browser'
import { isNativeAndroid } from '@/lib/auth/nativeAuth'
import { trackLoginStart } from '@/lib/analytics'

// 웹은 백엔드가 HttpOnly 쿠키를 심는 기존 OAuth 흐름을 유지한다. Android는 Custom Tab을
// 열고, 백엔드가 peakda://auth/callback?code=... 로 복귀시키는 앱 전용 흐름을 사용한다.
export type SocialLoginProvider = 'google' | 'kakao' | 'naver'

async function redirectToSocialLogin(provider: SocialLoginProvider): Promise<void> {
  // 외부 로그인 화면에서 돌아오지 않는 비율을 보려고 떠나기 전에 보낸다.
  trackLoginStart(provider)
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
  if (isNativeAndroid()) {
    await Browser.open({ url: `${baseUrl}/oauth2/authorization/${provider}?client=app` })
    return
  }
  // replace: 로그인을 누른 페이지 자리를 OAuth 흐름이 이어받게 한다. href 로 쌓으면 로그인 후
  // 뒤로가기가 카카오·구글 화면으로 가고, 그 화면이 다시 우리 서비스로 튕겨 보내 뒤로가기가 막힌다.
  // 사용자가 제공자 화면에서 직접 로그인하며 생기는 기록은 제공자 쪽이라 여기서 막을 수 없다.
  window.location.replace(`${baseUrl}/oauth2/authorization/${provider}`)
}

export const handleKakaoLogin = () => redirectToSocialLogin('kakao')
export const handleNaverLogin = () => redirectToSocialLogin('naver')
export const handleGoogleLogin = () => redirectToSocialLogin('google')
