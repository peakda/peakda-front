import { Capacitor, registerPlugin } from '@capacitor/core'
import { toast } from 'sonner'
import { takeLoginProvider, track, trackLoginStart } from '@/lib/analytics'
import { exchangeAppleIdentityToken } from '@/lib/auth/nativeAuth'
import { setAuthMarker, takeReturnTo } from '@/lib/auth/session'
import { useLoginSheetStore } from '@/stores/useLoginSheetStore'

// iOS 기본 "Apple로 계속하기" 창 (ios/App/App/NativeAppleSignInPlugin.swift).
// App Store 심사 지침 4.8 — 다른 소셜 로그인을 제공하는 iOS 앱은 Apple 로그인도 제공해야 한다.
// 웹·Android 에는 없다.
interface NativeAppleSignInPlugin {
  signIn(options: { nonce: string }): Promise<{ identityToken: string; authorizationCode: string }>
}

const NativeAppleSignIn = registerPlugin<NativeAppleSignInPlugin>('NativeAppleSignIn')

export function isAppleLoginAvailable(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios'
}

// 서버가 identity token 의 nonce 클레임과 이 원문의 SHA-256 을 비교해 재사용된 토큰을 막는다.
function createNonce(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function isCanceled(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'CANCELED'
}

// 로그인 후 처리는 소셜 로그인 앱 흐름(NativeAuthManager)과 같다. 바텀시트는 성공했을 때만 닫는다.
export async function handleAppleLogin(goToTerms: () => void): Promise<void> {
  trackLoginStart('apple')

  const nonce = createNonce()
  let credential: { identityToken: string; authorizationCode: string }
  try {
    credential = await NativeAppleSignIn.signIn({ nonce })
  } catch (error) {
    // 사용자가 애플 창을 닫은 것은 실패가 아니다.
    if (isCanceled(error)) return
    console.error('애플 로그인 창 오류', error)
    toast.error('로그인하지 못했어요. 다시 시도해 주세요.')
    return
  }

  try {
    const session = await exchangeAppleIdentityToken({ ...credential, nonce })
    useLoginSheetStore.getState().closeLoginSheet()
    if (session.accessToken) {
      setAuthMarker()
      track('login', { provider: takeLoginProvider() })
      // NativeAuthManager 와 같은 이유로 전체 로드해 로그인 전 라우터 캐시를 비운다.
      window.location.replace(takeReturnTo() ?? '/map')
    } else {
      goToTerms()
    }
  } catch (error) {
    console.error('애플 로그인 토큰 교환 실패', error)
    toast.error('로그인하지 못했어요. 다시 시도해 주세요.')
  }
}
