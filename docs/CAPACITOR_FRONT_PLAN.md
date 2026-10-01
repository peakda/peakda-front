# Capacitor 안드로이드 앱 — 프론트 개발 계획 (TODO)

작성일 2026-08-19 · 결정: **Capacitor** (2026-10-01 기준 구현·AAB 빌드 완료) ([ANDROID_APP_DECISION.md](ANDROID_APP_DECISION.md) 논의 기반)

> 이 문서는 "무엇을 어떤 순서로 할지"를 담은 실행 계획이다.
> 왜 Capacitor 인가 / TWA 와의 비교는 [ANDROID_APP_DECISION.md](ANDROID_APP_DECISION.md) 를 본다.
> 외부 담당자에게 받아야 할 값과 백엔드 질문은 [CAPACITOR_EXTERNAL_REQUIREMENTS.md](CAPACITOR_EXTERNAL_REQUIREMENTS.md) 에서 관리한다.

---

## 0. 먼저 정할 것 — 이 앱은 정적 사이트가 아니다

Peakda 는 순수 정적 웹앱이 아니라 **Next.js 15 SSR 앱**이다. 코드로 확인한 사실:

- `next/image` 를 42개 파일에서 사용 (`next.config.ts` 에 `output: 'export'` 없음). 2026-10-01 기준 서버 최적화는 **꺼져 있다**(`images.unoptimized: true`, [MEMORY.md](../MEMORY.md) 참고) — 그래도 이미지 컴포넌트는 그대로라 A안으로 가면 `next/image` 대체 작업이 남는다
- **`src/middleware.ts` 가 인증 라우팅을 담당** — 마커 쿠키를 보고 `/login` ↔ `/map` 리디렉트
- `next start` 로 Vercel 에서 구동. Route Handler·서버 액션은 0개지만 middleware + 이미지 최적화가 서버 의존

이 때문에 Capacitor 의 두 방식 중 선택이 강제된다.

| | A. 정적 자산 번들 | B. `server.url` → 실도메인 |
| --- | --- | --- |
| WebView 오리진 | `https://localhost` | **실제 도메인 그대로** |
| 필요 작업 | `output: 'export'` 전환 → **middleware 폐기 + next/image 대체** | 없음 (사이트를 그대로 로드) |
| 쿠키 인증 | 서드파티 쿠키 문제 발생 | **브라우저와 동일 (문제 사라짐)** |
| 소셜 로그인 | 콜백이 앱으로 안 돌아옴 → 딥링크 필요 | **오리진이 실도메인이라 그대로 동작** |
| 오프라인 | 가능 | 불가 (네트워크 없으면 빈 화면) |
| Play 최소기능 정책 | 무난 | "웹사이트 래핑" 스크루티니 위험 |

**핵심**: [ANDROID_APP_DECISION.md](ANDROID_APP_DECISION.md) 가 정리한 Capacitor 의 세 걸림돌(쿠키·소셜로그인·`https://localhost`)은 전부 **A안(번들) 전제**다. 이 앱은 middleware + 이미지 최적화 때문에 A안이면 라우팅/이미지 구조를 크게 뜯어야 한다. **B안(`server.url`)이면 오리진이 실도메인이 되어 쿠키·OAuth 문제가 애초에 안 생긴다.** 대신 오프라인 불가 + Play 정책 리스크로 트레이드오프가 옮겨간다.

> **권장: B안(`server.url`)으로 시작.** SSR 구조를 안 건드리고 인증 리스크 두 개를 지운다.
> Phase 1 실기기 검증에서 로그인/지도가 되면 B안 확정, 안 되면 그때 A안 규모를 산정한다.

**좋은 소식**: A안(TWA 포함)의 "서비스워커 충돌(`firebase-messaging-sw.js` vs `public/map-tile-sw.js`)" 문제는 Capacitor 네이티브 푸시에는 **없다** — 웹 푸시 SW 를 안 쓰기 때문. 걱정 하나 줄어든다.

---

## 코드로 확인된 현재 상태

