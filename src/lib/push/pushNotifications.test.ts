import { beforeEach, describe, expect, it, vi } from 'vitest'
import { APP_SETTINGS_CHANGED_EVENT, APP_SETTINGS_KEY, loadAppSettings } from '@/lib/utils/appSettings'
import {
  enablePushForBloomAlert,
  requestAndStartPushNotifications,
  stopPushNotifications,
} from './pushNotifications'

const native = vi.hoisted(() => ({
  platform: 'android' as 'android' | 'ios' | 'web',
  permission: 'prompt' as string,
  afterRequest: 'granted' as string,
  listeners: new Map<string, (event: { value: string }) => unknown>(),
}))

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: () => native.platform !== 'web',
    getPlatform: () => native.platform,
  },
}))
vi.mock('@capacitor/push-notifications', () => ({
  PushNotifications: {
    checkPermissions: vi.fn(() => Promise.resolve({ receive: native.permission })),
    requestPermissions: vi.fn(() => Promise.resolve({ receive: native.afterRequest })),
    addListener: vi.fn((event: string, listener: (event: { value: string }) => unknown) => {
      native.listeners.set(event, listener)
      return Promise.resolve({ remove: () => Promise.resolve() })
    }),
    createChannel: vi.fn(() => Promise.resolve()),
    register: vi.fn(() => Promise.resolve()),
    unregister: vi.fn(() => Promise.resolve()),
  },
}))
vi.mock('@/api/facades/device', () => ({ registerDeviceApi: vi.fn(), unregisterDeviceApi: vi.fn() }))
vi.mock('@/lib/analytics', () => ({ track: vi.fn() }))
vi.mock('sonner', () => ({ toast: vi.fn() }))

const { PushNotifications } = await import('@capacitor/push-notifications')
const { registerDeviceApi } = await import('@/api/facades/device')
const { toast } = await import('sonner')

describe('requestAndStartPushNotifications', () => {
  beforeEach(async () => {
    await stopPushNotifications()
    vi.clearAllMocks()
    native.listeners.clear()
    native.permission = 'granted'
  })

  it.each([
    { platform: 'android' as const, expected: 'ANDROID', createsChannel: true },
    // iOS 는 알림 채널이 없고, AppDelegate 가 넘긴 FCM 토큰을 IOS 로 등록한다
    { platform: 'ios' as const, expected: 'IOS', createsChannel: false },
  ])(
    '$platform 은 토큰을 $expected 로 등록한다',
    async ({ platform, expected, createsChannel }) => {
      native.platform = platform

      expect(await requestAndStartPushNotifications()).toBe(true)
      await native.listeners.get('registration')?.({ value: 'fcm-token' })

      expect(registerDeviceApi).toHaveBeenCalledWith({ token: 'fcm-token', platform: expected })
      expect(PushNotifications.createChannel).toHaveBeenCalledTimes(createsChannel ? 1 : 0)
    }
  )

  it('웹에서는 시작하지 않는다', async () => {
    native.platform = 'web'
    expect(await requestAndStartPushNotifications()).toBe(false)
    expect(PushNotifications.register).not.toHaveBeenCalled()
  })
})

describe('enablePushForBloomAlert', () => {
  let settingsEvents = 0
  const onSettingsChanged = () => settingsEvents++

  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    native.platform = 'android'
    native.permission = 'prompt'
    native.afterRequest = 'granted'
    settingsEvents = 0
    window.removeEventListener(APP_SETTINGS_CHANGED_EVENT, onSettingsChanged)
    window.addEventListener(APP_SETTINGS_CHANGED_EVENT, onSettingsChanged)
  })

  it('웹에서는 권한을 묻지 않고 설정도 바꾸지 않는다', async () => {
    native.platform = 'web'
    await enablePushForBloomAlert()
    expect(PushNotifications.requestPermissions).not.toHaveBeenCalled()
    expect(loadAppSettings().pushEnabled).toBe(false)
  })

  it('이미 푸시를 켜 둔 사용자에게는 다시 묻지 않는다', async () => {
    localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify({ pushEnabled: true }))
    await enablePushForBloomAlert()
    expect(PushNotifications.checkPermissions).not.toHaveBeenCalled()
  })

  it('허용하면 pushEnabled 를 저장하고 설정 변경 이벤트를 보낸다', async () => {
    await enablePushForBloomAlert()
    expect(PushNotifications.requestPermissions).toHaveBeenCalledTimes(1)
    expect(loadAppSettings().pushEnabled).toBe(true)
    expect(settingsEvents).toBe(1)
    expect(toast).not.toHaveBeenCalled()
  })

  it('거부하면 저장하지 않고 기기 설정 안내 토스트를 띄운다', async () => {
    native.afterRequest = 'denied'
    await enablePushForBloomAlert()
    expect(loadAppSettings().pushEnabled).toBe(false)
    expect(settingsEvents).toBe(0)
    expect(toast).toHaveBeenCalledTimes(1)
  })

  it('예전에 거부한 사용자는 팝업 없이 안내 토스트만 본다', async () => {
    native.permission = 'denied'
    await enablePushForBloomAlert()
    expect(PushNotifications.requestPermissions).not.toHaveBeenCalled()
    expect(toast).toHaveBeenCalledTimes(1)
  })
})
