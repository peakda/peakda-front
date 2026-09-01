# Capacitor Android 외부 입력 및 백엔드 확인 사항

프런트 코드만으로 결정하거나 검증할 수 없는 항목을 한곳에 정리한다. 아래 항목이
확정되기 전까지 현재 Android 셸은 로컬 안내 화면과 unsigned 빌드까지만 보장한다.

## P0 — 실사이트 실행 전 필수

### 서비스·운영

- [ ] **정식 프런트 오리진 확정**
  - 필요한 값: 경로가 없는 HTTPS 오리진 하나(예: `https://app.example.com`)
  - 사용처: `CAPACITOR_SERVER_URL`, 카카오 JavaScript 키 허용 도메인, OAuth 설정
  - 확인 담당: 서비스 운영/프런트 배포 담당
- [ ] **Android 패키지 ID 확정**
  - 현재 임시값: `com.peakda.app`
  - Play Console 앱 생성과 Firebase Android 앱 등록 전에 확정해야 한다.
  - 변경 시 `capacitor.config.ts`, Android namespace/application ID, Java 패키지를 함께 바꿔야 한다.
- [ ] **Google Play 개발자 계정 및 앱 소유 주체 확정**
  - 개인/조직 계정, 결제 주체, 콘솔 관리자와 릴리스 담당자를 정한다.
  - 비공개 테스트 인원·기간 등 실제 적용 요건은 계정 생성 시 Play Console 안내로 재확인한다.

### 인증·지도

- [ ] 카카오 개발자 콘솔 JavaScript 키 허용 목록에 정식 프런트 오리진 등록
- [x] 카카오·네이버 OAuth의 현재 웹 callback이 Android WebView에서도 왕복하는지 실기기 확인 — **2026-08-20 백엔드 회신: 지금 구조로는 안 됨.** 성공 핸들러가 웹 URL 한 곳으로만 리다이렉트하고, 인증이 HttpOnly 쿠키 전용이라 Custom Tab에서 받은 쿠키가 앱 WebView로 안 넘어온다. 딥링크로 돌아와도 앱엔 세션이 없다.
- [x] 외부 브라우저로 이탈해 앱 복귀가 안 될 경우 App Links 도입 여부 결정 — **App Links가 아니라 일회성 코드 교환 방식으로 결정.** Custom Tab 인증 → `peakda://auth/callback?code=...` 로 복귀 → 앱이 `POST /api/auth/app/token`으로 code를 교환 → 이후 Bearer 헤더로 호출. refresh는 `POST /api/auth/app/token/refresh`를 사용한다.
- [ ] App Links가 필요하면 백엔드 OAuth redirect URI와 각 소셜 콘솔 설정 변경 — 코드 교환 방식 확정 시 재검토
- [x] 네이버 개발자센터 앱은 백엔드에서 관리. dev callback: `https://api-dev.peakda.com/login/oauth2/code/naver`, `https://api-dev.peakda.com/login/oauth2/code/kakao`. 운영 도메인 확정 시 동일 패턴으로 추가 등록 예정
- [x] 애플 로그인은 **미지원 확정** — 추후 구글 로그인으로 교체 예정. `SocialLoginBtns`의 애플 버튼은 당분간 무반응 상태로 둔다([UX_BACKLOG.md](UX_BACKLOG.md) 1번)

**앱 전용 로그인은 `/oauth2/authorization/{provider}?client=app`으로 시작한다.** 웹은 기존 쿠키 방식(`/oauth2/authorization/{provider}` 직행)을 유지하며, Android는 Custom Tab·딥링크·Bearer 토큰 교환 경로를 사용한다.

## P0 — 푸시 구현 전 백엔드 답변 필요 (2026-08-20 회신 받음)

기술 문서에는 `푸시 알림 발송 (FCM) or SSE`로 적혀 있었다. 아래는 회신 결과 — 원 질문과 상세 답변 원문은 [BACKEND_API_REQUESTS.md](BACKEND_API_REQUESTS.md) 참고.

