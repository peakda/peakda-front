import { Capacitor, registerPlugin } from '@capacitor/core'
import type { AppTokenResponse } from '@/api/facades/generated/peakdaApi.schemas'

interface NativeSecureStorePlugin {
  get(options: { key: string }): Promise<{ value?: string }>
  set(options: { key: string; value: string }): Promise<void>
  remove(options: { key: string }): Promise<void>
}

const NativeSecureStore = registerPlugin<NativeSecureStorePlugin>('NativeSecureStore')
const STORAGE_KEY = 'peakda.native-auth.v1'

export interface NativeAuthSession {
  tokenType?: string
  accessToken?: string
  refreshToken?: string
  accessTokenExpiresIn?: number
  refreshTokenExpiresIn?: number
  signupToken?: string
  signupTokenExpiresIn?: number
}

export function isNativeAndroid(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android'
}

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? ''
}

async function readSession(): Promise<NativeAuthSession | null> {
  if (!isNativeAndroid()) return null

  const { value } = await NativeSecureStore.get({ key: STORAGE_KEY })
  if (!value) return null

  try {
    return JSON.parse(value) as NativeAuthSession
  } catch {
    await NativeSecureStore.remove({ key: STORAGE_KEY })
    return null
  }
}

async function writeSession(session: NativeAuthSession): Promise<void> {
  await NativeSecureStore.set({ key: STORAGE_KEY, value: JSON.stringify(session) })
}

export async function getNativeAuthSession(): Promise<NativeAuthSession | null> {
  return readSession()
}

export async function clearNativeAuthSession(): Promise<void> {
  if (!isNativeAndroid()) return
  await NativeSecureStore.remove({ key: STORAGE_KEY })
}

export async function applyAppTokenResponse(response: AppTokenResponse): Promise<NativeAuthSession> {
  if (response.status === 'AUTHENTICATED') {
    if (!response.accessToken || !response.refreshToken) {
      throw new Error('Authenticated app token response is missing access or refresh token.')
    }

    const session: NativeAuthSession = {
      tokenType: response.tokenType ?? 'Bearer',
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      accessTokenExpiresIn: response.accessTokenExpiresIn ?? undefined,
      refreshTokenExpiresIn: response.refreshTokenExpiresIn ?? undefined,
    }
    await writeSession(session)
    return session
  }

  if (!response.signupToken) {
    throw new Error('Signup-required app token response is missing a signup token.')
  }

  const session: NativeAuthSession = {
    tokenType: response.tokenType ?? 'Bearer',
    signupToken: response.signupToken,
    signupTokenExpiresIn: response.signupTokenExpiresIn ?? undefined,
  }
  await writeSession(session)
  return session
}

async function requestAppToken(path: string, payload: Record<string, string>): Promise<AppTokenResponse> {
  const response = await fetch(`${getBaseUrl()}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const body = (await response.json()) as { data?: AppTokenResponse; message?: string }
  if (!response.ok || !body.data) {
    throw new Error(body.message ?? '앱 인증 토큰 요청에 실패했습니다.')
  }
  return body.data
}

export async function exchangeNativeAuthorizationCode(code: string): Promise<NativeAuthSession> {
  const token = await requestAppToken('/api/auth/app/token', { code })
  return applyAppTokenResponse(token)
}

let refreshPromise: Promise<NativeAuthSession> | null = null

export async function refreshNativeAuthSession(): Promise<NativeAuthSession> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const session = await readSession()
      if (!session?.refreshToken) throw new Error('No native refresh token is available.')

      const token = await requestAppToken('/api/auth/app/token/refresh', {
        refreshToken: session.refreshToken,
      })
      if (token.status !== 'AUTHENTICATED') throw new Error('Refresh did not return an authenticated session.')
      return applyAppTokenResponse(token)
    })().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

export async function getNativeAuthorizationHeader(url: string): Promise<string | null> {
  const session = await readSession()
  if (!session) return null

  // 가입 중에는 signup API에만 가입 세션 토큰을 보낸다.
  const token = url.startsWith('/api/auth/signup/') ? session.signupToken : session.accessToken
  if (!token) return null
  return `${session.tokenType ?? 'Bearer'} ${token}`
}
