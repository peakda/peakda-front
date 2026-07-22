# src/

## Overview

이 디렉터리가 Peakda 프런트엔드의 전체 소스코드를 owns한다 — App Router 페이지, API 파사드, 공용 컴포넌트/훅/스토어.

## 디렉터리

| 경로 | 용도 |
| --- | --- |
| `api/mutator/` | orval customInstance (axios 등 fetch 래퍼) — 생성 코드가 공통으로 사용 |
| `api/facades/generated/` | `pnpm generate:api`로 orval이 생성 (tags-split 모드, 도메인별 분리). **직접 수정 금지** — swagger 재생성 시 덮어씀 |
| `api/facades/*.ts` | 도메인별 수동 파사드. generated 훅을 감싸서 앱에 노출. 언래핑 규칙: `res.data`(orval 래퍼) → `res.data.data`(백엔드 실제 payload) |
| `app/` | Next.js App Router. 라우트 그룹: explore, feed, map, spot, search, my, profile, users, notification, onboarding, login/auth, Terms(약관), record 등. `app/api/`는 uploadthing 전용 Route Handler (백엔드 API 프록시 아님 — `ARCHITECTURE.md` 참고) |
| `components/Map/` | 카카오맵 관련 컴포넌트 — `dynamic import + ssr: false` 필수 |
| `components/ui/` | 프레젠테이셔널 컴포넌트 (button, card, category, display, form, icon, layout, list, message, Tab) |
| `components/notification/` | 알림 관련 컴포넌트 |
| `constants/` | 상수 (`index.ts`, `map.ts`) |
| `context/` | React Context. 현재 `TabContext.tsx` 1개 — 새 상태 공유가 필요하면 Context 전에 Zustand 검토 |
| `hooks/` | 커스텀 훅 (디바운스, 카카오 장소 검색, 지도 핀, 닉네임 체크 등) |
| `lib/kakao/` | 카카오맵 SDK 초기화/유틸 |
| `lib/utils/` | 범용 유틸 (`cn()` 등) |
| `stores/` | Zustand 스토어 (클라이언트 전역 상태) |
| `types/` | 전역 타입 정의 |

## Cross-module dependency

`app/**` (Server/Client Component) → `api/facades/*.ts` (TanStack Query 훅) → `api/facades/generated/**` → `api/mutator` 순으로 호출된다.

## Common patterns

새 API 도메인 추가:

```bash
pnpm generate:api       # swagger 갱신 + orval 생성
pnpm generate:facades   # 없는 도메인만 파사드 스텁 생성
```

이후 파사드(`api/facades/*.ts`) 내부 TODO를 채운다.

## 규칙

- Note: `api/facades/generated/peakdaApi.schemas.ts`(2000+ 줄)는 orval `tags-split` 모드에서도 공통 스키마이므로 태그별로 분할되지 않는다 (orval 8.10 확인). 수동으로 쪼개면 `pnpm generate:api` 재실행 시 원상복구되므로 분할하지 않는다 — 큰 파일이지만 항상 자동 생성본이라 수동 편집 대상이 아니므로 크기 자체는 문제가 아니다.
- 나머지 규칙(Import, 컴포넌트, 상태 관리 등)은 루트 [CLAUDE.md](../CLAUDE.md)/[AGENTS.md](../AGENTS.md) 참고.
