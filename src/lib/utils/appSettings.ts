// 앱 설정 localStorage 키. 서버에 저장하지 않고 클라이언트에서만 관리하는 값이다.
export const APP_SETTINGS_KEY = 'peakda:app-settings'
export const APP_SETTINGS_CHANGED_EVENT = 'peakda:app-settings-changed'

export interface AppSettings {
  // 위치 정보 활용 (내 위치 기반 추천)
  locationEnabled: boolean
  // EXIF 데이터 자동 추출 (사진에서 위치·날짜 자동 입력)
  exifEnabled: boolean
  // 네이티브 앱 푸시 알림 수신
  pushEnabled: boolean
}

// 저장된 값이 없으면 둘 다 켜짐
export const DEFAULT_APP_SETTINGS: AppSettings = {
  locationEnabled: true,
  exifEnabled: true,
  pushEnabled: false,
}

const readFlag = (source: Record<string, unknown>, key: keyof AppSettings): boolean => {
  const value = source[key]
  return typeof value === 'boolean' ? value : DEFAULT_APP_SETTINGS[key]
}

// localStorage 원문 → 앱 설정. 손상된 값이 저장돼 있어도 화면이 죽지 않도록 기본값으로 되돌린다.
export const readAppSettings = (raw: string | null): AppSettings => {
  if (!raw) return DEFAULT_APP_SETTINGS
  try {
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return DEFAULT_APP_SETTINGS
    }
    const source = parsed as Record<string, unknown>
    return {
      locationEnabled: readFlag(source, 'locationEnabled'),
      exifEnabled: readFlag(source, 'exifEnabled'),
      pushEnabled: readFlag(source, 'pushEnabled'),
    }
  } catch {
    return DEFAULT_APP_SETTINGS
  }
}

// 설정 화면 밖(위치 권한·EXIF 추출 등)에서 현재 값을 읽을 때 쓴다.
// SSR 에는 localStorage 가 없으므로 기본값을 돌려준다.
export const loadAppSettings = (): AppSettings => {
  if (typeof window === 'undefined') return DEFAULT_APP_SETTINGS
  return readAppSettings(window.localStorage.getItem(APP_SETTINGS_KEY))
}
