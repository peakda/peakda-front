import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { customInstance } from '@/api/mutator'
import { ApiError } from '@/lib/utils/apiError'
import { AUTH_MARKER, RETURN_TO } from '@/lib/auth/session'
import { useLoginSheetStore } from '@/stores/useLoginSheetStore'
import * as nativeAuth from '@/lib/auth/nativeAuth'

vi.mock('@/lib/auth/nativeAuth', () => ({
  isNativeAndroid: vi.fn(() => false),
  getNativeAuthorizationHeader: vi.fn(async () => null),
  refreshNativeAuthSession: vi.fn(async () => ({})),
  clearNativeAuthSession: vi.fn(async () => undefined),
}))

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

const fetchMock = vi.fn<typeof fetch>()

const setMarker = () => {
  document.cookie = `${AUTH_MARKER}=1; path=/`
}
const clearCookies = () => {
  document.cookie = `${AUTH_MARKER}=; path=/; max-age=0`
  document.cookie = `${RETURN_TO}=; path=/; max-age=0`
}
const calledUrls = () => fetchMock.mock.calls.map(([url]) => String(url))

// 실패 경로는 reject 값을 그대로 검사해야 해서 에러를 꺼낸다.
async function catchError(promise: Promise<unknown>): Promise<unknown> {
  try {
    await promise
  } catch (error) {
    return error
  }
  throw new Error('reject 되지 않았다')
}

