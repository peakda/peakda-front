# MEMORY.md

코드만 봐서는 알기 어려운 결정과 이유. 세부 흐름은 `ARCHITECTURE.md`, 디렉터리별 규칙은 `src/CLAUDE.md`/`public/CLAUDE.md` 참고.

## 결정과 이유

- **API 직접 호출 (Route Handler 프록시 아님)**: 프런트(Vercel)와 백엔드(AWS)가 다른 도메인이라 크로스사이트 쿠키(`SameSite=None; Secure`)로 인증을 주고받는다. `src/api/mutator/index.ts`는 그래서 `NEXT_PUBLIC_API_URL`로 브라우저/서버에서 백엔드를 직접 호출한다.
  - `CLAUDE.md`의 API 호출 규칙은 이 방식(직접 호출)을 기준으로 맞춰져 있다 (2026-07-19 업데이트). `/app/api/` Route Handler는 uploadthing 등 별도 목적으로만 사용.
- **토큰 refresh 동시성**: 401 발생 시 `runRefresh()`가 진행 중인 refresh Promise를 공유해 동시 다발 요청이 refresh를 중복 호출하지 않게 한다 (`src/api/mutator/index.ts`).
- **swagger.json은 커밋하지 않음**: `pnpm generate:api`가 `.env.development`의 `NEXT_PUBLIC_API_URL` 백엔드에서 `/v3/api-docs`를 받아와 로컬에 생성한다 (`scripts/fetch-swagger.mjs`). 즉 API 재생성에는 해당 백엔드가 떠 있어야 한다.
- **파사드(facade)는 최초 1회만 자동 생성**: `pnpm generate:facades`는 `src/api/facades/{domain}.ts`가 이미 있으면 건드리지 않는다 (`scripts/generate-facades.mjs`). 기존 파사드 수정은 항상 수동.
- **개화 단계 색은 5단계인데 API는 4값 — enum 확장 시 5단계로 넓힌다** (2026-08-04 디자이너 확정): 확정된 색 스케일은 개화 전(gray-400 `#a8b0bc`) → 이르다(green-50 배경 + `brand-secondary` 텍스트) → 피기 시작(pink-200 `#ffa8b4`) → 절정(pink-400 `#f7576b`, 유일하게 솔리드 배경 + 흰 텍스트) → 늦었다(pink-600 `#c41f33`). 그런데 서버 enum이 둘 다 4값이고 서로 다르다 — 기록 상태 `bloomStage`(`EARLY/STARTING/PEAK/LATE`)에는 '개화 전'이 없고, 지도 개화 상태 `BloomSlotStatus`(`PREPARING/STARTED/PEAK/ENDED`)에는 '이르다'가 없다. 그래서 **지도 핀의 `PREPARING`은 '개화 전'(회색)으로 두고, 초록 '이르다'는 기록 상태에서만 쓴다.**
  - 백엔드가 enum을 확장하면 `pnpm generate:api` 후 `src/constants/map.ts`(`Stage`/`STAGE_COLOR`/`STAGE_LABEL`/`STAGE_PRIORITY`/`STATUS_STAGE`)와 `src/components/Map/Pin.tsx`(`BORDER_CLASS`)를 5단계로 확장한다. 뱃지 색은 `src/components/ui/card/CardBadge.tsx`의 variant(`green`/`starting`/`bloom`/`late`)에 있고, 상태→variant 매핑은 `src/lib/utils/spotRecordToFeed.ts`, `src/app/spot/[id]/page.tsx`, `src/app/creators/[id]/page.tsx` 3곳에 흩어져 있다.
  - 같은 이유로 **스팟 기록의 '상태' 선택지에 '개화 전' 버튼을 추가하는 것도 보류 중**이다. `bloomStage`가 4값 union이라 프런트만으로는 전송할 수 없다 (`src/app/record/_components/DetailsStepForm.tsx`의 `STATUS_OPTIONS`, `src/app/record/[id]/edit/page.tsx`에 각각 정의됨).

## 자주 하는 작업

- **신규 API 도메인 추가**: swagger 갱신 → `pnpm generate:api` → `pnpm generate:facades` (없는 도메인만 스텁 생성) → 파사드 TODO 채우기. 언래핑 규칙: `res.data`(orval 래퍼) → `res.data.data`(백엔드 실제 payload).
- **카카오맵 관련 컴포넌트 추가**: `src/components/Map` 하위에 작성하고 `dynamic import + ssr: false`로 로드 (`src/CLAUDE.md` 참고).