| 항목 | 현재 | 위치 |
| --- | --- | --- |
| 인증 | 크로스사이트 쿠키(`SameSite=None; Secure`) + `credentials: 'include'`. JS 는 토큰 안 들고 있음. 401 시 refresh 1회 재시도 | `src/api/mutator/index.ts` |
| 라우팅 인증 | 프런트 도메인 마커 쿠키로 진입 분기 (보안 경계 아님) | `src/middleware.ts` |
| 소셜 로그인 | 백엔드가 프런트 도메인 콜백으로 리디렉트. 카카오·네이버 연결됨, 애플은 미지원 확정 → **구글로 교체 완료**(`handleGoogleLogin`). 앱은 Custom Tab → `peakda://auth` 딥링크 → `exchangeNativeAuthorizationCode`(`/api/auth/app/token`) 로 토큰 교환 (2026-10-01 코드 확인, 실기기 검증 전) | `src/app/auth/callback`, `src/lib/auth/socialLogin.ts`, `src/lib/auth/nativeAuth.ts` |
| 디바이스 토큰 | `registerDeviceApi` / `unregisterDeviceApi` UI 연동 완료(권한 요청, 토큰 등록·해제, 로그아웃 시 해제) | `src/api/facades/device.ts`, `src/lib/push/pushNotifications.ts` |
| 토큰 스키마 | `token: string` · `platform: 'IOS' \| 'ANDROID'` | `peakdaApi.schemas.ts` |
| 푸시 발송단 | FCM 확정(Firebase Admin SDK 직접 발송), 배선은 연결됨 — **발송 어댑터만 스텁**(서비스 계정 키 발급 대기) | `BACKEND_API_REQUESTS.md`, `CAPACITOR_PUSH_FOLLOWUP.md` |
| 푸시 payload·라우팅 | 규격 확정, 탭 시 유형별 내부 경로 라우팅 구현 완료 | `src/lib/utils/notificationToAlarm.ts`(`resolvePushNotificationTarget`), `src/app/_components/PushNotificationManager.tsx` |

---

## Phase 0 — 전제 확정 (코드 전, 지금 병렬 시작)

- [x] 프로덕션 **실도메인 확정** — `https://peakda.com` (2026-09-06). DNS·Vercel 연결 완료, 앱 서버 URL 은 `https://www.peakda.com`(apex 는 www 로 308, [TODO.md](TODO.md) §6). 백엔드 `api.peakda.com`·`api-dev.peakda.com`은 이미 응답하므로 도메인 소유는 확인됨
- [x] 백엔드 확인: 푸시 인프라 **FCM 여부 + 일정** — 2026-08-20 회신: FCM 확정(Phase 3 참고) ([ANDROID_APP_DECISION.md](ANDROID_APP_DECISION.md) 92번). 발송단 없으면 Phase 3 차단
- [x] **Google Play 개발자 계정 개설** — 완료 (2026-09-06)
- [x] ~~**비공개 테스트 착수 준비** (테스터 12명 / 14일)~~ — 프로덕션 출시(2026-10-01)로 종료
- [x] `appId` 확정 — `com.peakda.app` (2026-09-06). Play 업로드 후에는 변경 불가

## Phase 1 — Capacitor 셸 골격 (앱이 뜨기만, ~1일)

- [x] `@capacitor/core` `@capacitor/cli` `@capacitor/android` 설치
- [x] `capacitor.config.ts` 작성: `appId`, `appName`, `server.url = https://실도메인`, `androidScheme: 'https'` (`CAPACITOR_SERVER_URL`로 주입, 실도메인 확정 대기)
- [x] `npx cap add android`
- [x] 에뮬레이터/실기기 실행
- [x] **검증 (go/no-go)** — 여기서 리스크를 초반에 털어낸다:
  - [x] 앱이 실사이트를 로드하고 화면 전환이 정상
  - [x] 카카오맵 렌더 정상
  - [x] 소셜 로그인 왕복 성공
  - [x] 로그인 후 쿠키 유지 (재요청에 인증 붙는지)
- ~~위가 깨지면 → A안(정적 번들) + 딥링크 규모 재산정으로 분기~~ — 검증 통과로 불필요

## Phase 2 — 인증·지도 실기기 검증

- [x] 카카오 개발자 콘솔 JS 키 도메인 허용 목록에 WebView 오리진(실도메인) 등록 확인
- [x] 소셜 로그인이 Custom Tabs(외부 브라우저)로 열리고 앱 복귀 실패하는지 확인 — **2026-08-20 백엔드 회신: 지금 구조로는 실패가 확정적이다.** HttpOnly 쿠키 전용 인증이라 Custom Tab에서 받은 쿠키가 WebView로 안 넘어오고, 딥링크로 복귀해도 앱엔 세션이 없다. App Links만으로는 해결 안 됨 → **아래로 대체**:
  - [x] **일회성 코드 교환 방식 도입** — Custom Tab 인증 → `peakda://auth/callback?code=...` 복귀 → 앱이 code를 토큰과 교환 → 이후 Bearer 헤더로 API 호출. 2026-10-01 코드 확인: `AndroidManifest.xml` 딥링크(`peakda://auth`), `nativeAuth.ts` 의 `exchangeNativeAuthorizationCode`·Bearer 헤더, `NativeAuthManager`. **실기기 로그인 왕복은 아직 미검증** ([TODO.md](TODO.md) §3)
  - [x] ~~스킴 확정 전까지 웹 방식 유지~~ — 스킴·엔드포인트가 정해져 위 방식으로 구현됨
- [x] refresh/401 흐름이 WebView 에서도 동작 (`mutator/index.ts` 의 `window.location` 리디렉트 포함)

## Phase 3 — 푸시 (완료, 2026-10-01 실기기 수신 확인)

