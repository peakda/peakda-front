# Capacitor 푸시 후속 작업

백엔드 답변과 Firebase 설정을 받은 뒤 실행할 작업만 관리한다.
클라이언트 권한 요청, FCM 토큰 등록·해제, 포그라운드 알림 갱신, 알림 탭 시 유형별 내부 경로 라우팅은 구현 완료했다.

## 필요한 입력

- [ ] 확정된 Android 패키지 ID
- [ ] 해당 패키지 ID로 발급한 환경별 `google-services.json`
- [ ] **Firebase 서비스 계정 키** — 2026-08-20 기준 아직 미발급, 발급되는 대로 공유 예정. 이게 나와야 백엔드 발송 어댑터가 켜진다
- [x] FCM 직접 발송 또는 AWS SNS 경유 여부 — **Firebase Admin SDK 직접 발송**
- [x] 푸시 payload 예시와 필드 규격 — `notification: { title, body }`, `data: { notificationId, type, linkType, targetId, linkUrl }` (상세는 [BACKEND_API_REQUESTS.md](BACKEND_API_REQUESTS.md) 참고)
- [x] 알림 `type` 전체 목록과 각 유형의 이동 대상 — `TIMING`(spotId) / `FOLLOW`(userId) / `REACTION`(recordId) / `NOTICE`(관리자 지정값, 없으면 linkUrl). 4종 전부 서버 구현 완료
- [x] 토큰 갱신·만료·발송 실패 시 서버 처리 정책 — 재등록 시 소유자/플랫폼 갱신(멱등), 10개 상한, 탈퇴 시 전량 삭제. 실패 기반 정리는 FCM 연결 시 함께 추가 예정
- [x] 로그아웃 시 `DELETE /api/devices/{token}`의 수신 해제 보장 여부 — **보장됨, 단 로그아웃 API보다 먼저 호출해야 함**(인증 필요 API라 쿠키 만료 후 401)
- [x] SSE 병행 여부 — **병행 안 함.** 포그라운드 뱃지는 `GET /api/notifications/unread-count` 폴링으로 확정

## 입력을 받은 뒤 구현

- [ ] `google-services.json`을 `android/app/`에 로컬 배치하고 Git에는 커밋하지 않는다.
- [ ] `pnpm cap:sync` 후 Android 빌드가 Google Services 플러그인을 적용하는지 확인한다.
- [x] 백엔드 payload를 타입으로 정의한다 — `resolvePushNotificationTarget`(`src/lib/utils/notificationToAlarm.ts`)이 FCM `data`(전부 문자열)를 파싱해 `notificationId`·`link`를 반환한다.
- [x] 현재 `/notification` 고정 이동을 알림 유형별 내부 경로 매핑으로 교체한다 — `PushNotificationManager`가 탭 시 `resolvePushNotificationTarget`으로 라우팅하고, `notificationId`가 있으면 읽음 처리(`PATCH /api/notifications/{id}/read`)까지 호출한다. 파싱 실패 시에만 `/notification`으로 폴백.
- [x] 외부 URL이 허용된다면 신뢰 가능한 `https:` URL만 여는 검증을 추가한다 — `toNotificationHref`가 `http(s)`만 통과시킨다(기존 리스트 화면 로직 재사용).
- [x] 로그아웃 순서를 `DELETE /api/devices/{token}` → 로그아웃 API 순으로 맞춘다(백엔드가 이 순서를 요구함 — 반대로 하면 401) — `LogoutDrawerContent.tsx`가 이미 `stopPushNotifications()`를 `logoutApi()`보다 먼저 호출한다. 우연히 요구 순서와 일치했다.
- ~~SSE를 병행한다면 앱 실행 중 목록·읽지 않은 개수 갱신을 연결한다~~ — SSE 병행 안 하기로 확정, 폴링으로 대체(구현 필요 시 별도 항목으로).

## 실기기 검증

- [ ] Android 13 이상에서 최초 권한 요청, 허용, 거부를 각각 확인한다.
- [ ] 로그인 후 `POST /api/devices`에 FCM 토큰과 `ANDROID`가 저장되는지 확인한다.
- [ ] 앱 포그라운드·백그라운드·종료 상태에서 알림을 수신한다.
- [ ] 알림을 눌렀을 때 유형별 대상 화면으로 이동한다.
- [ ] 토큰 갱신 후 새 토큰으로 서버 등록이 갱신되는지 확인한다.
- [ ] 로그아웃 후 해당 기기에서 더 이상 사용자 알림을 받지 않는지 확인한다.
- [ ] 네트워크 실패 후 재실행 시 토큰 등록이 복구되는지 확인한다.

## 완료 조건

- 실제 백엔드 이벤트 한 건 이상으로 발송부터 대상 화면 이동까지 성공한다.
- 로그아웃 계정으로 푸시가 전달되지 않는다.
- `google-services.json`과 Firebase 서비스 계정 키가 Git 이력에 포함되지 않는다.
