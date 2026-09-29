# MEMORY.md

코드만 봐서는 알기 어려운 결정과 이유. 세부 흐름은 `ARCHITECTURE.md`, 디렉터리별 규칙은 `src/CLAUDE.md` 참고.

## 결정과 이유

- **API 직접 호출 (Route Handler 프록시 아님)**: 프런트(Vercel)와 백엔드(AWS)가 다른 도메인이라 크로스사이트 쿠키(`SameSite=None; Secure`)로 인증을 주고받는다. `src/api/mutator/index.ts`는 그래서 `NEXT_PUBLIC_API_URL`로 브라우저/서버에서 백엔드를 직접 호출한다.
  - `CLAUDE.md`의 API 호출 규칙은 이 방식(직접 호출)을 기준으로 맞춰져 있다 (2026-07-19 업데이트). `/app/api/` Route Handler는 현재 하나도 없다 — 유일하게 있던 uploadthing 라우트는 호출부가 없어 2026-08-08 제거했다. 이미지 업로드도 백엔드 API로 처리한다.
  - 단, `next.config.ts`의 UploadThing 이미지 도메인(`utfs.io`, `*.ufs.sh`, `t3.storageapi.dev`)은 **백엔드가 내려주는 presigned URL** 때문에 여전히 필요하다. 라우트를 지웠다고 함께 지우면 안 된다.
- **presigned URL 이 next/image 변환 한도를 태운다 — 우회하지 말고 백엔드를 기다린다** (2026-09-20): 백엔드 사진·프로필 URL 은 응답할 때마다 서명(`X-Amz-Signature`)이 새로 발급되는데, Vercel 은 **URL 전체를 캐시 키**로 쓴다. 그래서 같은 사진인데도 페이지를 열 때마다 새 원본으로 취급해 매번 변환을 돌리고, `minimumCacheTTL: 30일`이 통째로 무의미하다. Pro 플랜 월 5,000건을 넘겨 **`OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED`(HTTP 402)로 이미지가 깨지고 나서야 발견**했다.
  - **최적화를 끄는 우회(커스텀 로더/`unoptimized`)는 검토했다가 되돌렸다.** 캐시가 안 맞아도 변환 자체는 매번 일어나 **사용자는 작은 이미지를 받고 있었다** — 끄면 비용은 0이 되지만 원본이 그대로 내려간다. 프로필 이미지는 스키마상 최대 5MB 인데 피드 카드에서 **32px 아바타**로 쓰이므로, 끄는 순간 피드가 망가진다. 돈이 아니라 체감 속도를 내주는 거래라 수지가 안 맞는다.
  - 실제로 한 건 `formats` 에서 **AVIF 제거**뿐이다. 포맷마다 별도 변환이라 원본 하나당 ×2 였고, 빼면 부작용 거의 없이 변환이 절반이 된다. 나머지는 초과분 과금으로 버틴다.
  - 근본 해결은 백엔드다 — [BACKEND_API_REQUESTS.md](BACKEND_API_REQUESTS.md) 15번(만료 없는 URL + 사진 사이즈 variant)과 [BACKEND_SEO_REQUESTS.md](BACKEND_SEO_REQUESTS.md) 의 `publicUrl` 요청. **백엔드는 프로필 이미지 업로드 응답(`ProfileImageResponse.variants`)에 이미 사이즈별 URL 생성 로직을 갖고 있다** — 기록 사진(`PhotoEntry`)에는 원본 `url` 하나뿐이라, 새 기능이 아니라 기존 코드 재사용을 요청하는 셈이다.
  - 주소가 고정인 이미지(TourAPI `tong.visitkorea.or.kr`, 카카오·네이버 프로필, `/public` 정적 파일)는 캐시가 정상 동작한다 — 비용을 태우는 건 presigned 쪽뿐이다.
