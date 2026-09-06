# TODO — Google Play 출시

최종 갱신: 2026-09-06

출시까지 남은 일과 확인된 사실을 모아둔다. 완료된 항목은 근거(파일·명령·측정값)를 함께 적어
"됐다고 들었다"와 "확인했다"를 구분한다.

---

## 1. 지금 막고 있는 것

### 🔴 카카오 로그인 실패 — 백엔드

**증상.** 로그인 시 401. 새로고침하면 통과하는데 도착지가 옛 Vercel 주소다.

```
1차: https://api.peakda.com/login/oauth2/code/kakao?code=...&state=...
     {"status":401,"code":"UNAUTHORIZED","message":"인증이 필요합니다."}
새로고침 후: https://peakda.vercel.app/Terms   ← www.peakda.com 이 아님
```

브라우저로 2회 재현했고 2회 모두 동일했다.

**확인된 사실**

- 백엔드의 로그인 성공 리다이렉트 대상이 `peakda.vercel.app` 이다 (화면에 찍힌 결과)
- 세션 쿠키에 `Secure` 도 `SameSite` 도 없다 — `Set-Cookie: JSESSIONID=...; Path=/; HttpOnly`
- `www.peakda.com` ↔ `api.peakda.com` 은 같은 사이트라 지금은 동작하지만,
  `peakda.vercel.app` 은 다른 사이트라 쿠키가 붙지 않는다. 안드로이드 WebView 도 같은 조건이다
- 프런트가 만드는 요청은 정상이다. `client_id`, `scope`, `state`, `redirect_uri` 모두 맞다

  ```
  GET https://api.peakda.com/oauth2/authorization/kakao
  -> 302 https://kauth.kakao.com/oauth/authorize
         ?client_id=...&scope=profile_image account_email
         &redirect_uri=https://api.peakda.com/login/oauth2/code/kakao
  ```

**백엔드에 요청할 것**

- [ ] OAuth2 성공·실패 리다이렉트 URL 을 `peakda.vercel.app` → `https://www.peakda.com` 으로 변경
- [ ] 인증 쿠키에 `SameSite=None; Secure` 부여 (앱 WebView 에 필요)
- [ ] 1차 콜백 401 원인 확인 — 로그에서 `state` 조회 실패 여부, 세션 저장소 공유 여부

> 401 의 내부 원인은 밖에서 특정할 수 없다. `api.peakda.com` 이 IP 2개
> (`54.116.225.58`, `13.124.207.80`)로 물려 있고 sticky 쿠키(`AWSALB`)가 안 보이는 점은
> 후보지만, 단일 IP 로 고정해도 재현돼 이것만으로는 설명되지 않는다.

---

## 2. 오늘 배포 예정 (2026-09-06)

| 항목 | 담당 | 배포 후 프런트 작업 |
| --- | --- | --- |
| 로그인 수정 | 백엔드 | 브라우저로 재검증 (아래 절차) |
| 피드 `photos` 배열 | 백엔드 | `pnpm generate:api` → 임시 타입 제거 |
| FCM (`google-services.json`) | Firebase 콘솔 | 파일 배치 → 재빌드 |

### 로그인 재검증 절차

1. `https://peakda.com` → `/login` → **카카오로 시작하기**
2. 401 없이 한 번에 통과하는가
3. 도착지가 `www.peakda.com` 인가 (`peakda.vercel.app` 이면 미해결)
4. 새로고침 없이 되는가

### 피드 `photos` 후속

배포 확인:

```bash
curl -s https://api-dev.peakda.com/v3/api-docs/05-feed | grep -o '"photos"'
```

나오면:

```bash
pnpm generate:api
```

그다음 `src/lib/utils/spotRecordToFeed.ts` 의 임시 확장을 지우고 생성 타입을 직접 쓴다.

```ts
// 지울 대상
type SummaryWithPhotos = SpotRecordSummaryResponse & { photos?: PhotoEntry[] }
```

> 현재 코드는 `photos` 가 없어도 `coverPhoto` 로 폴백하므로 백엔드보다 먼저 배포해도 안전하다.
> 작성 시점 `api-dev` 에는 아직 `photos` 가 없다.

