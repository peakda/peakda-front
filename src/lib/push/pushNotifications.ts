import { Capacitor, type PluginListenerHandle } from '@capacitor/core'
import {
  PushNotifications,
  type ActionPerformed,
  type PushNotificationSchema,
} from '@capacitor/push-notifications'
import { toast } from 'sonner'
import { registerDeviceApi, unregisterDeviceApi } from '@/api/facades/device'
import { track } from '@/lib/analytics'
import { APP_SETTINGS_CHANGED_EVENT, APP_SETTINGS_KEY, loadAppSettings } from '@/lib/utils/appSettings'
import { writeStorage } from '@/lib/utils/storage'

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
  // 푸시를 켤 때마다(설정 토글·만개 알림 켜기) 보낸다 — 시스템에서 거부해 둔 사용자는 denied 로 남는다.
  track('push_permission', { result: permission.receive })
  if (permission.receive !== 'granted') return false

  return register(callbacks)
}

// 만개 알림을 켜는 순간(찜 시트·종 버튼)에 기기 푸시도 함께 켠다. 만개 알림은 서버 설정이라
// 이것만 켜고 기기 토큰이 없으면 푸시가 오지 않는다. 설정 화면 토글과 같은 값(pushEnabled)을 저장하고
// 이벤트를 보내면 PushNotificationManager 가 알림 탭 콜백까지 붙여 등록을 이어받는다.
// 웹은 푸시가 없어 아무것도 하지 않는다(앱 내 알림 목록으로 받는다).
export async function enablePushForBloomAlert(): Promise<void> {
  if (!isNativeAndroid() || loadAppSettings().pushEnabled) return

  try {
    const enabled = await requestAndStartPushNotifications()
    if (!enabled) {
      toast('휴대폰 알림이 꺼져 있어 만개 알림이 오지 않아요', {
        description: '기기 설정에서 피크다 알림을 허용해 주세요.',
      })
      return
    }
    writeStorage(APP_SETTINGS_KEY, JSON.stringify({ ...loadAppSettings(), pushEnabled: true }))
    window.dispatchEvent(new Event(APP_SETTINGS_CHANGED_EVENT))
  } catch (error) {
    console.error('만개 알림 푸시 권한 요청 실패', error)
  }
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