- **토큰 refresh 동시성**: 401 발생 시 `runRefresh()`가 진행 중인 refresh Promise를 공유해 동시 다발 요청이 refresh를 중복 호출하지 않게 한다 (`src/api/mutator/index.ts`).
- **swagger.json은 커밋하지 않음**: `pnpm generate:api`가 `.env.development`의 `NEXT_PUBLIC_API_URL` 백엔드에서 `/v3/api-docs`를 받아와 로컬에 생성한다 (`scripts/fetch-swagger.mjs`). 즉 API 재생성에는 해당 백엔드가 떠 있어야 한다.
  - **⚠️ `.env.development`는 `http://localhost:8080`을 가리키는데, 현재 최신 스펙은 `https://api-dev.peakda.com`에 있다** (2026-08-18 기준). 그냥 `pnpm generate:api`를 돌리면 **로컬에 떠 있는 백엔드 버전으로 스키마가 되돌아간다.** 최신 dev 스펙으로 재생성하려면 그 실행에만 환경변수를 주입한다:
    ```
    NEXT_PUBLIC_API_URL=https://api-dev.peakda.com node scripts/fetch-swagger.mjs && pnpm exec orval && node scripts/sync-generated.mjs
    ```
    `.env.development`를 바꾸면 개발 서버가 붙는 API도 함께 바뀌므로 임의로 고치지 않았다.
  - 로컬 백엔드가 떠 있어도 **빌드가 낡으면 옛 스펙이 나온다.** 2026-08-18에 "재기동했다"는 서버가 PR 이전 코드를 그대로 서빙해 한참 헤맸다. 새 필드가 안 보이면 포트 확인보다 **재빌드 여부**를 먼저 의심할 것.
- **파사드(facade)는 최초 1회만 자동 생성**: `pnpm generate:facades`는 `src/api/facades/{domain}.ts`가 이미 있으면 건드리지 않는다 (`scripts/generate-facades.mjs`). 기존 파사드 수정은 항상 수동.

