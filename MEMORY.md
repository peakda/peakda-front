# MEMORY.md

코드만 봐서는 알기 어려운 결정과 이유. 세부 흐름은 `ARCHITECTURE.md`, 디렉터리별 규칙은 `src/CLAUDE.md`/`public/CLAUDE.md` 참고.

## 결정과 이유

- **API 직접 호출 (Route Handler 프록시 아님)**: 프런트(Vercel)와 백엔드(AWS)가 다른 도메인이라 크로스사이트 쿠키(`SameSite=None; Secure`)로 인증을 주고받는다. `src/api/mutator/index.ts`는 그래서 `NEXT_PUBLIC_API_URL`로 브라우저/서버에서 백엔드를 직접 호출한다.
  - `CLAUDE.md`의 API 호출 규칙은 이 방식(직접 호출)을 기준으로 맞춰져 있다 (2026-07-19 업데이트). `/app/api/` Route Handler는 현재 하나도 없다 — 유일하게 있던 uploadthing 라우트는 호출부가 없어 2026-08-08 제거했다. 이미지 업로드도 백엔드 API로 처리한다.
  - 단, `next.config.ts`의 UploadThing 이미지 도메인(`utfs.io`, `*.ufs.sh`, `t3.storageapi.dev`)은 **백엔드가 내려주는 presigned URL** 때문에 여전히 필요하다. 라우트를 지웠다고 함께 지우면 안 된다.
- **토큰 refresh 동시성**: 401 발생 시 `runRefresh()`가 진행 중인 refresh Promise를 공유해 동시 다발 요청이 refresh를 중복 호출하지 않게 한다 (`src/api/mutator/index.ts`).
- **swagger.json은 커밋하지 않음**: `pnpm generate:api`가 `.env.development`의 `NEXT_PUBLIC_API_URL` 백엔드에서 `/v3/api-docs`를 받아와 로컬에 생성한다 (`scripts/fetch-swagger.mjs`). 즉 API 재생성에는 해당 백엔드가 떠 있어야 한다.
  - **⚠️ `.env.development`는 `http://localhost:8080`을 가리키는데, 현재 최신 스펙은 `https://api-dev.peakda.com`에 있다** (2026-08-18 기준). 그냥 `pnpm generate:api`를 돌리면 **로컬에 떠 있는 백엔드 버전으로 스키마가 되돌아간다.** 최신 dev 스펙으로 재생성하려면 그 실행에만 환경변수를 주입한다:
    ```
    NEXT_PUBLIC_API_URL=https://api-dev.peakda.com node scripts/fetch-swagger.mjs && pnpm exec orval && node scripts/sync-generated.mjs
    ```
    `.env.development`를 바꾸면 개발 서버가 붙는 API도 함께 바뀌므로 임의로 고치지 않았다.
  - 로컬 백엔드가 떠 있어도 **빌드가 낡으면 옛 스펙이 나온다.** 2026-08-18에 "재기동했다"는 서버가 PR 이전 코드를 그대로 서빙해 한참 헤맸다. 새 필드가 안 보이면 포트 확인보다 **재빌드 여부**를 먼저 의심할 것.
- **파사드(facade)는 최초 1회만 자동 생성**: `pnpm generate:facades`는 `src/api/facades/{domain}.ts`가 이미 있으면 건드리지 않는다 (`scripts/generate-facades.mjs`). 기존 파사드 수정은 항상 수동.
- **개화 단계 색은 5단계인데 API는 4값 — enum 확장 시 5단계로 넓힌다** (2026-08-04 디자이너 확정): 확정된 색 스케일은 개화 전(gray-400 `#a8b0bc`) → 이르다(green-50 배경 + `brand-secondary` 텍스트) → 피기 시작(pink-200 `#ffa8b4`) → 절정(pink-400 `#f7576b`, 유일하게 솔리드 배경 + 흰 텍스트) → 늦었다(pink-600 `#c41f33`). 그런데 서버 enum이 둘 다 4값이고 서로 다르다 — 기록 상태 `bloomStage`(`EARLY/STARTING/PEAK/LATE`)에는 '개화 전'이 없고, 지도 개화 상태 `BloomSlotStatus`(`PREPARING/STARTED/PEAK/ENDED`)에는 '이르다'가 없다. 그래서 **지도 핀의 `PREPARING`은 '개화 전'(회색)으로 두고, 초록 '이르다'는 기록 상태에서만 쓴다.**
  - 백엔드가 enum을 확장하면 `pnpm generate:api` 후 `src/constants/map.ts`(`Stage`/`STAGE_COLOR`/`STAGE_LABEL`/`STAGE_PRIORITY`/`STATUS_STAGE`)와 `src/components/Map/Pin.tsx`(`BORDER_CLASS`)를 5단계로 확장한다. 뱃지 색은 `src/components/ui/card/CardBadge.tsx`의 variant(`green`/`starting`/`bloom`/`late`)에 있고, 상태→variant 매핑은 `src/lib/utils/spotRecordToFeed.ts`, `src/app/spot/[id]/page.tsx`, `src/app/creators/[id]/page.tsx` 3곳에 흩어져 있다.
  - 같은 이유로 **스팟 기록의 '상태' 선택지에 '개화 전' 버튼을 추가하는 것도 보류 중**이다. `bloomStage`가 4값 union이라 프런트만으로는 전송할 수 없다 (`src/app/record/_components/DetailsStepForm.tsx`의 `STATUS_OPTIONS`, `src/app/record/[id]/edit/page.tsx`에 각각 정의됨).