- [x] 모바일 백그라운드 알림을 FCM으로 제공하는지 확정 — **FCM 확정**
- [x] Firebase Admin SDK에서 FCM을 직접 호출하는지, AWS SNS Mobile Push를 거치는지 확정 — **Firebase Admin SDK 직접 발송**
- [x] SSE를 병행한다면 구독 URL, 인증 방식, 재연결 정책, 이벤트 스키마 제공 — **SSE 병행 안 함.** 포그라운드 뱃지는 `GET /api/notifications/unread-count` 폴링
- [ ] `POST /api/devices`에 저장된 토큰을 발송단이 소비하기 시작하는 일정 공유 — 알림 생성→토큰 조회→발송 호출은 연결됨, **발송 어댑터만 스텁** (Firebase 서비스 계정 키 발급 대기, 일정 미정)
- [x] FCM 토큰 갱신·만료·발송 실패 시 서버의 비활성화/삭제 정책 공유 — 토큰은 유니크(재등록 시 소유자/플랫폼 갱신, `onNewToken`마다 멱등 POST), 사용자당 10개 상한, 탈퇴 시 전량 삭제. 실패 기반 정리(`UNREGISTERED`/`INVALID_ARGUMENT` 즉시 삭제, 5xx는 재시도 후 유지)는 FCM 연결 시 같이 추가
- [x] 로그아웃 시 `DELETE /api/devices/{token}`만으로 수신 해제가 보장되는지 확인 — **보장됨.** 단 로그아웃 API보다 반드시 먼저 호출(쿠키 만료 후 401 남), 실패해도 다음 사용자 로그인 시 소유자가 넘어가 오배송 없음
- [x] 푸시 payload 규격 제공 — `notification: { title, body }`, `data: { notificationId, type, linkType, targetId, linkUrl }`. `targetId`는 `type`별로 다름(TIMING=spotId, FOLLOW=userId, REACTION=recordId, NOTICE=관리자 지정값 or linkUrl). `GET /api/notifications` 응답과 같은 필드 세트
- [x] 알림 생성 이벤트 범위 확정 — **4종 전부 구현됨**: TIMING(매일 08시, 찜한 명소 만개 예상일 내일~+7일), FOLLOW, REACTION, NOTICE(백오피스 전체 발송)

현재 개발 Swagger에는 다음 API만 확인된다.

- `POST /api/devices`
- `DELETE /api/devices/{token}`
- `GET /api/notifications`
- `GET /api/notifications/unread-count`
- `PATCH /api/notifications/{id}/read`
- `PATCH /api/notifications/read-all`

FCM 발송 구현과 SSE 구독 엔드포인트는 Swagger에 노출되어 있지 않다(SSE는 애초에 안 함이 확정됐으므로 앞으로도 노출되지 않을 예정).

## P0 — Firebase 담당자 입력

- [ ] Firebase 프로젝트 생성 주체와 관리자 확정
- [ ] 개발/운영 Firebase 프로젝트를 분리할지 결정
- [ ] 확정된 패키지 ID로 Android 앱 등록
- [ ] 환경별 `google-services.json` 전달
- [ ] 서비스 계정 키는 백엔드 또는 CI 비밀 저장소에서만 관리하고 프런트 저장소에는 전달하지 않기

## P1 — 디자인·스토어 자료

- [ ] Adaptive launcher icon 원본
  - 전경 레이어
  - 배경색 또는 배경 레이어
  - Play 스토어용 512×512 PNG
- [ ] 네이티브 스플래시 원본과 배경색
- [ ] 스토어 스크린샷과 feature graphic
- [ ] 앱 이름, 짧은 설명, 전체 설명 최종 문구

현재 저장소의 Android 아이콘과 스플래시는 Capacitor 기본 플레이스홀더다.

## P1 — 릴리스·보안 결정

- [ ] 업로드 키/keystore 생성 담당자와 보관 위치 확정
- [ ] 키 alias 및 비밀번호를 GitHub Actions secrets로 관리할지 결정
- [ ] Play App Signing 사용 여부 확정
- [ ] 개인정보처리방침 공개 URL 확정
- [ ] Play 데이터 보안 설문에 포함할 수집·공유 항목 확인
- [ ] 앱 버전 정책 확정
  - `ANDROID_VERSION_CODE`: Play 업로드마다 증가하는 정수
  - `ANDROID_VERSION_NAME`: 사용자에게 표시할 버전

## 실기기 인수 조건

정식 오리진과 테스트 계정이 준비되면 아래 항목을 확인한다.

