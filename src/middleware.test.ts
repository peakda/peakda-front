// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'
import { middleware } from '@/middleware'
import { AUTH_MARKER, RETURN_TO } from '@/lib/auth/session'

const request = (path: string, loggedIn = false) => {
  const req = new NextRequest(new URL(path, 'https://www.peakda.com'))
  if (loggedIn) req.cookies.set(AUTH_MARKER, '1')
  return req
}

const location = (res: Response) => res.headers.get('location')

describe('middleware', () => {
  it('비로그인은 공개 화면을 그대로 통과한다', () => {
    for (const path of ['/', '/map', '/spot/1', '/my', '/search']) {
      expect(location(middleware(request(path)))).toBeNull()
    }
  })

  it('비로그인이 보호 경로로 오면 지도 + 로그인 시트로 보내고 돌아올 위치를 남긴다', () => {
    const res = middleware(request('/my/saved?tab=spot'))

    expect(location(res)).toBe('https://www.peakda.com/map?login=1')
    expect(res.cookies.get(RETURN_TO)?.value).toBe('/my/saved?tab=spot')
  })

  it('보호 경로의 하위 경로도 막지만, 이름만 비슷한 경로는 막지 않는다', () => {
    expect(location(middleware(request('/record/12/edit')))).toContain('/map?login=1')
    expect(location(middleware(request('/recordings')))).toBeNull()
  })

  it('로그인 상태로 진입 화면에 오면 지도로 보낸다', () => {
    for (const path of ['/', '/onboarding', '/login']) {
      expect(location(middleware(request(path, true)))).toBe('https://www.peakda.com/map')
    }
  })

  it('탐색 전체 목록은 로그인 여부와 무관하게 섹션 경로로 rewrite 하고, 모르는 섹션은 PEAK_NOW 로 보낸다', () => {
    const rewrite = (res: Response) => res.headers.get('x-middleware-rewrite')

    expect(rewrite(middleware(request('/explore/spots')))).toBe(
      'https://www.peakda.com/explore/spots/PEAK_NOW'
    )
    expect(rewrite(middleware(request('/explore/spots?section=NEXT_WEEK', true)))).toBe(
      'https://www.peakda.com/explore/spots/NEXT_WEEK'
    )
    expect(rewrite(middleware(request('/explore/spots?section=unknown')))).toBe(
      'https://www.peakda.com/explore/spots/PEAK_NOW'
    )
    expect(rewrite(middleware(request('/explore')))).toBeNull()
  })

  it('로그인 상태는 보호 경로와 로그인 콜백을 그대로 통과한다', () => {
    expect(location(middleware(request('/my/saved', true)))).toBeNull()
    expect(location(middleware(request('/auth/callback', true)))).toBeNull()
  })
})
