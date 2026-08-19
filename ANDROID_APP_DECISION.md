# 안드로이드 앱 배포 방식 — TWA vs Capacitor

작성일 2026-08-19 · 아직 정해진 것 없음

Peakda 를 Google Play 에 올리려면 웹앱을 안드로이드 패키지로 감싸야 하는데, 방법이 두 가지입니다.
어느 쪽이냐에 따라 백엔드가 할 일이 달라져서, 정하기 전에 같이 볼 내용을 정리했습니다.

---

## 상황

- Peakda 는 Next.js 웹앱(Vercel)이라 Play 에 그대로는 못 올립니다. AAB 로 감싸야 합니다.
- 푸시를 넣기로 했는데, 방식에 따라 백엔드가 받는 디바이스 토큰 종류가 달라집니다.
- 지금 백엔드에 푸시 발송 인프라는 없습니다. `POST /api/devices` 엔드포인트 스펙만 있고 일정은 미정입니다.
  (`BACKEND_API_REQUESTS.md:285`, `UNLINKED_ROUTES.md:33`)

참고로 알아둘 것은, Play 개인 개발자 계정은 프로덕션 출시 전에 테스터 12명이 14일간 참여하는 비공개 테스트를 거쳐야 한다는 점입니다. 계정 만들고 2~3주는 잡아야 해서 결정이 늦으면 그만큼 밀립니다.

## 지금 구조

| | 현재 | 위치 |
| --- | --- | --- |
| 인증 | 프런트(Vercel)와 백엔드(AWS) 도메인이 달라 크로스사이트 쿠키(`SameSite=None; Secure`)를 `credentials: 'include'` 로 주고받음. JS 가 토큰을 들고 있지 않음 | `src/api/mutator/index.ts` |
| 소셜 로그인 | 백엔드가 프런트 도메인의 콜백 경로로 리디렉트 | `src/app/auth/callback` |
| 디바이스 토큰 스키마 | `token: string` (ASCII, 1024자 이하) · `platform` 은 `IOS`, `ANDROID` 두 값 | `peakdaApi.schemas.ts:1404` |
| 프런트 호출부 | `registerDeviceApi` / `unregisterDeviceApi` 는 만들어져 있고 UI 연동만 보류 중 | `src/api/facades/device.ts` |
| 서비스워커 | 카카오맵 타일 캐시용 SW 가 루트 스코프에 등록되어 있음 | `public/map-tile-sw.js` |

---

## 두 방법 비교

| | A. TWA | B. Capacitor |
| --- | --- | --- |
| 방식 | Chrome 엔진으로 웹앱을 감싼 앱 | WebView 에 웹앱을 띄우는 네이티브 앱 |
| 실행 오리진 | 실제 도메인 그대로 | `https://localhost` |
| 쿠키 인증 | 그대로 동작 | 서드파티 쿠키가 되어 WebView 설정 필요 |
| 소셜 로그인 | 그대로 동작 | 콜백이 앱으로 안 돌아옴. 백엔드에서 redirect URI 추가 필요 |
| 푸시 — 백엔드 | FCM 발송단 신규 구축 | FCM 발송단 신규 구축 (같음) |
| 푸시 — 스키마 | `platform` 에 `WEB` 값 추가 | 변경 없음 |
| 프런트 작업량 | 수일 정도 | 1~2주 정도 |
| 배포 | 웹 배포하면 앱도 갱신됨 | 웹 부분은 갱신, 네이티브 변경 시 재심사 |
| iOS | 별도 경로 필요 | 같은 코드로 iOS 앱 가능 |

푸시만 보면 백엔드 작업량은 두 안이 비슷합니다. 어느 쪽이든 FCM 발송단을 새로 만들어야 하니까요.
차이가 나는 건 인증 쪽입니다.

---

## A. TWA

Chrome 엔진이 실제 도메인의 웹앱을 그대로 띄웁니다. `/.well-known/assetlinks.json` 으로 도메인 소유를 증명하면 주소창이 사라집니다.

**인증** — 오리진이 실제 도메인이라 쿠키도 OAuth 리디렉트도 브라우저와 같습니다. `mutator/index.ts` 는 손대지 않아도 됩니다.

**푸시** — FCM Web SDK 의 `getToken()` 이 단일 ASCII 문자열을 주는데, 지금 스키마에 그대로 들어갑니다.

```ts
// peakdaApi.schemas.ts:1404
token: string                   // ASCII, 1024자 이하  → FCM 웹 토큰이 그대로 맞음
platform: 'IOS' | 'ANDROID'     // 여기에 'WEB' 추가가 필요
```

