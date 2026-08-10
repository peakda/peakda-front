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
- props interface는 컴포넌트명 + Props로 명명
  예) ButtonProps, SpotCardProps
- 'use client' 는 꼭 필요한 경우만 최하위 컴포넌트에 선언

## 스타일 규칙

- Tailwind CSS v4 유틸리티 클래스 사용
- 인라인 style 속성 금지
- cn() 유틸로 조건부 클래스 처리
  예) cn('base-class', isActive && 'active-class')
- 디자인 토큰 변수 활용 (`src/app/globals.css`의 @theme 정의 참고)
  원본 토큰 값(색상 스케일, Text Style, Flower_colors)은 [design-tokens.md](design-tokens.md) — globals.css가 이 값을 미러링한다

## 상태 관리 규칙

- 서버 상태: TanStack Query (useQuery, useMutation)
- 클라이언트 전역 상태: Zustand
- 로컬 UI 상태: useState
- 폼 상태: React Hook Form + Zod

## API 호출 규칙

- 백엔드(AWS) API는 `src/api/mutator`의 `customInstance`를 통해 직접 호출한다.
  Why: 프런트(Vercel)와 도메인이 달라 크로스사이트 쿠키로 인증을 주고받기 때문에 Route Handler 프록시를 거치지 않는다 ([ARCHITECTURE.md](ARCHITECTURE.md), [MEMORY.md](MEMORY.md) 참고)
- `/app/api/` Route Handler는 현재 없다. 새로 만들 일이 생겨도 백엔드 프록시 용도로는 쓰지 않는다
- TanStack Query로 캐싱. 전역 기본값은 `staleTime` 5분 + `retry` 1 (`src/app/_components/Providers.tsx`)
- **즉시 반영돼야 하는 데이터는 전역 5분을 따르지 말고 쿼리별로 분리한다** — 알림 목록/읽지 않은 알림 뱃지, 팔로우·팔로워 수, 차단 목록처럼 다른 사용자의 행동으로 바뀌는 값은 해당 파사드에서 `staleTime: 0`을 명시할 것. 전역값을 그대로 두면 최대 5분간 과거 데이터가 보인다.
  - 단, 내 행동으로 바뀌는 값(기록 작성·삭제, 좋아요 등)은 mutation 후 `invalidateQueries`가 staleTime과 무관하게 갱신하므로 따로 손댈 필요 없다.
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

## PR 작성 규칙

- 제목: [타입] 내용 — 예) [feat] 계절 타이밍 지도 마커 구현
- 타입: feat / fix / chore / refactor / style / docs
- 변경 사항, 테스트 방법 간략히 작성

## 문서 맵

| 문서 | 언제 보는가 |
| --- | --- |
| [ARCHITECTURE.md](ARCHITECTURE.md) | 데이터 흐름 (API 호출, 인증 refresh, 카카오맵, 상태 관리 계층) |
| [MEMORY.md](MEMORY.md) | **코드만 봐서는 알 수 없는 결정과 이유** — 작업 전 먼저 확인 |
| [src/CLAUDE.md](src/CLAUDE.md), [public/CLAUDE.md](public/CLAUDE.md) | 디렉터리별 구조와 규칙 |
| [design-tokens.md](design-tokens.md) | Figma 디자인 토큰 원본 (색상 스케일, Text Style, Flower_colors) |
| [API_CHANGE_REQUESTS.md](API_CHANGE_REQUESTS.md) | 백엔드에 요청한 API 변경 사항과 처리 상태 |
| [UNLINKED_ROUTES.md](UNLINKED_ROUTES.md) | 생성됐지만 아직 화면에 연결되지 않은 라우트 목록 |
| [UX_BACKLOG.md](UX_BACKLOG.md) | 동작은 하지만 사용자 흐름이 어색해 고쳐야 하는 것 (보류 중인 건만) |

## 버그 수정 시 설명

문제 원인 → 수정 내용 → 영향 범위 → 변경 파일, 4가지를 반드시 보고.

## 작업 완료 시

성공 기준 충족 여부, 추측이 포함된 부분, 검증하지 못한 부분을 명시.

## 구현 우선순위

동작하는 코드 > 읽기 쉬운 코드 > 재사용 가능한 코드 > 확장 가능한 코드. 확장성을 이유로 현재 요구사항을 복잡하게 만들지 않는다.
