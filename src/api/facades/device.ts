import { postDevices, deleteDevicesByToken } from '@/api/facades/generated/device/device'
import type { RegisterDeviceRequest } from '@/api/facades/generated/peakdaApi.schemas'

// 푸시 디바이스 토큰 등록/해제. 앱 로드·알림 권한 변경 시점에 이벤트 기반으로 호출한다.

// ▷ plain async (이벤트 기반 호출) ─────────────────────────────────────────

export async function registerDeviceApi(payload: RegisterDeviceRequest) {
  await postDevices(payload)
}

export async function unregisterDeviceApi(token: string) {
  await deleteDevicesByToken(token)
}
