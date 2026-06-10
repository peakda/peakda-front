// 동시 401 요청이 refresh 를 중복 호출하지 않도록 진행 중인 refresh 를 공유한다.
let refreshPromise: Promise<void> | null = null

async function runRefresh(): Promise<void> {
  if (!refreshPromise) {
    // 생성 코드(facades)에 의존하면 orval 부트스트랩이 깨지므로 refresh 엔드포인트를 직접 호출한다.
    const baseUrl = process.env.NEXT_PUBLIC_API_URL
    refreshPromise = fetch(`${baseUrl}/api/auth/refresh`, {
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
  const baseUrl = process.env.NEXT_PUBLIC_API_URL
  const request = () => fetch(`${baseUrl}${url}`, { credentials: 'include', ...options })

  let res = await request()

  // 액세스 토큰 만료(401) → refresh 1회 후 원요청 재시도. refresh 엔드포인트 자체는 제외(무한 루프 방지).
  if (res.status === 401 && !url.includes('/api/auth/refresh')) {
    try {
      await runRefresh()
      res = await request()
    } catch {
      if (typeof window !== 'undefined') window.location.href = '/login'
      throw { response: { status: 401, data: null } }
    }
  }

  if (!res.ok) {
    throw { response: { status: res.status, data: await res.json() } }
  }

  const data = await res.json()
  return { data, status: res.status, headers: res.headers } as T
}
