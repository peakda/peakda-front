# Task 003 — 신규 API 도메인 연동

## 프롬프트

"백엔드에 새로 추가된 `review` API를 연동해줘. 목록 조회 훅 하나만 있으면 돼."

## Pass 기준

- `MEMORY.md`의 "신규 API 도메인 추가" 절차(swagger 갱신 → `pnpm generate:api` → `pnpm generate:facades` → 파사드 TODO 채우기)를 따랐는가
- `src/api/facades/generated/`의 기존 코드를 직접 손대지 않고 `src/api/facades/review.ts` 파사드만 작성했는가
- 언래핑 규칙(`res.data` → `res.data.data`)을 지켰는가
- 라우트 핸들러 프록시를 새로 만들지 않고 `customInstance` 직접 호출 패턴을 따랐는가 (`AGENTS.md` API 호출 규칙)
- `pnpm generate:facades`를 실행해도 기존 도메인 파사드가 덮어써지지 않는지 확인했는가
