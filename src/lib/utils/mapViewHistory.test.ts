import { describe, expect, it, beforeEach } from 'vitest'
import { readMapView, rememberMapView } from '@/lib/utils/mapViewHistory'

describe('mapViewHistory', () => {
  beforeEach(() => {
    window.history.replaceState(null, '')
  })

  it('기록한 적이 없으면 null 을 돌려준다', () => {
    expect(readMapView()).toBeNull()
  })

  it('기록한 중심·줌을 그대로 읽어 온다', () => {
    rememberMapView({ lat: 37.5, lng: 127.1, level: 5 })

    expect(readMapView()).toEqual({ lat: 37.5, lng: 127.1, level: 5 })
  })

  it('Next 라우터가 넣어 둔 state 를 지우지 않는다', () => {
    window.history.replaceState({ __NA: true, __PRIVATE_NEXTJS_INTERNALS_TREE: ['tree'] }, '')

    rememberMapView({ lat: 37.5, lng: 127.1, level: 5 })

    const state: unknown = window.history.state
    expect(state).toMatchObject({ __NA: true, __PRIVATE_NEXTJS_INTERNALS_TREE: ['tree'] })
  })

  it('주소는 건드리지 않는다', () => {
    const before = window.location.href

    rememberMapView({ lat: 37.5, lng: 127.1, level: 5 })

    expect(window.location.href).toBe(before)
  })

  it('망가진 값이 들어 있으면 무시한다', () => {
    window.history.replaceState({ peakdaMapView: { lat: 'x', lng: 127.1, level: 5 } }, '')

    expect(readMapView()).toBeNull()
  })

  it('다른 히스토리 엔트리의 값은 읽지 않는다', () => {
    rememberMapView({ lat: 37.5, lng: 127.1, level: 5 })
    // 하단 탭으로 지도에 새로 들어오는 경우 — Next 는 커스텀 state 를 새 엔트리에 복사하지 않는다.
    window.history.pushState({ __NA: true }, '')

    expect(readMapView()).toBeNull()
  })
})