- [ ] 앱 실행과 페이지 전환
- [ ] 카카오맵 렌더링, 마커 터치, 현재 위치
- [ ] 일반 로그인 및 카카오·네이버 로그인 왕복
- [ ] 앱 재실행 후 로그인 쿠키 유지
- [ ] 401 refresh 후 원래 요청 재시도
- [ ] 사진 선택·촬영·업로드
- [ ] Android 뒤로가기와 외부 링크
- [ ] 네트워크 단절 시 로컬 오류 화면과 재시도
- [ ] 다양한 화면 크기, 시스템 글꼴 크기, 다크 모드
- [ ] FCM 확정 후 권한 요청, 토큰 등록, 알림 수신, 알림 탭 이동

## 백엔드 전달용 질문 (2026-08-20 회신 받음 — 기록용 원문)

회신 요약은 위 체크리스트와 [BACKEND_API_REQUESTS.md](BACKEND_API_REQUESTS.md)의 모바일 푸시 절 참고. 아래는 당시 보낸 원문이다.

> 안녕하세요, Android 앱(Capacitor) 작업 중이라 백엔드 확인이 필요한 것들 정리해서 보냅니다.
>
> **[푸시]** Android 앱은 Capacitor 네이티브 FCM 토큰을 기존 `POST /api/devices`에
> `platform: ANDROID`로 등록할 예정입니다.
>
> 1. 모바일 백그라운드 알림을 FCM으로 발송하나요? (SSE만으로는 앱 종료 상태의 OS 알림을 대체할 수 없어서요)
> 2. 발송 경로는 Firebase Admin SDK 직접 발송인가요, AWS SNS Mobile Push 경유인가요?
> 3. 저장된 디바이스 토큰을 실제 발송에 사용하기 시작하는 일정이 언제쯤일까요?
> 4. 토큰 갱신·만료·발송 실패(`UNREGISTERED` 등) 시 서버의 비활성화/삭제 정책은 무엇인가요?
> 5. 로그아웃 시 `DELETE /api/devices/{token}` 호출만으로 수신 해제가 보장되나요?
> 6. 푸시 payload 규격을 부탁드립니다 — 알림 ID, `type`, 이동 대상 ID 또는 경로, 외부 URL 여부.
>    (알림 탭 시 앱 내 어디로 보낼지 프런트가 이 값으로 분기합니다)
> 7. 알림 발생 범위는 개화 타이밍·팔로우·리액션·공지 중 어디까지인가요?
> 8. SSE도 병행한다면 구독 URL, 인증 방식, 재연결 정책, 이벤트 스키마를 부탁드립니다.
>
> **[소셜 로그인]** 현재 프런트는 카카오만 연결돼 있고, 백엔드 도메인의
> `/oauth2/authorization/kakao` 로 직행하는 방식입니다.
> (프런트 Vercel · 백엔드 AWS 도메인이 달라 프록시를 거치면 OAuth 세션 쿠키가 끊겨서요)
>
> 9. `/oauth2/authorization/naver` (와 apple)도 동일하게 열려 있나요? swagger의 `provider`
>    enum에는 `KAKAO / NAVER / APPLE` 이 모두 있는데 실제 사용 가능한 상태인지 확인 부탁드립니다.
> 10. 열려 있다면 네이버 개발자센터 앱은 백엔드에서 관리 중인가요? 등록된 callback URL 도 알려주세요.
> 11. 콜백 후 프런트로 돌아오는 리다이렉트 대상과 신규/기존 유저 분기가 카카오와 동일한가요?
>     (프런트는 `/auth/callback` 에서 `/auth/me` 200이면 `/map`, 401이면 `/Terms` 로 보내고 있습니다)
> 12. Android WebView에서도 이 왕복이 되는지 아직 실기기 확인 전인데, 혹시 외부 브라우저로
>     이탈하는 케이스가 알려진 게 있을까요?
>
> 1·2·6번은 앱 푸시 구현 착수에 바로 필요하고, 9~11번은 로그인 버튼 연결에 필요합니다.
> 나머지는 일정 참고용이라 여유 있게 주셔도 됩니다.

소셜 로그인 관련 프런트 현황 근거 (2026-08-20 기준 최신화)

- `src/lib/auth/socialLogin.ts` — 백엔드 OAuth 직행 방식과 그 이유, 카카오·네이버 둘 다 연결됨
- `src/app/login/_components/SocialLoginBtns.tsx` — 애플 버튼만 핸들러 없음(미지원 확정, 추후 구글로 교체 예정)
- `src/app/auth/callback/page.tsx` — `/auth/me` 응답으로 기존(`/map`)·신규(`/Terms`) 분기
- `swagger.json` — `provider` enum에 `KAKAO / NAVER / APPLE`
