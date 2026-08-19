# Capacitor 안드로이드 앱 — 프론트 개발 계획 (TODO)

작성일 2026-08-19 · 잠정 결정: **Capacitor** ([ANDROID_APP_DECISION.md](ANDROID_APP_DECISION.md) 논의 기반)

> 이 문서는 "무엇을 어떤 순서로 할지"를 담은 실행 계획이다.
> 왜 Capacitor 인가 / TWA 와의 비교는 [ANDROID_APP_DECISION.md](ANDROID_APP_DECISION.md) 를 본다.

---

## 0. 먼저 정할 것 — 이 앱은 정적 사이트가 아니다

Peakda 는 순수 정적 웹앱이 아니라 **Next.js 15 SSR 앱**이다. 코드로 확인한 사실:

- `next/image` 서버 최적화를 38개 파일에서 사용 (`next.config.ts` 에 `output: 'export'` 없음)
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
| 소셜 로그인 | 백엔드가 프런트 도메인 콜백으로 리디렉트 | `src/app/auth/callback` |
| 디바이스 토큰 | `registerDeviceApi` / `unregisterDeviceApi` 는 있고 **UI 연동만 보류** | `src/api/facades/device.ts` |
| 토큰 스키마 | `token: string` · `platform: 'IOS' \| 'ANDROID'` | `peakdaApi.schemas.ts` |
| 푸시 발송단 | **백엔드에 없음** — `POST /api/devices` 스펙만 존재, 일정 미정 | `BACKEND_API_REQUESTS.md` |

---

## Phase 0 — 전제 확정 (코드 전, 지금 병렬 시작)

- [ ] 프로덕션 **실도메인 확정** (vercel.app 프리뷰 말고 정식 도메인) — assetlinks·OAuth·`server.url` 이 전부 여기에 묶임
- [ ] 백엔드 확인: 푸시 인프라 **FCM 여부 + 일정** ([ANDROID_APP_DECISION.md](ANDROID_APP_DECISION.md) 92번). 발송단 없으면 Phase 3 차단
- [ ] **Google Play 개발자 계정 개설**
- [ ] **비공개 테스트 착수 준비** (테스터 12명 / 14일) — 리드타임이 가장 길어 지금 시작해야 안 밀림
- [ ] `appId` 확정 (예: `com.peakda.app`)

## Phase 1 — Capacitor 셸 골격 (앱이 뜨기만, ~1일)

- [x] `@capacitor/core` `@capacitor/cli` `@capacitor/android` 설치
- [x] `capacitor.config.ts` 작성: `appId`, `appName`, `server.url = https://실도메인`, `androidScheme: 'https'` (`CAPACITOR_SERVER_URL`로 주입, 실도메인 확정 대기)
- [x] `npx cap add android`
- [ ] 에뮬레이터/실기기 실행
- [ ] **검증 (go/no-go)** — 여기서 리스크를 초반에 털어낸다:
  - [ ] 앱이 실사이트를 로드하고 화면 전환이 정상
  - [ ] 카카오맵 렌더 정상
  - [ ] 소셜 로그인 왕복 성공
  - [ ] 로그인 후 쿠키 유지 (재요청에 인증 붙는지)
- [ ] 위가 깨지면 → A안(정적 번들) + 딥링크 규모 재산정으로 분기

## Phase 2 — 인증·지도 실기기 검증

- [ ] 카카오 개발자 콘솔 JS 키 도메인 허용 목록에 WebView 오리진(실도메인) 등록 확인
- [ ] 소셜 로그인이 Custom Tabs(외부 브라우저)로 열리고 앱 복귀 실패 시 → **조건부 대응**:
  - [ ] App Links(딥링크) 설정
  - [ ] 백엔드 OAuth redirect URI 에 앱 딥링크 추가 ([ANDROID_APP_DECISION.md](ANDROID_APP_DECISION.md) 3번)
- [ ] refresh/401 흐름이 WebView 에서도 동작 (`mutator/index.ts` 의 `window.location` 리디렉트 포함)

## Phase 3 — 푸시 (백엔드 FCM 대기 · 차단됨)

> 2026-08-19 개발 Swagger 확인: 디바이스 토큰 등록·해제와 알림 조회/읽음 API는 존재하지만
> FCM 발송 및 SSE 구독 엔드포인트는 노출되지 않음. 기술 문서의 `FCM or SSE` 결정 확인 필요.

- [ ] Firebase 프로젝트 생성 → `google-services.json` 안드로이드 앱에 배치
- [ ] `@capacitor/push-notifications` 도입
- [ ] 토큰 수신 → `registerDeviceApi({ token, platform: 'ANDROID' })` 배선
- [ ] 로그아웃 → `unregisterDeviceApi(token)` 배선
- [ ] **스키마 변경 불필요** — `platform: 'ANDROID'` 그대로 (A/TWA 와 달리 `WEB` enum 추가 안 함)
- [ ] 알림 권한 요청 UI (앱 첫 진입 또는 알림 설정 화면)
- [ ] 알림 탭 → 해당 라우트(알림 목록/상세)로 딥링크

## Phase 4 — Play 제출 준비

- [ ] 런처 아이콘 PNG 192 / 512 (현재 SVG 파비콘만 — 네이티브 아이콘에 필요)
- [ ] 네이티브 스플래시
- [x] **오프라인 폴백 화면** — `server.errorPath` 로 로컬 재시도 화면 제공
- [ ] 서명 키(keystore) 생성 및 보관
- [x] AAB 빌드 명령 및 unsigned release 번들 검증 (서명 설정은 별도)

## Phase 5 — 릴리스

- [ ] 내부 테스트 트랙 업로드
- [ ] 비공개 테스트 (12명 / 14일)
- [ ] 프로덕션 심사 제출

---

## 차단 요인 / 리스크

1. **푸시 발송단 부재** — Phase 3 전면 차단. 백엔드 FCM 일정 확인이 선행 ([ANDROID_APP_DECISION.md](ANDROID_APP_DECISION.md) 104번: FCM 은 프런트 추측)
2. **실도메인 미확정** — Phase 0~1 못 시작
3. **Play 14일 비공개 테스트** — 착수 늦으면 그대로 밀림
4. **`server.url` 프로덕션 사용** — Capacitor 공식은 비권장(원래 live-reload 용). Phase 1 실기기 검증이 실사용 가능 여부를 조기에 판정하는 안전장치
5. **오프라인 / Play 최소기능** — B안의 대표 약점. Phase 4 폴백 화면으로 완화

## 다음 행동

가장 단순한 첫 수는 **Phase 1 을 실제로 돌려 로그인·지도가 WebView 에서 되는지 확인**하는 것. 되면 B안 확정, 안 되면 A안 규모 산정으로 넘어간다.
