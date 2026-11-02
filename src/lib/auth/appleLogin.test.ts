import { beforeEach, describe, expect, it, vi } from 'vitest'

const native = vi.hoisted(() => ({
  isNative: true,
  platform: 'ios',
  signIn: vi.fn(),
}))
const mocks = vi.hoisted(() => ({
  exchange: vi.fn(),
  setAuthMarker: vi.fn(),
  closeLoginSheet: vi.fn(),
  toastError: vi.fn(),
  track: vi.fn(),
  trackLoginStart: vi.fn(),
}))

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: () => native.isNative,
    getPlatform: () => native.platform,
  },
  registerPlugin: () => ({ signIn: native.signIn }),
}))
vi.mock('@/lib/auth/nativeAuth', () => ({ exchangeAppleIdentityToken: mocks.exchange }))
vi.mock('@/lib/auth/session', () => ({ setAuthMarker: mocks.setAuthMarker, takeReturnTo: () => null }))
vi.mock('@/lib/analytics', () => ({
  track: mocks.track,
  trackLoginStart: mocks.trackLoginStart,
  takeLoginProvider: () => 'apple',
}))
vi.mock('@/stores/useLoginSheetStore', () => ({
  useLoginSheetStore: { getState: () => ({ closeLoginSheet: mocks.closeLoginSheet }) },
}))
vi.mock('sonner', () => ({ toast: { error: mocks.toastError } }))

import { handleAppleLogin, isAppleLoginAvailable } from '@/lib/auth/appleLogin'

const CREDENTIAL = { identityToken: 'identity-token', authorizationCode: 'authorization-code' }

describe('isAppleLoginAvailable', () => {
  it.each([
    { isNative: true, platform: 'ios', expected: true },
    { isNative: true, platform: 'android', expected: false },
    { isNative: false, platform: 'web', expected: false },
  ])('$platform 네이티브=$isNative 이면 $expected', ({ isNative, platform, expected }) => {
    native.isNative = isNative
    native.platform = platform
    expect(isAppleLoginAvailable()).toBe(expected)
  })
})

describe('handleAppleLogin', () => {
  const goToTerms = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    native.signIn.mockResolvedValue(CREDENTIAL)
    Object.defineProperty(window, 'location', {
      value: { ...window.location, replace: vi.fn() },
      writable: true,
    })
  })

  it('애플 창에 넘긴 nonce 원문을 토큰과 함께 서버로 보내고, 가입한 회원이면 로그인 상태로 이동한다', async () => {
    mocks.exchange.mockResolvedValue({ accessToken: 'access', refreshToken: 'refresh' })

    await handleAppleLogin(goToTerms)

    const { nonce } = native.signIn.mock.calls[0][0] as { nonce: string }
    expect(nonce).toMatch(/^[0-9a-f]{64}$/)
    expect(mocks.exchange).toHaveBeenCalledWith({ ...CREDENTIAL, nonce })
    expect(mocks.trackLoginStart).toHaveBeenCalledWith('apple')
    expect(mocks.setAuthMarker).toHaveBeenCalled()
    expect(mocks.track).toHaveBeenCalledWith('login', { provider: 'apple' })
    expect(mocks.closeLoginSheet).toHaveBeenCalled()
    expect(window.location.replace).toHaveBeenCalledWith('/map')
    expect(goToTerms).not.toHaveBeenCalled()
  })

  it('로그인할 때마다 새 nonce 를 만든다', async () => {
    mocks.exchange.mockResolvedValue({ accessToken: 'access' })

    await handleAppleLogin(goToTerms)
    await handleAppleLogin(goToTerms)

    const [first, second] = native.signIn.mock.calls.map(([options]) => (options as { nonce: string }).nonce)
    expect(first).not.toBe(second)
  })

  it('처음 로그인한 사용자는 약관 동의로 보낸다', async () => {
    mocks.exchange.mockResolvedValue({ signupToken: 'signup' })

    await handleAppleLogin(goToTerms)

    expect(goToTerms).toHaveBeenCalled()
    expect(mocks.setAuthMarker).not.toHaveBeenCalled()
    expect(window.location.replace).not.toHaveBeenCalled()
  })

  it('사용자가 애플 창을 닫으면 오류를 알리지 않고 서버도 부르지 않는다', async () => {
    native.signIn.mockRejectedValue({ code: 'CANCELED', message: 'canceled' })

    await handleAppleLogin(goToTerms)

    expect(mocks.exchange).not.toHaveBeenCalled()
    expect(mocks.toastError).not.toHaveBeenCalled()
  })

  it('애플 창이 실패하면 다시 시도하라고 알린다', async () => {
    native.signIn.mockRejectedValue({ code: 'FAILED', message: 'failed' })
    vi.spyOn(console, 'error').mockImplementation(() => {})

    await handleAppleLogin(goToTerms)

    expect(mocks.exchange).not.toHaveBeenCalled()
    expect(mocks.toastError).toHaveBeenCalledTimes(1)
  })

  it('서버 검증이 실패하면 알리고 로그인 시트를 그대로 둔다', async () => {
    mocks.exchange.mockRejectedValue(new Error('애플 로그인 정보가 유효하지 않습니다.'))
    vi.spyOn(console, 'error').mockImplementation(() => {})

    await handleAppleLogin(goToTerms)

    expect(mocks.toastError).toHaveBeenCalledTimes(1)
    expect(mocks.closeLoginSheet).not.toHaveBeenCalled()
    expect(mocks.setAuthMarker).not.toHaveBeenCalled()
  })
})