### FCM 후속

`google-services.json` 을 `android/app/` 에 넣고 재빌드하면 끝이다. **프런트 코드 수정은 없다.**

- Firebase 안드로이드 앱 등록 시 패키지 이름은 **`com.peakda.app`** — 오타 시 토큰이 발급되지 않는다
- 이 파일은 커밋해도 된다. APK 에 그대로 들어가는 값이라 비밀이 아니다
- **서비스 계정 키는 백엔드 전용이다. 프런트 저장소에 넣지 않는다**

---

## 3. 프런트 상태

### 완료

- [x] 앱 뒤로가기 처리 — `NativeBackButton`. 이전 화면이 있으면 `history.back()`,
      없으면 2초 안에 한 번 더 누를 때 종료
      (`@capacitor/app` 은 리스너가 없으면 뒤로가기를 삼킨 뒤 아무것도 하지 않는다)
- [x] 스플래시 흰 화면 — `NativeSplash` 가 첫 프레임 직후 `hide()` 호출,
      `launchShowDuration` 은 3000 으로 상한선만 남김
      (`www.peakda.com` 콜드 응답 실측 1922ms, 워밍 후 ~150ms)
- [x] 피드 목록 사진 전체 노출 — PR #50, 백엔드 배포 전후 모두 동작
- [x] 위치 권한 선언 — 지도 "현재 위치" 는 WebView `navigator.geolocation` 을 쓴다
- [x] 푸시 토큰 등록 연동 — 코드는 완성. `google-services.json` 만 있으면 동작
- [x] `NEXT_PUBLIC_API_URL` 프로덕션 값 `https://api.peakda.com` (라이브 청크에서 확인)

### 확인 안 된 것 (실기기 필요)

- [ ] 뒤로가기 2단계 동작 (토스트 → 종료)
- [ ] 콜드 스타트에 흰 화면이 끼지 않는지
- [ ] 카카오맵 렌더링·마커 터치·현재 위치
- [ ] 로그인 왕복, 앱 재실행 후 세션 유지, 401 refresh 재시도
- [ ] 사진 선택·촬영·업로드
- [ ] 네트워크 단절 시 `error.html` 폴백과 재시도
- [ ] 푸시 권한 요청 → 토큰 등록 → 알림 수신 → 탭 이동
- [ ] 다양한 화면 크기, 시스템 글꼴 크기

---

## 4. AAB / 네이티브

현재 산출물은 **네이티브 기준 최신**이다.

```
android/app/build/outputs/bundle/release/app-release.aab
4,767,193 bytes
jar verified.
CN=Peakda, O=Peakda, L=Seoul, C=KR
SHA1 53:A5:22:39:AF:E3:9F:8C:EF:64:29:06:98:44:C2:77:D4:16:B1:79
```

| 항목 | 값 |
| --- | --- |
| appId | `com.peakda.app` |
| server.url | `https://www.peakda.com` |
| launchShowDuration | 3000 |
| versionName / versionCode | 0.1.0 / 1 |

### 빌드 방법 (PowerShell)

```powershell
$env:CAPACITOR_SERVER_URL='https://www.peakda.com'
pnpm cap:sync
cd android; .\gradlew.bat bundleRelease
```

- Git Bash 에서 `pnpm android:build:bundle` 은 `gradlew.bat` 을 못 찾아 실패한다
- `CAPACITOR_SERVER_URL` 없이 실행하면 검증 스크립트가 먼저 죽어 **AAB 가 아예 안 나온다**
  (unsigned 로 나오는 게 아니다)
- 업로드 키는 `~/.gradle/gradle.properties` 에서 주입한다. 저장소에 키·비밀번호를 두지 않는다

### 재빌드가 필요한 때 / 아닌 때

앱은 실행 시마다 `https://www.peakda.com` 을 불러온다. **화면·기능 변경은 웹 배포만으로 반영된다.**

| 변경 | 재빌드 |
| --- | --- |
| 화면·기능·React 코드 | 불필요 — Vercel 배포만 |
| 아이콘, 스플래시, 권한, `capacitor.config.ts`, 플러그인, `google-services.json`, versionCode | 필요 |