표준 Web Push(VAPID) 를 쓰면 `endpoint` + `p256dh` + `auth` 세 필드가 필요해서 스키마를 새로 만들어야 하는데, FCM Web 이면 enum 값 하나 추가로 끝납니다.
Bubblewrap 에서 notification delegation 을 켜면 알림이 Chrome 이 아니라 Peakda 이름으로 뜹니다.

**백엔드 작업** — FCM 발송단 구축, `platform` enum 에 `WEB` 추가.

**프런트 작업** — manifest 신규 작성(현재 없음), PNG 아이콘 192/512 준비(현재 SVG 파비콘만 있음), assetlinks 배치, 알림 권한 UI 와 토큰 등록 배선, Bubblewrap 빌드.
하나 걸리는 건 서비스워커입니다. `firebase-messaging-sw.js` 와 기존 `map-tile-sw.js` 가 둘 다 루트 스코프라 나중에 등록한 쪽이 앞을 밀어냅니다. 한 파일로 합쳐야 합니다.

**주의할 점** — assetlinks 의 서명 키 지문이 안 맞으면 앱 상단에 URL 바가 그대로 남습니다. 배포 후 실기기에서 확인이 필요합니다. 그리고 웹사이트를 그냥 감싼 것처럼 보이면 Play 최소 기능 정책에 걸릴 수 있어서, 오프라인 폴백이나 뒤로가기 처리 정도는 해두는 게 좋습니다.

## B. Capacitor

WebView 에 웹앱을 띄웁니다. 실행 오리진이 `https://localhost` 로 바뀌고, 여기서 두 가지가 걸립니다.

**쿠키** — 백엔드 호출이 전부 서드파티 요청이 됩니다. WebView 의 서드파티 쿠키 허용(`CookieManager.setAcceptThirdPartyCookies`)을 켜야 하고, 버전별로 동작 차이가 있는 것으로 알고 있습니다.

**소셜 로그인** — 백엔드가 프런트 도메인 콜백으로 리디렉트하는데 앱 오리진이 그 도메인이 아니라서 앱으로 돌아오지 못합니다. 백엔드 OAuth redirect URI 에 앱 딥링크를 추가로 등록해야 합니다.

**푸시** — `@capacitor/push-notifications` 로 네이티브 FCM 토큰을 받습니다. `platform: ANDROID` 그대로라 스키마 변경은 없습니다. 발송단은 A안과 똑같이 새로 만들어야 합니다.

**백엔드 작업** — FCM 발송단 구축, OAuth redirect URI 에 앱 딥링크 추가, WebView 오리진에서의 쿠키 동작 확인.

**프런트 작업** — Capacitor 도입, 안드로이드 프로젝트 구성, 딥링크 처리, 쿠키 설정, 네이티브 푸시 배선, 빌드 파이프라인.

**B 가 나을 수 있는 경우** — iOS 앱도 낼 계획이면 한 코드베이스로 두 스토어를 커버할 수 있습니다. 백그라운드 위치추적처럼 네이티브 기능이 필요해져도 마찬가지인데, 지금 기획에는 없습니다.

---

## 백엔드에 물어볼 것

1. 푸시 인프라는 FCM 으로 가시나요? 일정은 어떻게 되나요?
   FCM 이면 Admin SDK 하나로 웹·안드로이드·iOS 를 다 보낼 수 있습니다. 다른 방식이면 A안의 웹 토큰을 못 받을 수 있어서 먼저 확인이 필요합니다.
2. FCM 이면 `RegisterDeviceRequestPlatform` enum 에 `WEB` 값을 추가할 수 있을까요? 값 추가라 기존 클라이언트는 안 깨집니다.
3. B안을 본다면, OAuth redirect URI 에 앱 딥링크를 추가할 수 있나요? 안 되면 B안은 로그인이 성립하지 않습니다.
4. iOS 앱 계획이 로드맵에 있나요? 있으면 B안 쪽 가치가 올라갑니다.

1, 2 가 되면 A안으로 갈 수 있을 것 같습니다.

## 아직 확실하지 않은 것

- 백엔드가 FCM 을 쓸 거라는 건 프런트 추측입니다. 문서에는 "FCM 등" 으로만 적혀 있습니다.
- Capacitor 의 WebView 쿠키 동작은 문서로만 확인했고 실기기 테스트는 안 해봤습니다.
- Play 의 테스터 12명 / 14일 요건은 알려진 정책 기준이고, 계정 만들 때 Console 안내로 다시 확인해야 합니다.
- 작업량(수일 / 1~2주)은 어림치입니다.
