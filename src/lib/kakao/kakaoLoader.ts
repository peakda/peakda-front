type Status = 'idle' | 'loading' | 'ready' | 'error'

const SDK_LOAD_TIMEOUT_MS = 15_000

export const getKakaoMapSdkUrl = (appKey: string) =>
  `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false&libraries=services`

class KakaoSDKLoader {
  private status: Status = 'idle'
  private promise: Promise<void> | null = null

  load(appKey: string): Promise<void> {
    if (!appKey) return Promise.reject(new Error('카카오맵 앱 키가 없습니다.'))

    // 이미 로드됨
    if (window.kakao?.maps) {
      this.status = 'ready'
      return Promise.resolve()
    }

    // 로딩 중이면 같은 Promise 반환 (중복 호출 방지)
    if (this.promise) return this.promise

    this.status = 'loading'

    this.promise = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      let settled = false

      script.src = getKakaoMapSdkUrl(appKey)

      script.async = true // 파싱 블로킹 없음
      script.defer = true // DOM 완성 후 실행

      const fail = (message: string) => {
        if (settled) return
        settled = true
        window.clearTimeout(timeoutId)
        script.remove()
        this.status = 'error'
        this.promise = null
        reject(new Error(message))
      }

      const timeoutId = window.setTimeout(
        () => fail('SDK 로드 시간이 초과되었습니다.'),
        SDK_LOAD_TIMEOUT_MS
      )

      script.onload = () => {
        window.kakao.maps.load(() => {
          if (settled) return
          settled = true
          window.clearTimeout(timeoutId)
          this.status = 'ready'
          resolve()
        })
      }

      script.onerror = () => fail('SDK 로드 실패')

      document.head.appendChild(script)
    })

    return this.promise
  }

  get isReady() {
    return this.status === 'ready'
  }
}

export const kakaoLoader = new KakaoSDKLoader()