- **지도 꽃 필터는 일부러 서버로 안 보낸다** (2026-08-18): `GET /api/seasonal/blooms`에 `categories` 파라미터가 생겼지만 쓰지 않는다. 서버가 걸러 주면 ① 필터 드로어 하단 "N개의 명소 보기"를 **아직 적용 안 한 draft 기준으로 셀 수 없고** ② 응답에서 안 고른 꽃이 빠져 **핀 아이콘·색을 선택에 맞게 좁힐 수 없다.** 과다 조회는 bbox 한 화면 분량이고 격자 스냅 캐싱이 걸려 있어 그 대가가 더 싸다고 판단했다. 근거는 `MapContainer.tsx`의 `bloomParams` 주석에도 남겼다.
  - 반면 `status`·`region`은 서버로 보낸다. **단 클라이언트 status 필터도 함께 유지한다** — 서버 판정은 "그 상태인 꽃이 하나라도 있는 핀"이라 핀 단위인데, 꽃 종류를 함께 고르면 *고른 꽃이* 그 상태여야 한다. 그 판정은 꽃을 좁힌 뒤에만 가능해 `mapFilter.ts`가 맡는다.
- **지도 초기 로딩은 SDK 준비가 아니라 첫 `tilesloaded`까지 가린다** (2026-09-02): SDK 콜백 직후에도 실제 타일은 수 초간 비어 있을 수 있어, 상단 UI는 먼저 표시하고 지도 영역의 CSS 스켈레톤만 첫 타일 완료까지 유지한다. `/map` HTML에서 SDK를 preload하며, 화면 전체 지도에 불필요했던 `IntersectionObserver` 지연은 제거했다.
  - 수동 3×3 타일 prefetch는 카카오맵이 요청하는 타일과 경쟁할 수 있고, 기존 서비스워커는 cross-origin 응답을 캐시하지 못하면서 모든 타일에 Cache API 조회를 더할 수 있어 신규 등록을 제거했다. `public/map-tile-sw.js`는 기존 설치본/캐시 정리만 담당한다.
- **`MapSpot`의 `flowers`/`statuses`/`categories`는 인덱스가 맞물린 병렬 배열**: 같은 꽃이 같은 위치에 들어간다. `mapFilter.ts`가 꽃 종류로 좁힐 때 이 정렬에 기대므로 한쪽만 따로 만들거나 정렬을 바꾸면 안 된다. 핀 색(`maxStage`)은 좁힌 뒤 `constants/map.ts`의 `toMaxStage()`로 다시 계산한다 — 변환(`bloomToMapSpots`)과 필터가 각자 계산하면 필터를 걸었을 때 색만 옛 기준으로 남는다.
- **꽃 목록이 세 곳에 복제돼 있다**: `src/constants/flower.ts`(지도 필터)와 `app/profile/page.tsx`·`app/profile/edit/page.tsx`가 각자 `FLOWER_LIST`를 든다. 요청 DTO별로 orval enum 타입이 갈려서 하나로 못 합쳤다(`SignupCompleteRequestFavoriteCategoriesItem` vs `FavoriteCategoryUpdateRequestCategoriesItem` vs `BloomSlotCategory`). **라벨을 고칠 때 세 곳을 함께 봐야 한다.**
  - 실제로 2026-08-18에 `AZALEA`/`AZALEA_KR`이 세 곳 모두 서버와 반대로 매핑돼 있었다. 서버 `displayName` 기준은 **`AZALEA_KR`=진달래, `AZALEA`=철쭉**이다(enum 이름만 보면 반대로 읽힌다). 아이콘도 `constants/map.ts`에서 함께 맞춰야 한다(`royal-azalea.svg`=철쭉).
  - 프로필 **조회**는 서버 `displayName`을 쓰고 **편집**은 이 하드코딩을 쓴다. 그래서 매핑이 틀리면 같은 유저의 관심 꽃이 두 화면에서 다르게 보인다. 그 시기에 잘못 저장된 데이터는 프론트 수정으로 되돌아가지 않는다.
- **꽃 필터 목록은 서버 enum의 부분집합**: 서버는 15종인데 Figma 필터는 14종이다. 핑크뮬리는 필터에서 뺐지만 서버가 핀으로는 계속 내려주므로 `CATEGORY_ICON`에는 남겨야 한다(지도에는 정상 표시, 필터 항목으로만 안 뜸).

## 자주 하는 작업

- **신규 API 도메인 추가**: swagger 갱신 → `pnpm generate:api` → `pnpm generate:facades` (없는 도메인만 스텁 생성) → 파사드 TODO 채우기. 언래핑 규칙: `res.data`(orval 래퍼) → `res.data.data`(백엔드 실제 payload).
- **카카오맵 관련 컴포넌트 추가**: `src/components/Map` 하위에 작성하고 `dynamic import + ssr: false`로 로드 (`src/CLAUDE.md` 참고).
