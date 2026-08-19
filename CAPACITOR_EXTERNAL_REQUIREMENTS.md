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
- [ ] 카카오·네이버 OAuth의 현재 웹 callback이 Android WebView에서도 왕복하는지 실기기 확인
- [ ] 외부 브라우저로 이탈해 앱 복귀가 안 될 경우 App Links 도입 여부 결정
- [ ] App Links가 필요하면 백엔드 OAuth redirect URI와 각 소셜 콘솔 설정 변경

## P0 — 푸시 구현 전 백엔드 답변 필요

기술 문서에는 `푸시 알림 발송 (FCM) or SSE`로 적혀 있다. SSE는 앱이 실행 중일 때
목록·뱃지를 갱신할 수 있지만, Android 앱이 백그라운드이거나 종료된 상태의 OS 알림을
대체할 수 없다. 모바일 푸시를 제공하려면 FCM 경로가 필요하다.

- [ ] 모바일 백그라운드 알림을 FCM으로 제공하는지 확정
- [ ] Firebase Admin SDK에서 FCM을 직접 호출하는지, AWS SNS Mobile Push를 거치는지 확정
- [ ] SSE를 병행한다면 구독 URL, 인증 방식, 재연결 정책, 이벤트 스키마 제공
- [ ] `POST /api/devices`에 저장된 토큰을 발송단이 소비하기 시작하는 일정 공유
- [ ] FCM 토큰 갱신·만료·발송 실패 시 서버의 비활성화/삭제 정책 공유
- [ ] 로그아웃 시 `DELETE /api/devices/{token}`만으로 수신 해제가 보장되는지 확인
- [ ] 푸시 payload 규격 제공
  - 알림 ID
  - `type`
  - 내부 이동 대상 ID 또는 경로
  - 외부 URL 여부
- [ ] 알림 생성 이벤트 범위 확정
  - 개화 타이밍
  - 팔로우
  - 리액션
  - 공지

현재 개발 Swagger에는 다음 API만 확인된다.

- `POST /api/devices`
- `DELETE /api/devices/{token}`
- `GET /api/notifications`
- `GET /api/notifications/unread-count`
- `PATCH /api/notifications/{id}/read`
- `PATCH /api/notifications/read-all`

FCM 발송 구현과 SSE 구독 엔드포인트는 Swagger에 노출되어 있지 않다.

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

## 백엔드 전달용 짧은 질문

> Android 앱은 Capacitor 네이티브 FCM 토큰을 기존 `POST /api/devices`에
> `platform: ANDROID`로 등록할 예정입니다. 모바일 백그라운드 알림을 FCM으로
> 확정할 수 있는지, 직접 FCM 발송인지 AWS SNS 경유인지, 토큰 만료 처리와 푸시
> payload 규격은 무엇인지 알려주세요. SSE도 병행한다면 구독 URL·인증·이벤트
> 스키마를 함께 부탁드립니다.
