import { afterEach, describe, expect, it, vi } from 'vitest'

// 로더는 모듈 싱글턴이라 테스트마다 새로 불러온다.
async function loadModule() {
  vi.resetModules()
  return import('@/lib/kakao/kakaoLoader')
}

// /map 서버 HTML 의 인라인 스크립트를 실행한다.
function runBootstrap(code: string) {
  new Function(code)()
}

// sdk.js 가 실행된 상태를 흉내 낸다. maps.load 콜백은 엔진(Map)이 생길 때(finishEngine) 함께 불린다.
function fakeSdkExecuted() {
  const callbacks: (() => void)[] = []
  const maps = {
    load: vi.fn((callback: () => void) => {
      callbacks.push(callback)
    }),
  }
  window.kakao = { maps } as unknown as Window['kakao']
  const finishEngine = () => {
    Object.assign(maps, { Map: class {} })
    callbacks.splice(0).forEach((callback) => callback())
  }
  return { maps, finishEngine }
}

describe('lib/kakao/kakaoLoader', () => {
  afterEach(() => {
    document.head.innerHTML = ''
    Reflect.deleteProperty(window, 'kakao')
  })

  it('SDK 가 붙어 있지 않으면 새로 붙이고 엔진까지 받으면 끝난다', async () => {
    const { kakaoLoader, getKakaoMapSdkUrl } = await loadModule()
    const loading = kakaoLoader.load('key')

    const script = document.getElementById('kakao-map-sdk') as HTMLScriptElement
    expect(script.src).toBe(getKakaoMapSdkUrl('key'))

    const { finishEngine } = fakeSdkExecuted()
    script.dispatchEvent(new Event('load'))
    finishEngine()

    await expect(loading).resolves.toBeUndefined()
    expect(kakaoLoader.isReady).toBe(true)
  })

  it('HTML 이 붙여 둔 SDK 를 받는 중이면 새로 붙이지 않고 그 요소에 이어 탄다', async () => {
    const { kakaoLoader, getKakaoMapSdkBootstrap, getKakaoMapSdkUrl } = await loadModule()
    runBootstrap(getKakaoMapSdkBootstrap('key'))
    const loading = kakaoLoader.load('key')

    const scripts = document.head.querySelectorAll('script')
    expect(scripts).toHaveLength(1)
    expect(scripts[0].src).toBe(getKakaoMapSdkUrl('key'))

    const { maps, finishEngine } = fakeSdkExecuted()
    scripts[0].dispatchEvent(new Event('load'))
    // 인라인 스크립트가 엔진 받기를 시작하고, 로더는 콜백만 보탠다.
    expect(maps.load).toHaveBeenCalledTimes(2)
    finishEngine()

    await expect(loading).resolves.toBeUndefined()
  })

  it('sdk.js 가 이미 실행돼 엔진을 받는 중이면 새로 붙이지 않고 콜백만 건다', async () => {
    const { kakaoLoader } = await loadModule()
    const { maps, finishEngine } = fakeSdkExecuted()
    const loading = kakaoLoader.load('key')

    expect(document.head.querySelector('script')).toBeNull()
    expect(maps.load).toHaveBeenCalledTimes(1)
    finishEngine()

    await expect(loading).resolves.toBeUndefined()
  })

  it('HTML 이 붙인 SDK 가 실패하면 그 요소를 지우고, 다시 부르면 새로 붙인다', async () => {
    const { kakaoLoader, getKakaoMapSdkBootstrap } = await loadModule()
    runBootstrap(getKakaoMapSdkBootstrap('key'))
    const first = document.getElementById('kakao-map-sdk')!
    const loading = kakaoLoader.load('key')

    first.dispatchEvent(new Event('error'))
    await expect(loading).rejects.toThrow('SDK 로드 실패')
    expect(first.isConnected).toBe(false)

    const retrying = kakaoLoader.load('key')
    const retried = document.getElementById('kakao-map-sdk')!
    expect(retried).not.toBe(first)

    retried.dispatchEvent(new Event('error'))
    await expect(retrying).rejects.toThrow('SDK 로드 실패')
  })
})
