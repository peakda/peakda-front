## 프로젝트 컨텍스트

- 서비스명: Peakda — 계절 여행 타이밍 안내 (벚꽃·단풍 등 20여 개 명소 실시간 개화 상태)
- 패키지 매니저: pnpm · 배포: Vercel

## 자주 쓰는 명령어

```bash
pnpm dev               # 개발 서버
pnpm typecheck         # 타입 체크
pnpm lint              # 린트
pnpm test              # vitest (전체)
pnpm test <경로>       # 특정 파일만 (예: pnpm test src/lib/utils/feed.test.ts)
pnpm validate:context  # context 문서 경로 검증 (CI에서도 실행)
```

## 작업 원칙

1. **먼저 생각하기** — 가정은 명시, 핵심 정보 없으면 질문, 해석이 여러 개면 모두 제시. 구현 방식만 다르면 옵션 제시 후 가장 단순한 안을 기본값으로 제안.
   예) TourAPI 응답 구조 불명확 → 확인 후 진행 / 카카오맵 마커 클릭 처리 여러 방식 → 옵션 제시 후 결정 요청 / 필터 상태를 URL vs Zustand 모호 → 질문 후 진행
2. **단순함 우선** — 요청한 것만 구현. 불필요한 추상화·유연성·미래 대비 코드 금지. "시니어가 보면 과하다고 할까?" → Yes면 단순화.
3. **최소 변경** — 꼭 필요한 것만 수정. 안 깨진 코드 리팩토링 금지, 기존 스타일 따름. 내 변경으로 안 쓰게 된 import/변수/함수만 정리.
4. **목표 기반 실행** — 작업을 검증 가능한 기준으로 변환 (예: 필터 추가 → 마커가 필터링되어야 함). 여러 단계 작업은 계획 먼저 제시.

## 코드 작성 원칙

- TypeScript strict 모드 준수, any 사용 금지
- 함수형 컴포넌트 + hooks 패턴만 사용
- 컴포넌트 props는 interface로 명시적 타입 정의
- 불필요한 useEffect 지양, 서버 컴포넌트 우선 고려

## 컴포넌트 규칙

- named export 사용 (default export 금지)
  - 예외: Next.js 가 요구하는 라우트 파일(`page`·`layout`·`loading`·`error`·`not-found`·`global-error`·`opengraph-image`·`robots`·`sitemap`)은 default export
- props interface는 컴포넌트명 + Props로 명명
  예) ButtonProps, SpotCardProps
- 'use client' 는 꼭 필요한 경우만 최하위 컴포넌트에 선언
- 아이콘만 있는 버튼에는 `aria-label`을 붙인다 — Mixpanel 자동 수집이 이 값으로 버튼을 구분한다 ([docs/ANALYTICS_EVENTS.md](docs/ANALYTICS_EVENTS.md))

## 스타일 규칙

- Tailwind CSS v4 유틸리티 클래스 사용
- 인라인 style 속성 금지
- cn() 유틸로 조건부 클래스 처리
  예) cn('base-class', isActive && 'active-class')
- 디자인 토큰 변수 활용 (`src/app/globals.css`의 @theme 정의 참고)
  원본 토큰 값(색상 스케일, Text Style, Flower_colors)은 [docs/design-tokens.md](docs/design-tokens.md) — globals.css가 이 값을 미러링한다

## 상태 관리 규칙

- 서버 상태: TanStack Query (useQuery, useMutation)
- 클라이언트 전역 상태: Zustand
- 로컬 UI 상태: useState
- 폼 상태: useState + 수동 검증 (React Hook Form·Zod는 설치돼 있지 않다 — 폼이 복잡해져 도입할 때 이 줄을 갱신)

## API 호출 규칙

- 백엔드(AWS) API는 `src/api/mutator`의 `customInstance`를 통해 직접 호출한다.
  Why: 프런트(Vercel)와 도메인이 달라 크로스사이트 쿠키로 인증을 주고받기 때문에 Route Handler 프록시를 거치지 않는다 ([ARCHITECTURE.md](ARCHITECTURE.md), [MEMORY.md](MEMORY.md) 참고)
- `/app/api/` Route Handler는 백엔드 프록시 용도로 쓰지 않는다. 현재는 Sentry 알림 메일 → Discord 중계(`src/app/api/sentry-email-to-discord/route.ts`, [docs/SENTRY_DISCORD_ALERTS.md](docs/SENTRY_DISCORD_ALERTS.md)) 하나뿐이다
- TanStack Query로 캐싱. 전역 기본값은 `staleTime` 5분 + `retry`는 5xx·네트워크 오류만 1회(4xx는 재시도 안 함, `src/lib/utils/apiError.ts`의 `shouldRetryQuery`) (`src/app/_components/Providers.tsx`)
- **즉시 반영돼야 하는 데이터는 전역 5분을 따르지 말고 쿼리별로 분리한다** — 알림 목록/읽지 않은 알림 뱃지, 팔로우·팔로워 수, 차단 목록처럼 다른 사용자의 행동으로 바뀌는 값은 해당 파사드에서 `staleTime: 0`을 명시할 것. 전역값을 그대로 두면 최대 5분간 과거 데이터가 보인다.
  - 단, 내 행동으로 바뀌는 값(기록 작성·삭제, 좋아요 등)은 mutation 후 `invalidateQueries`가 staleTime과 무관하게 갱신하므로 따로 손댈 필요 없다.
