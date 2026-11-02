import { afterEach, describe, expect, it } from 'vitest'
import {
  AUTH_MARKER_CHANGED_EVENT,
  hasAuthMarker,
  isReloadingMarkerChange,
  setAuthMarker,
} from '@/lib/auth/session'

function captureMarkerChange(action: () => void): Event {
  let captured: Event | null = null
  const listener = (event: Event) => {
    captured = event
  }
  window.addEventListener(AUTH_MARKER_CHANGED_EVENT, listener)
  action()
  window.removeEventListener(AUTH_MARKER_CHANGED_EVENT, listener)
  if (!captured) throw new Error('마커 변경 이벤트가 발생하지 않았다')
  return captured
}

describe('setAuthMarker', () => {
  afterEach(() => {
    document.cookie = 'peakda_auth=; path=/; max-age=0'
  })

  it('마커를 심고 변경을 알린다. 기본은 전체 로드가 아니다', () => {
    const event = captureMarkerChange(() => setAuthMarker())

    expect(hasAuthMarker()).toBe(true)
    expect(isReloadingMarkerChange(event)).toBe(false)
  })

  it('곧바로 전체 로드로 떠나면 알림에 그 사실을 싣는다', () => {
    const event = captureMarkerChange(() => setAuthMarker({ reloading: true }))

    expect(hasAuthMarker()).toBe(true)
    expect(isReloadingMarkerChange(event)).toBe(true)
  })

  it('세부 정보가 없는 이벤트는 전체 로드로 보지 않는다', () => {
    expect(isReloadingMarkerChange(new Event(AUTH_MARKER_CHANGED_EVENT))).toBe(false)
  })
})
