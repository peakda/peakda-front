type Status = 'idle' | 'loading' | 'ready' | 'error'

const SDK_LOAD_TIMEOUT_MS = 15_000

// /map 서버 HTML 이 붙인 SDK 와 로더가 붙인 SDK 를 같은 요소로 알아보는 id.
const SDK_SCRIPT_ID = 'kakao-map-sdk'

export const getKakaoMapSdkUrl = (appKey: string) =>
  `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false&libraries=services`

/**
 * /map 서버 HTML 에 넣는 인라인 스크립트. HTML 을 읽는 즉시 SDK 를 붙이고 maps.load 까지 불러 둔다.
 *
 * 로더는 /map 번들을 받아 실행해야 돌기 시작하고, sdk.js 는 그때서야 엔진(kakao.js → services.js)을
 * 하나씩 차례로 받는다. 여기서 먼저 시작하면 번들을 받는 동안 엔진까지 받아 둔다. 버전이 박힌 엔진 주소를
 * preload 하지 않는 건 카카오가 버전을 올리면 조용히 헛다운로드가 되기 때문이다.
 * 실패하면 요소를 지워 로더가 새로 붙여 다시 시도하게 한다.
 */
export const getKakaoMapSdkBootstrap = (appKey: string) => `(function () {
  var s = document.createElement('script');
  s.id = ${JSON.stringify(SDK_SCRIPT_ID)};
  s.src = ${JSON.stringify(getKakaoMapSdkUrl(appKey))};
  s.async = true;
  s.onload = function () {
    var maps = window.kakao && window.kakao.maps;
    if (maps && maps.load) maps.load(function () {});
  };
  s.onerror = function () { s.remove(); };
  document.head.appendChild(s);
})();`

class KakaoSDKLoader {
  private status: Status = 'idle'
  private promise: Promise<void> | null = null

  load(appKey: string): Promise<void> {
    if (!appKey) return Promise.reject(new Error('카카오맵 앱 키가 없습니다.'))

    // 이미 로드됨. autoload=false 라 sdk.js 실행 직후엔 kakao.maps.load 만 있는 껍데기이고,
    // 실제 클래스(Map 등)는 maps.load 가 끝나야 생긴다. 껍데기만 보고 ready 로 두면
    // 타임아웃 후 재시도에서 new kakao.maps.Map 이 undefined 로 터진다.
    if (window.kakao?.maps?.Map) {
      this.status = 'ready'
      return Promise.resolve()
    }

    // 로딩 중이면 같은 Promise 반환 (중복 호출 방지)
    if (this.promise) return this.promise

    this.status = 'loading'

    this.promise = new Promise((resolve, reject) => {
      // /map 으로 바로 들어오면 서버 HTML 이 SDK 를 이미 붙여 두었다. 새로 붙이지 않고 거기에 이어 탄다.
      const existing = document.getElementById(SDK_SCRIPT_ID)
      const script =
        existing instanceof HTMLScriptElement ? existing : document.createElement('script')
      let settled = false

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

      // maps.load 는 엔진을 받는 중에 부르면 콜백을 모아 두었다가 끝날 때 함께 부른다.
      const loadEngine = () => {
        window.kakao.maps.load(() => {
          if (settled) return
          settled = true
          window.clearTimeout(timeoutId)
          this.status = 'ready'
          resolve()
        })
      }

      // sdk.js 가 이미 실행돼 엔진을 받는 중이면 콜백만 건다.
      if (typeof window.kakao?.maps?.load === 'function') {
        loadEngine()
        return
      }

      script.addEventListener('load', loadEngine)
      script.addEventListener('error', () => fail('SDK 로드 실패'))
      if (script === existing) return

      script.id = SDK_SCRIPT_ID
      script.src = getKakaoMapSdkUrl(appKey)
      script.async = true // 파싱 블로킹 없음
      script.defer = true // DOM 완성 후 실행
      document.head.appendChild(script)
    })

    return this.promise
  }

  get isReady() {
    return this.status === 'ready'
  }
}

export const kakaoLoader = new KakaoSDKLoader()