- **개화 단계는 조회축만 5단계다 — 기록축은 아직 4값** (2026-08-04 디자이너 확정 → 2026-09-20 조회축 해소): 확정된 색 스케일은 개화 전(gray-400 `#a8b0bc`) → 이르다(green-50 배경 + `brand-secondary` 텍스트) → 피기 시작(pink-200 `#ffa8b4`) → 절정(pink-400 `#f7576b`, 유일하게 솔리드 배경 + 흰 텍스트) → 늦었다(pink-600 `#c41f33`). 서버 enum이 **두 축으로 갈려 있다**는 게 핵심이다 — 기록 상태 `bloomStage`(`EARLY/STARTING/PEAK/LATE`)와 조회 상태 `BloomStatus` 계열(`BEFORE_SEASON/PREPARING/STARTED/PEAK/ENDED`)은 서로 다른 값 집합이고, 서버 `BloomStageStatusMapper`가 기록축 → 조회축으로 환산한다.
  - **조회축은 백엔드 PR #104로 5단계가 됐다.** 그 전까지 `BloomSlotStatus`에 '이르다'가 없어서 **지도 핀의 `PREPARING`을 '개화 전'(회색)으로 대신 그렸는데**, 이제 `PREPARING`은 본래 뜻인 초록 '이르다'(`Stage: 'Early'`)이고 회색은 `BEFORE_SEASON`이 가져간다. 카드 뱃지는 원래부터 `PREPARING`을 '이르다'로 그려서 **이제야 지도와 카드 표기가 같아졌다.**
  - **`BEFORE_SEASON`은 아직 dev 스펙에 없다(PR #104 미배포).** 그래서 `src/lib/utils/bloomStatus.ts`의 `BloomStageStatus = BloomStatus | 'BEFORE_SEASON'`로 프런트에서만 넓혀 두고 모든 상태 매핑이 이 타입을 쓴다. 배포 후 `pnpm generate:api`를 돌리면 생성 union에 값이 들어와 이 합집합이 저절로 같아지므로, **`| 'BEFORE_SEASON'` 한 줄과 `spotPreview.test.ts`의 `as Badge` 캐스팅만 지우면 정리 끝**이다. 서버가 엔드포인트마다 다른 이름(`BloomStatus`/`BloomBannerStatus`/`BloomBadgeStatus`/`BloomSlotStatus`/…)으로 같은 값을 내보내므로 프런트 매핑은 이 타입 하나로 덮는다.
  - 단계 색·라벨·우선순위는 전부 `src/constants/map.ts`(`Stage`/`STAGE_COLOR`/`STAGE_LABEL`/`STAGE_PRIORITY`/`STATUS_STAGE`)에서 파생된다 — `Pin.tsx`의 `BORDER_CLASS`만 별도 Tailwind 클래스 표라 함께 고쳐야 한다. 뱃지는 `src/lib/utils/bloomStatus.ts`의 `toStatusBadge`로 모으는 중이다(`creators/[id]/_components/CreatorDetailClient.tsx`는 2026-09-20에 합류, `spotRecordToFeed.ts`는 기록축이라 별도).
  - **`ENDED`(늦었다)도 PR #104부터 응답에 나온다.** 그전엔 서버가 6곳에서 걸러내 화면에 도달하지 않았다 — "ENDED는 안 온다"를 전제로 짠 코드가 남아 있는지 의심할 것.
  - **스팟 기록의 '상태' 선택지에 '개화 전' 버튼을 추가하는 건 여전히 보류다.** 기록축 `bloomStage`는 PR #104가 건드리지 않아 4값 그대로라 프런트만으로는 전송할 수 없다 (`src/app/record/_components/DetailsStepForm.tsx`의 `STATUS_OPTIONS`, `src/app/record/[id]/edit/page.tsx`에 각각 정의됨). 2026-09-20에 [BACKEND_API_REQUESTS.md](BACKEND_API_REQUESTS.md) 14번으로 확장을 요청했고 회신 대기 중이다. 그때까지 **동네형 핀은 `BEFORE_SEASON`이 구조적으로 나오지 않는다** — 동네형은 기록축을 환산해 쓰므로 4단계뿐이고, 명소형만 5단계다.


- **지도 꽃 필터는 일부러 서버로 안 보낸다** (2026-08-18): `GET /api/seasonal/blooms`에 `categories` 파라미터가 생겼지만 쓰지 않는다. 서버가 걸러 주면 ① 필터 드로어 하단 "N개의 명소 보기"를 **아직 적용 안 한 draft 기준으로 셀 수 없고** ② 응답에서 안 고른 꽃이 빠져 **핀 아이콘·색을 선택에 맞게 좁힐 수 없다.** 과다 조회는 bbox 한 화면 분량이고 격자 스냅 캐싱이 걸려 있어 그 대가가 더 싸다고 판단했다. 근거는 `MapContainer.tsx`의 `bloomParams` 주석에도 남겼다.
  - 반면 `status`·`region`은 서버로 보낸다. **단 클라이언트 status 필터도 함께 유지한다** — 서버 판정은 "그 상태인 꽃이 하나라도 있는 핀"이라 핀 단위인데, 꽃 종류를 함께 고르면 *고른 꽃이* 그 상태여야 한다. 그 판정은 꽃을 좁힌 뒤에만 가능해 `mapFilter.ts`가 맡는다.
  - **⏳ `status`도 서버로 안 보낼 수 있는지 확인 대기** (2026-09-04): `mapFilter.ts`가 이미 status를 거르므로 서버 파라미터를 빼면 시기 탭 3개가 같은 캐시를 공유해 **탭 전환 요청이 0건**이 된다(지금은 bbox 하나당 캐시가 무필터+3탭 = 4종으로 갈린다). 서버가 **핀만** 거르는지 핀 안의 `blooms` 슬롯까지 거르는지에 따라 대응이 갈린다. 확인은 같은 bbox로 `status` 유무 두 번 호출해 **같은 `spotId` 핀의 `blooms.length`를 비교**한다 — 상태가 서로 다른 꽃이 2개 이상 달린 핀이 있어야 판정된다(꽃 1개이거나 상태가 같으면 두 경우의 결과가 같아 구분 불가).
    - 길이가 **같으면** 핀 단위 → `MapContainer.tsx`의 `bloomParams`에서 `status`만 지우면 끝.
    - 길이가 **줄면** 슬롯 단위 → `mapFilter.ts`는 status로 `flowers`를 좁히지 않으므로, 그냥 지우면 "절정" 필터에서 절정이 아닌 꽃 아이콘까지 핀에 뜬다. `narrowToCategories`와 대칭인 status narrow를 **먼저** 추가해야 한다.
- **지도 `region`은 bbox state 안에 들어 있다 — 따로 빼지 말 것** (2026-09-04): `bloomParams`가 `applied.region`을 직접 읽으면, 권역을 고른 순간 React Query의 내부 effect(`useBloomMap` 호출 지점이라 훅 선언 순서상 아래쪽 권역 effect보다 **먼저** 돈다)가 **'옛 bbox + 새 region'으로 요청을 한 번 보내고 버린다.** 둘을 한 state에 담아 같은 `setState`로 바꿔야 그 중간 상태 자체가 안 생긴다. 같은 이유로 `idle` effect deps에 `applied.region`을 넣으면 안 된다 — effect가 재등록되며 아직 이동 전 bounds로 또 조회하므로 `appliedRegionRef`로 읽는다.
  - bbox 격자는 `0.001 × 2^(level-1)`로 레벨에 비례한다(셀 = 화면 폭의 약 90%, 모든 레벨 동일). 고정 0.01°였을 때는 level 8 화면이 가로 14칸이라 화면 폭의 7%만 움직여도 매번 새 쿼리 키가 돼 캐시가 사실상 놀았다. 대가는 평균 1.8배 과조회다.
  - 화면 안 개수('N개의 명소 보기')는 `bbox`가 아니라 `viewport` state로 센다. bbox는 격자에 스냅돼 화면보다 넓고 셀 안에서의 팬으로는 바뀌지 않아서, 지도에서 `getBounds()`를 직접 읽으면 그 값이 effect deps에 안 잡혀 개수가 옛 화면 기준으로 남는다.
- **지도 초기 로딩은 SDK 준비가 아니라 첫 `tilesloaded`까지 가린다** (2026-09-02): SDK 콜백 직후에도 실제 타일은 수 초간 비어 있을 수 있어, 상단 UI는 먼저 표시하고 지도 영역의 CSS 스켈레톤만 첫 타일 완료까지 유지한다. `/map` HTML에서 SDK를 preload하며, 화면 전체 지도에 불필요했던 `IntersectionObserver` 지연은 제거했다.
  - 수동 3×3 타일 prefetch는 카카오맵이 요청하는 타일과 경쟁할 수 있고, 기존 서비스워커는 cross-origin 응답을 캐시하지 못하면서 모든 타일에 Cache API 조회를 더할 수 있어 신규 등록을 제거했다. `public/map-tile-sw.js`는 기존 설치본/캐시 정리만 담당한다.
- **`MapSpot`의 `flowers`/`statuses`/`categories`는 인덱스가 맞물린 병렬 배열**: 같은 꽃이 같은 위치에 들어간다. `mapFilter.ts`가 꽃 종류로 좁힐 때 이 정렬에 기대므로 한쪽만 따로 만들거나 정렬을 바꾸면 안 된다. 핀 색(`maxStage`)은 좁힌 뒤 `constants/map.ts`의 `toMaxStage()`로 다시 계산한다 — 변환(`bloomToMapSpots`)과 필터가 각자 계산하면 필터를 걸었을 때 색만 옛 기준으로 남는다.
- **꽃 목록이 세 곳에 복제돼 있다**: `src/constants/flower.ts`(지도 필터)와 `app/profile/page.tsx`·`app/profile/edit/page.tsx`가 각자 `FLOWER_LIST`를 든다. 요청 DTO별로 orval enum 타입이 갈려서 하나로 못 합쳤다(`SignupCompleteRequestFavoriteCategoriesItem` vs `FavoriteCategoryUpdateRequestCategoriesItem` vs `BloomSlotCategory`). **라벨을 고칠 때 세 곳을 함께 봐야 한다.**
  - 실제로 2026-08-18에 `AZALEA`/`AZALEA_KR`이 세 곳 모두 서버와 반대로 매핑돼 있었다. 서버 `displayName` 기준은 **`AZALEA_KR`=진달래, `AZALEA`=철쭉**이다(enum 이름만 보면 반대로 읽힌다). 아이콘도 `constants/map.ts`에서 함께 맞춰야 한다(`royal-azalea.svg`=철쭉).
  - 프로필 **조회**는 서버 `displayName`을 쓰고 **편집**은 이 하드코딩을 쓴다. 그래서 매핑이 틀리면 같은 유저의 관심 꽃이 두 화면에서 다르게 보인다. 그 시기에 잘못 저장된 데이터는 프론트 수정으로 되돌아가지 않는다.
- **꽃 필터 목록은 서버 enum의 부분집합**: 서버는 15종인데 Figma 필터는 14종이다. 핑크뮬리는 필터에서 뺐지만 서버가 핀으로는 계속 내려주므로 `CATEGORY_ICON`에는 남겨야 한다(지도에는 정상 표시, 필터 항목으로만 안 뜸).
- **`public/`에는 문서를 두지 않는다** (2026-09-16): `public/` 안의 파일은 Next가 그대로 서빙해서 `https://www.peakda.com/CLAUDE.md`, `/terms-prompt.md` 등이 운영에서 누구나 열리고 검색에 잡힐 수 있었다. 디렉터리 안내였던 public/CLAUDE.md 는 없앴고(`map-tile-sw.js` 규칙은 위 지도 로딩 항목과 `ARCHITECTURE.md`에 이미 있다), 약관 생성 프롬프트는 `src/app/Terms/_prompts/`로 옮겼다(`_` 폴더라 라우트도 안 된다).

## 자주 하는 작업

- **신규 API 도메인 추가**: swagger 갱신 → `pnpm generate:api` → `pnpm generate:facades` (없는 도메인만 스텁 생성) → 파사드 TODO 채우기. 언래핑 규칙: `res.data`(orval 래퍼) → `res.data.data`(백엔드 실제 payload).
- **카카오맵 관련 컴포넌트 추가**: `src/components/Map` 하위에 작성하고 `dynamic import + ssr: false`로 로드 (`src/CLAUDE.md` 참고).