**versionCode 1 은 첫 업로드용이다. 한 번 올린 뒤에는 `ANDROID_VERSION_CODE=2` 이상으로 빌드한다.**

---

## 5. 스토어 등록

로그인과 무관하므로 **지금 병렬로 진행 가능하다.**

- [ ] 스크린샷, feature graphic
- [ ] 앱 이름 / 짧은 설명(80자) / 전체 설명(4000자)
- [ ] 데이터 보안 설문 — **위치 수집을 반드시 신고한다** (권한을 선언했다)
- [ ] 콘텐츠 등급 설문
- [x] 스토어 아이콘 512 — `android/store/play-icon-512.png`
- [x] 개인정보처리방침 URL — `https://www.peakda.com/Terms/privacy-policy` (200, 공개 확인)
      위치 관련은 `https://www.peakda.com/Terms/location-policy`

### 트랙별 진행 판단

| 트랙 | 지금 | 이유 |
| --- | --- | --- |
| 내부 테스트 | 올려도 됨 | 심사 없음. 등록정보 채우고 흐름 익히는 용도 |
| 비공개 테스트 (12명/14일) | **대기** | 로그인이 깨져 있어 테스터가 아무것도 못 한다 |
| 프로덕션 심사 | 불가 | 리뷰어가 로그인부터 막힌다 |

> 12명/14일 요건은 **개인 개발자 계정**에만 적용된다. 사업자(조직) 계정이면 해당 없다.
> 어느 쪽으로 만들었는지 확인이 필요하다.

### AAB 전달 시 같이 줄 것

키스토어와 비밀번호는 **넘기지 않는다.** AAB 는 이미 서명이 끝나 업로드만 하면 된다.

```
파일: app-release.aab
패키지 ID: com.peakda.app     ← 업로드 순간 영구 고정
versionName 0.1.0 / versionCode 1
서명: 업로드 키 서명 완료. Play 앱 서명 사용

권한 (데이터 보안 설문용)
- INTERNET
- ACCESS_COARSE_LOCATION / ACCESS_FINE_LOCATION → 지도 "현재 위치"
- POST_NOTIFICATIONS → 알림
* GPS required=false 라 GPS 없는 기기도 설치 가능

개인정보처리방침: https://www.peakda.com/Terms/privacy-policy
```

---

## 6. 결정된 것

- [x] 도메인 — `peakda.com`. **앱 서버 URL 은 `https://www.peakda.com`** 을 쓴다.
      apex 는 www 로 308 리다이렉트되며 Vercel 이 www 를 canonical 로 잡는다.
      apex 를 쓰면 실행할 때마다 리다이렉트를 한 번 더 타고 최종 origin 도 어차피 www 다
- [x] 패키지 ID — `com.peakda.app`
- [x] Play 개발자 계정 생성
- [x] 업로드 키 생성·백업, 저장소 밖 보관
- [x] **네이버 로그인은 이번 출시에서 제외** — `SocialLoginBtns.tsx` 에서 버튼이 주석 처리돼
      UI 에 노출되지 않는다. 다른 진입점은 없다. 추가 작업 불필요

## 7. 결정 대기

- [ ] Firebase 프로젝트 생성·관리 주체, 개발/운영 분리 여부
- [ ] 업로드 키를 GitHub Actions secrets 로 관리할지
- [ ] 버전 정책 — versionCode 수동 증가 vs CI 자동 증가

---

## 8. 알아둘 것

- **`src/lib/naver/naverLogin.ts` 는 아무데서도 임포트하지 않는 사용되지 않는 파일이다.**
  로그인은 `src/lib/auth/socialLogin.ts` 를 쓴다. 네이버를 되살릴 때 헷갈리지 않도록 기록해둔다
- 원격 저장소 Dependabot 경고 90건 (high 40, moderate 42, low 8). 출시 블로커는 아니다
- FCM 실제 발송은 백엔드 스텁 상태다. `google-services.json` 을 넣어도
  **토큰 등록까지만 동작하고 알림은 오지 않는다.** 발송에는 서비스 계정 키가 필요하다
