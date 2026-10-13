import { afterEach, describe, expect, it, vi } from 'vitest'
import { observeNearViewport } from './useNearViewport'

afterEach(() => vi.unstubAllGlobals())

describe('observeNearViewport', () => {
  it('목록이 observer를 공유하고 마지막 구독 해제 때 정리한다', () => {
    let notify!: IntersectionObserverCallback
    const observe = vi.fn(),
      unobserve = vi.fn(),
      disconnect = vi.fn()
    const constructor = vi.fn()
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(callback: IntersectionObserverCallback) {
          notify = callback
          constructor()
        }
        observe = observe
        unobserve = unobserve
        disconnect = disconnect
      }
    )
    const a = document.createElement('div'),
      b = document.createElement('div')
    const callback = vi.fn()
    const stopA = observeNearViewport(a, callback)
    const stopB = observeNearViewport(b, vi.fn())
    expect(constructor).toHaveBeenCalledTimes(1)
    notify(
      [{ target: a, isIntersecting: true } as unknown as IntersectionObserverEntry],
      {} as IntersectionObserver
    )
    expect(callback).toHaveBeenCalledWith(true)
    stopA()
    stopA()
    expect(unobserve).toHaveBeenCalledTimes(1)
    expect(disconnect).not.toHaveBeenCalled()
    stopB()
    expect(disconnect).toHaveBeenCalledTimes(1)
  })

  it('IntersectionObserver 미지원 환경에서는 콘텐츠를 활성화한다', () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    const callback = vi.fn()
    observeNearViewport(document.createElement('div'), callback)()
    expect(callback).toHaveBeenCalledWith(true)
  })
})