describe('customInstance', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
    vi.mocked(nativeAuth.isNativeAndroid).mockReturnValue(false)
    useLoginSheetStore.setState({ isOpen: false })
    clearCookies()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    clearCookies()
  })

  it('성공 응답은 { data, status, headers } 로 감싸고 쿠키를 함께 보낸다', async () => {
    fetchMock.mockResolvedValueOnce(json({ data: { id: 1 } }))

    const res = await customInstance<{ data: unknown; status: number }>('/api/spots/1')

    expect(res.data).toEqual({ data: { id: 1 } })
    expect(res.status).toBe(200)
    expect(fetchMock.mock.calls[0][1]?.credentials).toBe('include')
  })

  it('204 처럼 본문이 비어 있으면 data 는 null', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }))

    const res = await customInstance<{ data: unknown; status: number }>('/api/likes/1')

    expect(res).toMatchObject({ data: null, status: 204 })
  })

  it('JSON 에러 응답은 본문을 담은 ApiError 로 던진다', async () => {
    fetchMock.mockResolvedValueOnce(json({ code: 'NOT_FOUND', message: '없음' }, 404))

    const error = await catchError(customInstance('/api/spots/999'))

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toBeInstanceOf(Error)
    expect((error as ApiError).response).toEqual({
      status: 404,
      data: { code: 'NOT_FOUND', message: '없음' },
    })
  })

  it('JSON 이 아닌 에러 응답(게이트웨이 502 HTML)도 status 는 살린다', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response('<html>Bad Gateway</html>', {
        status: 502,
        headers: { 'content-type': 'text/html' },
      })
    )

    const error = await catchError(customInstance('/api/spots'))

    expect((error as ApiError).response).toEqual({ status: 502, data: null })
  })

  it('비로그인 401 은 refresh 없이 던지고 로그인 시트를 열지 않는다', async () => {
    fetchMock.mockResolvedValueOnce(json({}, 401))

    const error = await catchError(customInstance('/api/users/me'))

    expect((error as ApiError).response.status).toBe(401)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(useLoginSheetStore.getState().isOpen).toBe(false)
  })

  it('로그인 상태 401 은 refresh 후 원래 요청을 한 번 재시도한다', async () => {
    setMarker()
    fetchMock
      .mockResolvedValueOnce(json({}, 401))
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
      .mockResolvedValueOnce(json({ data: 'ok' }))

    const res = await customInstance<{ data: unknown }>('/api/users/me')

    expect(res.data).toEqual({ data: 'ok' })
    expect(calledUrls()).toEqual(['/api/users/me', '/api/auth/refresh', '/api/users/me'])
  })

  it('동시에 난 401 들은 refresh 를 한 번만 호출한다', async () => {
    setMarker()
    let resolveRefresh: (res: Response) => void = () => {}
    const refresh = new Promise<Response>((resolve) => {
      resolveRefresh = resolve
    })
    fetchMock.mockImplementation(async (input) => {
      const url = String(input)
      if (url === '/api/auth/refresh') return refresh
      // 첫 호출(401) 이후 재시도는 성공
      const firstTry = fetchMock.mock.calls.filter(([u]) => String(u) === url).length === 1
      return firstTry ? json({}, 401) : json({ data: url })
    })

    const pending = Promise.all([customInstance('/api/a'), customInstance('/api/b')])
    // 두 요청이 모두 401 을 받고 refresh 를 기다리는 상태가 될 때까지 넘긴다
    await vi.waitFor(() => expect(calledUrls()).toContain('/api/auth/refresh'))
    await new Promise((resolve) => setTimeout(resolve, 0))
    resolveRefresh(new Response(null, { status: 200 }))
    await pending

    expect(calledUrls().filter((url) => url === '/api/auth/refresh')).toHaveLength(1)
  })

  it('refresh 가 실패하면 마커를 지우고 돌아올 위치를 남긴 뒤 로그인 시트를 연다', async () => {
    setMarker()
    window.history.replaceState(null, '', '/my/saved?tab=spot')
    fetchMock.mockResolvedValueOnce(json({}, 401)).mockResolvedValueOnce(json({}, 401))

    const error = await catchError(customInstance('/api/users/me'))

    expect((error as ApiError).response.status).toBe(401)
    expect(document.cookie).not.toContain(`${AUTH_MARKER}=1`)
    expect(document.cookie).toContain(`${RETURN_TO}=${encodeURIComponent('/my/saved?tab=spot')}`)
    expect(useLoginSheetStore.getState().isOpen).toBe(true)
  })

  it('refresh 엔드포인트 자체의 401 은 다시 refresh 하지 않는다', async () => {
    setMarker()
    fetchMock.mockResolvedValueOnce(json({}, 401))

    const error = await catchError(customInstance('/api/auth/refresh', { method: 'POST' }))

    expect((error as ApiError).response.status).toBe(401)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  describe('네이티브(Android)', () => {
    beforeEach(() => {
      vi.mocked(nativeAuth.isNativeAndroid).mockReturnValue(true)
      vi.mocked(nativeAuth.getNativeAuthorizationHeader).mockResolvedValue('Bearer app-token')
      vi.mocked(nativeAuth.refreshNativeAuthSession).mockReset()
      vi.mocked(nativeAuth.clearNativeAuthSession).mockReset()
    })

    it('쿠키 대신 Authorization 헤더로 보낸다', async () => {
      fetchMock.mockResolvedValueOnce(json({ data: 1 }))

      await customInstance('/api/users/me')

      const init = fetchMock.mock.calls[0][1]
      expect(init?.credentials).toBe('omit')
      expect(new Headers(init?.headers).get('Authorization')).toBe('Bearer app-token')
    })

    it('401 이면 앱 토큰을 갱신해 재시도한다 (마커 없어도)', async () => {
      vi.mocked(nativeAuth.refreshNativeAuthSession).mockResolvedValue(
        {} as Awaited<ReturnType<typeof nativeAuth.refreshNativeAuthSession>>
      )
      fetchMock.mockResolvedValueOnce(json({}, 401)).mockResolvedValueOnce(json({ data: 'ok' }))

      const res = await customInstance<{ data: unknown }>('/api/users/me')

      expect(res.data).toEqual({ data: 'ok' })
      expect(nativeAuth.refreshNativeAuthSession).toHaveBeenCalledTimes(1)
    })

    it('앱 토큰 갱신이 실패하면 세션을 지우고 401 을 던진다', async () => {
      vi.mocked(nativeAuth.refreshNativeAuthSession).mockRejectedValue(new Error('expired'))
      fetchMock.mockResolvedValueOnce(json({}, 401))

      const error = await catchError(customInstance('/api/users/me'))

      expect((error as ApiError).response.status).toBe(401)
      expect(nativeAuth.clearNativeAuthSession).toHaveBeenCalledTimes(1)
    })
  })
})
