type Status = 'idle' | 'loading' | 'ready' | 'error'

class KakaoSDKLoader {
  private status: Status = 'idle'
  private promise: Promise<void> | null = null

  load(appKey: string): Promise<void> {
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

      script.src =
        `//dapi.kakao.com/v2/maps/sdk.js` +
        `?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}` +
        `&autoload=false` + // 수동 초기화 — 타이밍 제어
        `&libraries=clusterer` // 필요한 것만

      script.async = true // 파싱 블로킹 없음
      script.defer = true // DOM 완성 후 실행

      script.onload = () => {
        window.kakao.maps.load(() => {
          this.status = 'ready'
          resolve()
        })
      }

      script.onerror = () => {
        this.status = 'error'
        this.promise = null // 실패 시 재시도 가능하게
        reject(new Error('SDK 로드 실패'))
      }

      document.head.appendChild(script)
    })

    return this.promise
  }

  get isReady() {
    return this.status === 'ready'
  }
}

export const kakaoLoader = new KakaoSDKLoader()
