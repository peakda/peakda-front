import { beforeEach, describe, expect, it, vi } from 'vitest'

const store = vi.hoisted(() => ({ value: undefined as string | undefined }))

vi.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: () => true, getPlatform: () => 'ios' },
  registerPlugin: () => ({
    get: async () => ({ value: store.value }),
    set: async () => {},
    remove: async () => {},
  }),
}))

import { getNativeAuthorizationHeader } from '@/lib/auth/nativeAuth'

const SIGNUP_SESSION = { tokenType: 'Bearer', signupToken: 'signup' }
const LOGGED_IN_SESSION = { tokenType: 'Bearer', accessToken: 'access', refreshToken: 'refresh' }

describe('getNativeAuthorizationHeader', () => {
  beforeEach(() => {
    store.value = undefined
  })

  it.each([
    [
      '가입 중 닉네임 중복확인',
      SIGNUP_SESSION,
      '/api/auth/signup/nickname/check?value=peakda',
      'Bearer signup',
    ],
    ['가입 중 가입 완료', SIGNUP_SESSION, '/api/auth/signup/complete', 'Bearer signup'],
    ['가입 중 일반 API', SIGNUP_SESSION, '/api/auth/me', null],
    // 프로필 수정 화면도 같은 중복확인 API 를 쓴다
    [
      '로그인 후 닉네임 중복확인',
      LOGGED_IN_SESSION,
      '/api/auth/signup/nickname/check?value=peakda',
      'Bearer access',
    ],
    ['로그인 후 가입 완료', LOGGED_IN_SESSION, '/api/auth/signup/complete', null],
    ['로그인 후 일반 API', LOGGED_IN_SESSION, '/api/auth/me', 'Bearer access'],
  ])('%s', async (_, session, url, expected) => {
    store.value = JSON.stringify(session)

    expect(await getNativeAuthorizationHeader(url)).toBe(expected)
  })

  it('저장된 세션이 없으면 헤더를 붙이지 않는다', async () => {
    expect(await getNativeAuthorizationHeader('/api/auth/me')).toBeNull()
  })
})