- 서버 컴포넌트가 준 `initialData`(비로그인 기준)에 로그인별 상태(찜·알림·리액션)를 채워야 하면 `src/hooks/useSsrInitialQuery.ts`를 쓴다. `staleTime: isLoggedIn ? 0 : …`처럼 staleTime만 바꾸는 방식은 하이드레이션 직후 재요청이 일어나지 않는다(TanStack은 staleTime 변경만으로는 다시 fetch하지 않음).
- 에러 처리는 try/catch + 타입 가드로 처리

새 API 도메인을 추가할 때:

```bash
pnpm generate:api       # swagger 갱신 + orval 생성
pnpm generate:facades   # 없는 도메인만 파사드 스텁 생성
```

## 금지 사항

- any 타입 사용
- console.log (console.error, console.warn만 허용)
- 상대경로 import (../) — @/ 절대경로 사용
- 인라인 스타일
- default export (컴포넌트)
- `customInstance`(`src/api/mutator`)를 거치지 않는 임의의 fetch/axios 직접 호출
  - 예외(의도된 우회, 새로 늘리지 말 것): refresh 호출 자체(`src/api/mutator/index.ts`의 `runRefresh`), 네이티브 토큰 교환(`src/lib/auth/nativeAuth.ts` — mutator가 이 모듈에 의존해 순환), 로그인 콜백(`src/app/auth/callback/_components/AuthCallbackHandler.tsx` — 신규 유저의 401을 인터셉터가 로그인 시트로 가로채면 안 됨), Discord 웹훅 전송(`src/app/api/sentry-email-to-discord/route.ts` — 백엔드가 아닌 외부 서비스 호출)

## PR 작성 규칙

- 제목: [타입] 내용 — 예) [feat] 계절 타이밍 지도 마커 구현
- 타입: feat / fix / chore / refactor / style / docs
- 변경 사항, 테스트 방법 간략히 작성

## 문서 맵

| 문서 | 언제 보는가 |
| --- | --- |
| [ARCHITECTURE.md](ARCHITECTURE.md) | 데이터 흐름 (API 호출, 인증 refresh, 카카오맵, 상태 관리 계층) |
| [MEMORY.md](MEMORY.md) | **코드만 봐서는 알 수 없는 결정과 이유** — 작업 전 먼저 확인 |
| [src/CLAUDE.md](src/CLAUDE.md) | 디렉터리별 구조와 규칙 |
| [docs/design-tokens.md](docs/design-tokens.md) | Figma 디자인 토큰 원본 (색상 스케일, Text Style, Flower_colors) |
| [docs/BACKEND_API_REQUESTS.md](docs/BACKEND_API_REQUESTS.md) | **백엔드에 전달하는 요청서** — 요청 내용만. 백엔드와 공유하는 문서 |
| [docs/API_CHANGE_REQUESTS.md](docs/API_CHANGE_REQUESTS.md) | 위 요청들의 프론트 대응 현황과 경위 (내부용) |
| [docs/UNLINKED_ROUTES.md](docs/UNLINKED_ROUTES.md) | 생성됐지만 아직 화면에 연결되지 않은 라우트 목록 |
| [docs/TODO.md](docs/TODO.md) | **Google Play 출시(2026-10-01 프로덕션) 기록과 이후 남은 일** — 블로커, 담당, 실기기 체크리스트, 다음 네이티브 빌드 |
| [docs/UX_BACKLOG.md](docs/UX_BACKLOG.md) | 동작은 하지만 사용자 흐름이 어색해 고쳐야 하는 것 (보류 중인 건만) |
| [docs/ANALYTICS_EVENTS.md](docs/ANALYTICS_EVENTS.md) | GA4·Mixpanel 이벤트 사전 — 이벤트를 추가·변경할 때 함께 고친다 |
| [docs/ANDROID_APP_DECISION.md](docs/ANDROID_APP_DECISION.md) | Google Play 배포 방식(TWA vs Capacitor) 비교 기록 — **Capacitor 로 결정·구현됨** (`android/`, `capacitor.config.ts`) |
| [docs/CAPACITOR_FRONT_PLAN.md](docs/CAPACITOR_FRONT_PLAN.md) | Capacitor 안드로이드 앱 프론트 개발 계획/TODO |
| [docs/SEO_GEO_AUDIT.md](docs/SEO_GEO_AUDIT.md) | SEO·GEO 점검 보고서 + **9절: 검색엔진 등록·비로그인 모드 진행 현황과 남은 일** (외부 답변 대기 포함) |
| [docs/SENTRY_DISCORD_ALERTS.md](docs/SENTRY_DISCORD_ALERTS.md) | Sentry 알림 메일 → Gmail → Apps Script → Discord 중계 구성·설정·한계 |

## 버그 수정 시 설명

문제 원인 → 수정 내용 → 영향 범위 → 변경 파일, 4가지를 반드시 보고.

## 작업 완료 시

성공 기준 충족 여부, 추측이 포함된 부분, 검증하지 못한 부분을 명시.

## 구현 우선순위

동작하는 코드 > 읽기 쉬운 코드 > 재사용 가능한 코드 > 확장 가능한 코드. 확장성을 이유로 현재 요구사항을 복잡하게 만들지 않는다.
