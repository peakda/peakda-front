// localStorage 는 시크릿 모드·저장 공간 초과·일부 WebView 에서 접근만 해도 예외를 던진다.
// 저장값은 전부 "없으면 기본값"으로 동작하는 편의용이라, 실패해도 화면 흐름을 멈추지 않도록 삼킨다.
// SSR 에서는 읽기 null, 쓰기는 무시한다.

export function readStorage(key: string): string | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

export function writeStorage(key: string, value: string): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, value)
  } catch (error) {
    console.warn('localStorage 저장 실패', key, error)
  }
}

export function removeStorage(key: string): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(key)
  } catch (error) {
    console.warn('localStorage 삭제 실패', key, error)
  }
}
