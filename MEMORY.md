# MEMORY.md

코드만 봐서는 알기 어려운 결정과 이유. 세부 흐름은 `ARCHITECTURE.md`, 디렉터리별 규칙은 `src/CLAUDE.md`/`public/CLAUDE.md` 참고.

## 결정과 이유

- **API 직접 호출 (Route Handler 프록시 아님)**: 프런트(Vercel)와 백엔드(Railway)가 다른 도메인이라 크로스사이트 쿠키(`SameSite=None; Secure`)로 인증을 주고받는다. `src/api/mutator/index.ts`는 그래서 `NEXT_PUBLIC_API_URL`로 브라우저/서버에서 백엔드를 직접 호출한다.
  - Note: 이는 `AGENTS.md`의 "외부 API는 Route Handler 프록시 경유" 규칙과 실제로 다르게 동작하는 부분이다. 신규 코드 작성 시 어느 쪽을 따를지 애매하면 임의로 정하지 말고 확인할 것.
- **토큰 refresh 동시성**: 401 발생 시 `runRefresh()`가 진행 중인 refresh Promise를 공유해 동시 다발 요청이 refresh를 중복 호출하지 않게 한다 (`src/api/mutator/index.ts`).
- **swagger.json은 커밋하지 않음**: `pnpm generate:api`가 `.env.development`의 `NEXT_PUBLIC_API_URL` 백엔드에서 `/v3/api-docs`를 받아와 로컬에 생성한다 (`scripts/fetch-swagger.mjs`). 즉 API 재생성에는 해당 백엔드가 떠 있어야 한다.
- **파사드(facade)는 최초 1회만 자동 생성**: `pnpm generate:facades`는 `src/api/facades/{domain}.ts`가 이미 있으면 건드리지 않는다 (`scripts/generate-facades.mjs`). 기존 파사드 수정은 항상 수동.

## 자주 하는 작업

- **신규 API 도메인 추가**: swagger 갱신 → `pnpm generate:api` → `pnpm generate:facades` (없는 도메인만 스텁 생성) → 파사드 TODO 채우기. 언래핑 규칙: `res.data`(orval 래퍼) → `res.data.data`(백엔드 실제 payload).
- **카카오맵 관련 컴포넌트 추가**: `src/components/Map` 하위에 작성하고 `dynamic import + ssr: false`로 로드 (`src/CLAUDE.md` 참고).

## 미해결 / 확인 필요

- API 직접 호출 방식과 `AGENTS.md`의 Route Handler 프록시 규칙 중 어느 쪽이 최신 의도인지 — 규칙 문서를 현실에 맞게 고칠지, 실제 프록시로 전환할지 결정 필요.
