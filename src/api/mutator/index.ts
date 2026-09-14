import { clearAuthMarker, hasAuthMarker, setReturnTo } from '@/lib/auth/session'
import { useLoginSheetStore } from '@/stores/useLoginSheetStore'
import {
  clearNativeAuthSession,
  getNativeAuthorizationHeader,
  isNativeAndroid,
  refreshNativeAuthSession,
} from '@/lib/auth/nativeAuth'

// 프론트(Vercel)·백엔드(AWS) 도메인이 달라, 브라우저/서버 모두 백엔드를 직접 호출하고
// 크로스사이트 쿠키(SameSite=None; Secure)를 credentials: 'include' 로 주고받는다.
const getBaseUrl = () => process.env.NEXT_PUBLIC_API_URL ?? ''

// 동시 401 요청이 refresh 를 중복 호출하지 않도록 진행 중인 refresh 를 공유한다.
let refreshPromise: Promise<void> | null = null

async function runRefresh(): Promise<void> {
  if (!refreshPromise) {
    // 생성 코드(facades)에 의존하면 orval 부트스트랩이 깨지므로 refresh 엔드포인트를 직접 호출한다.
    refreshPromise = fetch(`${getBaseUrl()}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) throw new Error('refresh failed')
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

export const customInstance = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const native = isNativeAndroid()
  const request = async () => {
    const authorization = native ? await getNativeAuthorizationHeader(url) : null
    const headers = new Headers(options?.headers)
    if (authorization) headers.set('Authorization', authorization)

    return fetch(`${getBaseUrl()}${url}`, {
      ...options,
      credentials: native ? 'omit' : 'include',
      headers,
    })
  }

  let res = await request()

  // 네이티브는 앱 refresh 토큰, 웹은 HttpOnly 쿠키 refresh 토큰을 각각 한 번만 시도한다.
  const refreshUrl = native ? '/api/auth/app/token/refresh' : '/api/auth/refresh'
  if (res.status === 401 && !url.includes(refreshUrl)) {
    // 비로그인 둘러보기 중인 웹 사용자는 갱신할 쿠키가 없다. refresh 없이 401 만 던지고
    // 로그인 화면으로 보내지 않는다 — 공개 화면에서 튕기면 안 된다. (서버 렌더링도 여기로 온다)
    if (!native && !hasAuthMarker()) throw { response: { status: 401, data: null } }

    try {
      if (native) await refreshNativeAuthSession()
      else await runRefresh()
      res = await request()
    } catch {
      if (native) await clearNativeAuthSession()
      // 로그인했던 사용자의 세션이 끊긴 경우에만 알린다. 네이티브 비로그인은 여기서 마커가 없다.
      if (typeof window !== 'undefined' && hasAuthMarker()) {
        // 인증이 확정적으로 끊긴 상태 — 마커를 지워 비로그인으로 되돌리고, 로그인 페이지로 보내는 대신
        // 지금 화면 위에 로그인 바텀시트를 연다. 로그인 후 돌아올 위치를 남긴다.
        clearAuthMarker()
        setReturnTo(`${window.location.pathname}${window.location.search}`)
        useLoginSheetStore.getState().openLoginSheet()
      }
      throw { response: { status: 401, data: null } }
    }
  }

  if (!res.ok) {
    throw { response: { status: res.status, data: await res.json() } }
  }

  const data = await res.json()
  return { data, status: res.status, headers: res.headers } as T
}