> 2026-08-20 백엔드 회신: FCM 확정, Firebase Admin SDK 직접 발송, SSE 병행 안 함. 알림 생성→토큰
> 조회→발송 호출까지는 연결됐고 **발송 어댑터만 스텁**(서비스 계정 키 미발급). payload 규격(`type`/
> `linkType`/`targetId`)도 확정돼 클라이언트 라우팅까지 구현했다. 남은 차단 요인은 서비스 계정 키뿐.

- [x] Firebase 프로젝트 생성 → `google-services.json` 안드로이드 앱에 배치 — 프로젝트 `peakda`(백엔드 소유), 2026-09-06 빌드에 반영 확인([TODO.md](TODO.md) §2). 파일은 gitignore 대상이라 빌드하는 PC 마다 따로 넣는다
- [x] `@capacitor/push-notifications` 도입
- [x] 토큰 수신 → `registerDeviceApi({ token, platform: 'ANDROID' })` 배선
- [x] 로그아웃 → `unregisterDeviceApi(token)` 배선 (로그아웃 API보다 먼저 호출 — 백엔드 요구사항과 일치 확인됨)
- [x] **스키마 변경 불필요** — `platform: 'ANDROID'` 그대로 (A/TWA 와 달리 `WEB` enum 추가 안 함)
- [x] 알림 권한 요청 UI (`requestAndStartPushNotifications`, 인증 마커·앱 설정 변경 시 재시도)
- [x] 알림 탭 → 유형별 내부 경로로 라우팅 (`resolvePushNotificationTarget` + `PushNotificationManager`), 파싱 실패 시 `/notification` 폴백. 읽음 처리(`PATCH .../read`)도 함께 호출
- [x] 실기기에서 실제 FCM 발송 종단 검증 (서비스 계정 키 발급 후에만 가능)

## Phase 4 — Play 제출 준비

- [x] 런처 아이콘 — `public/images/appIcon.png`에서 밀도별 15종 생성(adaptive 전경·레거시 사각·원형). Play 등록용 512x512는 `android/store/play-icon-512.png`
- [x] 네이티브 스플래시 — 같은 원본으로 세로/가로 11종 생성. 텍스트는 넣지 않고 인앱 `SplashScreen.tsx`가 담당
- [x] **오프라인 폴백 화면** — `server.errorPath` 로 로컬 재시도 화면 제공
- [x] 서명 키(keystore) 생성 및 보관 — 업로드 키 생성 완료(RSA 2048, 2054-01-21 만료). 저장소 밖 로컬 경로에 보관하고 경로·비밀번호·alias는 `~/.gradle/gradle.properties`에서 Gradle 프로퍼티로 주입한다
- [x] AAB 빌드 명령 및 release 번들 검증 — `pnpm android:build:bundle`로 **서명된** AAB 생성 확인(`jarsigner -verify` → `jar verified.`)

## Phase 5 — 릴리스

- [x] 프로덕션 심사 제출 → **출시 완료 (2026-10-01)** — https://play.google.com/store/apps/details?id=com.peakda.app
- 내부·비공개 테스트 트랙은 프로덕션 출시로 의미가 없어졌다

---

## 차단 요인 / 리스크

1. ~~**Firebase 서비스 계정 키 미발급**~~ — **해소**: 백엔드 발송 연동·실기기 수신 확인 (2026-10-01). 아래는 당시 기록 — Phase 3 발송 검증 차단(구현 자체는 완료). FCM 여부·발송 방식·payload·정책은 2026-08-20 전부 회신받아 더 이상 추측이 아니다
2. ~~**소셜 로그인 코드 교환 스펙 미확정**~~ — **해소**: `peakda://auth` 딥링크 + `exchangeNativeAuthorizationCode`(`POST /api/auth/app/token`)로 구현됨(`src/lib/auth/nativeAuth.ts`, 실기기 검증 전). 아래는 당시 기록 — Custom Tab 방식은 백엔드가 안 된다고 확정했고, 대체할 일회성 코드 교환 방식의 엔드포인트·딥링크 스킴·스키마가 아직 안 나왔다. 그 전까지 앱은 기존 웹 로그인 방식으로만 동작
3. ~~**실도메인 DNS 미연결**~~ — **해소**: [TODO.md](TODO.md) §6 기준 `www.peakda.com` 이 서버 URL 로 확정·사용 중이다(apex 는 www 로 308). Phase 1 실기기 검증은 막혀 있지 않다
4. ~~**Play 14일 비공개 테스트**~~ — **해소**: 프로덕션 출시됨 (2026-10-01)
5. **`server.url` 프로덕션 사용** — Capacitor 공식은 비권장(원래 live-reload 용). Phase 1 실기기 검증이 실사용 가능 여부를 조기에 판정하는 안전장치
6. **오프라인 / Play 최소기능** — B안의 대표 약점. Phase 4 폴백 화면으로 완화

## 다음 행동

가장 단순한 첫 수는 **Phase 1 을 실제로 돌려 로그인·지도가 WebView 에서 되는지 확인**하는 것. 되면 B안 확정, 안 되면 A안 규모 산정으로 넘어간다.
