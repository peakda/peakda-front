import { Capacitor, type PluginListenerHandle } from '@capacitor/core'
import {
  PushNotifications,
  type ActionPerformed,
  type PushNotificationSchema,
} from '@capacitor/push-notifications'
import { registerDeviceApi, unregisterDeviceApi } from '@/api/facades/device'

const CHANNEL_ID = 'peakda-default'

interface PushCallbacks {
  onNotificationReceived?: (notification: PushNotificationSchema) => void
  onNotificationAction?: (action: ActionPerformed) => void
}

let registeredToken: string | null = null
let listenerHandles: PluginListenerHandle[] = []
let activeCallbacks: PushCallbacks = {}

export function isNativeAndroid(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android'
}

async function installListeners(callbacks: PushCallbacks): Promise<void> {
  activeCallbacks = callbacks
  if (listenerHandles.length > 0) return

  listenerHandles = await Promise.all([
    PushNotifications.addListener('registration', async ({ value }) => {
      try {
        await registerDeviceApi({ token: value, platform: 'ANDROID' })
        registeredToken = value
      } catch (error) {
        console.error('푸시 토큰 등록 실패', error)
      }
    }),
    PushNotifications.addListener('registrationError', ({ error }) => {
      console.error('FCM 토큰 발급 실패', error)
    }),
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      activeCallbacks.onNotificationReceived?.(notification)
    }),
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      activeCallbacks.onNotificationAction?.(action)
    }),
  ])
}

async function register(callbacks: PushCallbacks): Promise<boolean> {
  await installListeners(callbacks)
  await PushNotifications.createChannel({
    id: CHANNEL_ID,
    name: '피크다 알림',
    description: '개화 소식과 서비스 활동 알림',
    importance: 3,
  })
  await PushNotifications.register()
  return true
}

export async function startPushNotifications(callbacks: PushCallbacks = {}): Promise<boolean> {
  if (!isNativeAndroid()) return false

  const permission = await PushNotifications.checkPermissions()
  if (permission.receive !== 'granted') return false

  return register(callbacks)
}

export async function requestAndStartPushNotifications(
  callbacks: PushCallbacks = {}
): Promise<boolean> {
  if (!isNativeAndroid()) return false

  let permission = await PushNotifications.checkPermissions()
  if (permission.receive === 'prompt' || permission.receive === 'prompt-with-rationale') {
    permission = await PushNotifications.requestPermissions()
  }
  if (permission.receive !== 'granted') return false

  return register(callbacks)
}

export async function stopPushNotifications(): Promise<void> {
  if (!isNativeAndroid()) return

  if (registeredToken) {
    try {
      await unregisterDeviceApi(registeredToken)
    } catch (error) {
      console.error('서버 푸시 토큰 해제 실패', error)
    }
  }

  try {
    await PushNotifications.unregister()
  } catch (error) {
    console.error('네이티브 푸시 토큰 해제 실패', error)
  }

  await Promise.all(listenerHandles.map((handle) => handle.remove()))
  listenerHandles = []
  registeredToken = null
  activeCallbacks = {}
}
