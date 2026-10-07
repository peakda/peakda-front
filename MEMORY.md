# MEMORY.md

코드만 봐서는 알기 어려운 결정과 이유. 세부 흐름은 `ARCHITECTURE.md`, 디렉터리별 규칙은 `src/CLAUDE.md` 참고.

## 결정과 이유

- **API 직접 호출 (Route Handler 프록시 아님)**: 프런트(Vercel)와 백엔드(AWS)가 다른 도메인이라 크로스사이트 쿠키(`SameSite=None; Secure`)로 인증을 주고받는다. `src/api/mutator/index.ts`는 그래서 `NEXT_PUBLIC_API_URL`로 브라우저/서버에서 백엔드를 직접 호출한다.
  - `CLAUDE.md`의 API 호출 규칙은 이 방식(직접 호출)을 기준으로 맞춰져 있다 (2026-07-19 업데이트). `/app/api/` Route Handler는 현재 하나도 없다 — 유일하게 있던 uploadthing 라우트는 호출부가 없어 2026-08-08 제거했다. 이미지 업로드도 백엔드 API로 처리한다.
- **next/image 최적화는 꺼져 있다 (`images.unoptimized: true`, 2026-09-22 `e8b403e`)** — 서버가 용도별 크기를 직접 준다.
  - 경위: 백엔드 사진·프로필 URL 이 presigned(응답마다 `X-Amz-Signature` 가 바뀜)라 Vercel 이미지 캐시가 한 번도 맞지 않았고, Pro 월 5,000건을 넘겨 **`OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED`(HTTP 402)로 이미지가 깨졌다**(2026-09-20). 처음엔 AVIF 만 빼고 버텼다 — 끄면 원본이 그대로 내려가기 때문이다.
  - 그 뒤 백엔드가 [docs/BACKEND_API_REQUESTS.md](docs/BACKEND_API_REQUESTS.md) 15번을 반영해 **기록 사진(`PhotoEntry`)에 `variants`(`thumbnail`/`medium`/`main`)와 CDN 고정 주소(`cdn.peakda.com`)** 를 내려주게 되어 최적화를 껐다. 화면은 `src/lib/utils/recordPhotoUrl.ts`로 크기에 맞는 variant 를 고른다 — **기록 사진을 새로 그릴 때 `photo.url`(원본 1600px)을 직접 쓰지 말 것.**
  - **남은 구멍**: 조회 응답의 `profileImageUrl`(`UserProfileResponse` 등)에는 아직 variant 가 없어 32px 아바타에도 원본이 내려간다. 백엔드가 조회 응답에 variant 를 붙이면 기록 사진처럼 골라 쓴다.
  - **외부 이미지(한국관광공사 등)는 `SafeImage`(`src/components/ui/display/SafeImage.tsx`)로 그린다** (2026-10-01, PR #107). 관광공사 `firstimage`/`photoUrls` 는 `http://` 로 내려오는 경우가 있는데, 웹은 브라우저가 https 로 올려 줘서 보이지만 Capacitor 앱은 `androidScheme: 'https'` + `allowMixedContent: false` 라 WebView 가 `http://` 이미지를 **차단**한다("웹은 되는데 앱은 안 됨"의 원인). `SafeImage` 는 https 변환 + 로드 실패 시 이미지를 숨겨 부모 배경이 보이게 한다. 새로 외부 URL 이미지를 그릴 때 `next/image` 에 `src` 를 직접 넘기지 말 것. 적용된 곳: `PinList`·`SpotCard`·`PinCard`·`SpotDetailClient` — 나머지 `<Image>` 는 아직 직접 쓴다.
  - 앱 WebView 콘솔은 평소 못 본다. `CAPACITOR_DEBUG=true` 로 빌드·sync 하면 `webContentsDebuggingEnabled` 가 켜져 `chrome://inspect` 로 볼 수 있다(`capacitor.config.ts`). 네이티브 설정이라 바꾸면 재빌드가 필요하고, 릴리스 빌드에는 쓰지 않는다.
  - `unoptimized: true` 에서는 `remotePatterns` 가 검사되지 않는다. 목록은 최적화를 다시 켤 때를 대비해 남겨 둔 것이며, 지금 도메인을 빼거나 넣어도 동작은 같다.
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
  - **`BEFORE_SEASON`은 이제 생성 스키마에 들어와 있다** (2026-10-01 확인: `peakdaApi.schemas.ts` 에 값 존재). 그래서 `src/lib/utils/bloomStatus.ts`의 `BloomStageStatus = BloomStatus | 'BEFORE_SEASON'` 합집합은 더 이상 필요 없다 — **`| 'BEFORE_SEASON'` 한 줄과 `spotPreview.test.ts`의 `as Badge` 캐스팅을 지우면 정리 끝이다(아직 안 지웠다).** 서버 enum 이름은 엔드포인트마다 달라 실제로 모든 이름에 값이 들어왔는지는 정리 때 `pnpm typecheck` 로 확인한다. 모든 상태 매핑이 이 타입을 쓴다. 서버가 엔드포인트마다 다른 이름(`BloomStatus`/`BloomBannerStatus`/`BloomBadgeStatus`/`BloomSlotStatus`/…)으로 같은 값을 내보내므로 프런트 매핑은 이 타입 하나로 덮는다.
  - 단계 색·라벨·우선순위는 전부 `src/constants/map.ts`(`Stage`/`STAGE_COLOR`/`STAGE_LABEL`/`STAGE_PRIORITY`/`STATUS_STAGE`)에서 파생된다 — `Pin.tsx`의 `BORDER_CLASS`만 별도 Tailwind 클래스 표라 함께 고쳐야 한다. 뱃지는 `src/lib/utils/bloomStatus.ts`의 `toStatusBadge`로 모으는 중이다(`creators/[id]/_components/CreatorDetailClient.tsx`는 2026-09-20에 합류, `spotRecordToFeed.ts`는 기록축이라 별도).
  - **`ENDED`(늦었다)도 PR #104부터 응답에 나온다.** 그전엔 서버가 6곳에서 걸러내 화면에 도달하지 않았다 — "ENDED는 안 온다"를 전제로 짠 코드가 남아 있는지 의심할 것.
  - **스팟 기록의 '상태' 선택지에 '개화 전' 버튼을 추가하는 건 여전히 보류다.** 기록축 `bloomStage`는 PR #104가 건드리지 않아 4값 그대로라 프런트만으로는 전송할 수 없다 (`src/app/record/_components/DetailsStepForm.tsx`의 `STATUS_OPTIONS`, `src/app/record/[id]/edit/page.tsx`에 각각 정의됨). 2026-09-20에 [docs/BACKEND_API_REQUESTS.md](docs/BACKEND_API_REQUESTS.md) 14번으로 확장을 요청했고 회신 대기 중이다. 그때까지 **동네형 핀은 `BEFORE_SEASON`이 구조적으로 나오지 않는다** — 동네형은 기록축을 환산해 쓰므로 4단계뿐이고, 명소형만 5단계다.


- **지도 꽃 필터는 일부러 서버로 안 보낸다** (2026-08-18): `GET /api/seasonal/blooms`에 `categories` 파라미터가 생겼지만 쓰지 않는다. 서버가 걸러 주면 ① 필터 드로어 하단 "N개의 명소 보기"를 **아직 적용 안 한 draft 기준으로 셀 수 없고** ② 응답에서 안 고른 꽃이 빠져 **핀 아이콘·색을 선택에 맞게 좁힐 수 없다.** 지도는 전국을 한 번에 받으므로 꽃 종류를 서버에서 거르지 않아도 추가 조회는 없다. 근거는 `MapContainer.tsx`의 `bloomParams` 주석에도 남겼다.
  - 반면 `status`·`region`은 서버로 보낸다. **단 클라이언트 status 필터도 함께 유지한다** — 서버 판정은 "그 상태인 꽃이 하나라도 있는 핀"이라 핀 단위인데, 꽃 종류를 함께 고르면 *고른 꽃이* 그 상태여야 한다. 그 판정은 꽃을 좁힌 뒤에만 가능해 `mapFilter.ts`가 맡는다.
  - **⏳ `status`도 서버로 안 보낼 수 있는지 확인 대기** (2026-09-04): `mapFilter.ts`가 이미 status를 거르므로 서버 파라미터를 빼면 시기 탭 3개가 같은 캐시를 공유해 **탭 전환 요청이 0건**이 된다(지금은 전국 조회 캐시가 무필터+3탭 = 4종으로 갈린다). 서버가 **핀만** 거르는지 핀 안의 `blooms` 슬롯까지 거르는지에 따라 대응이 갈린다. 확인은 같은 bbox로 `status` 유무 두 번 호출해 **같은 `spotId` 핀의 `blooms.length`를 비교**한다 — 상태가 서로 다른 꽃이 2개 이상 달린 핀이 있어야 판정된다(꽃 1개이거나 상태가 같으면 두 경우의 결과가 같아 구분 불가).
    - 길이가 **같으면** 핀 단위 → `MapContainer.tsx`의 `bloomParams`에서 `status`만 지우면 끝.
    - 길이가 **줄면** 슬롯 단위 → `mapFilter.ts`는 status로 `flowers`를 좁히지 않으므로, 그냥 지우면 "절정" 필터에서 절정이 아닌 꽃 아이콘까지 핀에 뜬다. `narrowToCategories`와 대칭인 status narrow를 **먼저** 추가해야 한다.
- **지도는 전국(`KOREA_BBOX`)을 한 번에 조회한다 — 화면 범위(bbox) 조회로 되돌리지 말 것** (2026-10-06): 예전엔 idle 마다 화면 범위를 격자에 스냅해 조회했는데, 셀이 바뀔 때마다(캐시 히트여도) 데이터 객체가 갈려 `spots` 참조가 바뀌고 → 클러스터 인덱스 재구축 → 묶음 중심 좌표가 달라져 화면의 오버레이를 전부 지우고 다시 만들었다. 운영 실측(모바일 CPU 6배, level 11)에서 드래그·핀치 중 오버레이 생성 약 380회 중 70%가 이 경로였고, 핀 DOM만 빼면 50ms 넘는 프레임이 10회→0회였다(앱에서 줌·드래그가 끊기던 원인). 전국 응답은 665핀·gzip 약 25KB(2026-10). gzip 200KB 쯤 넘으면 핀 전용 경량 응답(id·좌표·상태)을 백엔드에 요청한다.
  - 서버로는 `status`·`region`만 보낸다. 권역은 서버가 동네 핀 주소 첫 토큰으로 판정해서 클라이언트가 거를 수 없다(`MapSpot`에 권역이 없다).
  - `useMapPins.ts`의 `render`는 **화면 + 사방 100px 안의 핀만** DOM 오버레이로 그린다(2026-09-29). 데이터가 전국 분량이라 이게 없으면 전국 오버레이가 붙는다. 클러스터 계산은 전체 spots로 해야 팬해도 묶음이 안 바뀐다 — 거르는 건 그리기 단계뿐이라 zoom·드래그·`idle`에서 다시 그린다. 클러스터·핀 HTML은 객체별로 캐시해 드래그 중에 다시 만들지 않는다.
  - **드래그·관성 이동 중에는 프레임당 시간 예산(`FRAME_BUDGET_MS`, 4ms) 안에서만 새 핀을 만든다** (2026-10-07). 카카오 `CustomOverlay`는 지도에 붙을 때마다 콘텐츠 `offsetHeight/Width`를 읽고 `margin`을 써서(kakao.js `Ud`) 한 번에 여러 개를 만들면 개수만큼 강제 레이아웃이 생긴다. 개수 대신 시간으로 잘라 기기 성능에 맞추고, 화면 안 핀부터 만들며, 남은 것은 `idle`에서 마저 만든다. 제거는 예산과 무관하게 매번 다 한다. 여유(100px)를 넓혀 대신하는 건 줌마다 전체를 다시 만드는 양이 늘어 오히려 손해라 하지 않았다. 실기기에서 조정할 값은 예산 하나다.
  - 화면 안 개수('N개의 명소 보기')는 idle 마다 갱신되는 `viewport` state로 센다. 지도에서 `getBounds()`를 직접 읽으면 그 값이 effect deps에 안 잡혀 개수가 옛 화면 기준으로 남는다.
- **지도 초기 로딩은 SDK 준비가 아니라 첫 `tilesloaded`까지 가린다** (2026-09-02): SDK 콜백 직후에도 실제 타일은 수 초간 비어 있을 수 있어, 상단 UI는 먼저 표시하고 지도 영역의 CSS 스켈레톤만 첫 타일 완료까지 유지한다. `/map` HTML에서 SDK를 preload하며, 화면 전체 지도에 불필요했던 `IntersectionObserver` 지연은 제거했다.
  - 수동 3×3 타일 prefetch는 카카오맵이 요청하는 타일과 경쟁할 수 있고, 기존 서비스워커는 cross-origin 응답을 캐시하지 못하면서 모든 타일에 Cache API 조회를 더할 수 있어 신규 등록을 제거했다. `public/map-tile-sw.js`는 기존 설치본/캐시 정리만 담당한다.
  - **preconnect 호스트는 카카오가 바꾸면 조용히 무효가 된다** (2026-10-06): SDK 엔진·타일이 `t1.daumcdn.net`·`mts.daumcdn.net` → `t1.kakaocdn.net`·`mts.kakaocdn.net`으로 옮겨 가 있었는데 힌트는 옛 호스트를 가리켜, 첫 진입에서 쓰이지 않는 연결 2개를 열고 실제 호스트는 콜드로 연결하고 있었다(기능은 정상이라 눈에 안 띈다). 확인은 운영 `/map`에서 `performance.getEntriesByType('resource')`의 호스트와 `<head>`의 `preconnect`를 비교한다. 지금 요청 호스트는 `dapi.kakao.com`·`t1.kakaocdn.net`·`mts.kakaocdn.net` 세 곳이다.
- **`MapSpot`의 `flowers`/`statuses`/`categories`는 인덱스가 맞물린 병렬 배열**: 같은 꽃이 같은 위치에 들어간다. `mapFilter.ts`가 꽃 종류로 좁힐 때 이 정렬에 기대므로 한쪽만 따로 만들거나 정렬을 바꾸면 안 된다. 핀 색(`maxStage`)은 좁힌 뒤 `constants/map.ts`의 `toMaxStage()`로 다시 계산한다 — 변환(`bloomToMapSpots`)과 필터가 각자 계산하면 필터를 걸었을 때 색만 옛 기준으로 남는다.
- **꽃 목록이 세 곳에 복제돼 있다**: `src/constants/flower.ts`(지도 필터)와 `app/profile/page.tsx`·`app/profile/edit/page.tsx`가 각자 `FLOWER_LIST`를 든다. 요청 DTO별로 orval enum 타입이 갈려서 하나로 못 합쳤다(`SignupCompleteRequestFavoriteCategoriesItem` vs `FavoriteCategoryUpdateRequestCategoriesItem` vs `BloomSlotCategory`). **라벨을 고칠 때 세 곳을 함께 봐야 한다.**
  - 실제로 2026-08-18에 `AZALEA`/`AZALEA_KR`이 세 곳 모두 서버와 반대로 매핑돼 있었다. 서버 `displayName` 기준은 **`AZALEA_KR`=진달래, `AZALEA`=철쭉**이다(enum 이름만 보면 반대로 읽힌다). 아이콘도 `constants/map.ts`에서 함께 맞춰야 한다(`royal-azalea.svg`=철쭉).
  - 프로필 **조회**는 서버 `displayName`을 쓰고 **편집**은 이 하드코딩을 쓴다. 그래서 매핑이 틀리면 같은 유저의 관심 꽃이 두 화면에서 다르게 보인다. 그 시기에 잘못 저장된 데이터는 프론트 수정으로 되돌아가지 않는다.
- **꽃 필터 목록은 서버 enum의 부분집합**: 서버는 15종인데 Figma 필터는 14종이다. 핑크뮬리는 필터에서 뺐지만 서버가 핀으로는 계속 내려주므로 `CATEGORY_ICON`에는 남겨야 한다(지도에는 정상 표시, 필터 항목으로만 안 뜸).
- **`public/`에는 문서를 두지 않는다** (2026-09-16): `public/` 안의 파일은 Next가 그대로 서빙해서 `https://www.peakda.com/CLAUDE.md`, `/terms-prompt.md` 등이 운영에서 누구나 열리고 검색에 잡힐 수 있었다. 디렉터리 안내였던 public/CLAUDE.md 는 없앴고(`map-tile-sw.js` 규칙은 위 지도 로딩 항목과 `ARCHITECTURE.md`에 이미 있다), 약관 생성 프롬프트는 `src/app/Terms/_prompts/`로 옮겼다(`_` 폴더라 라우트도 안 된다).
- **`viewport-fit=cover`를 쓰지 않는다 — 시스템 바 여백은 네이티브가 잡는다** (2026-09-30): Capacitor 8 `SystemBars`는 Android 15+·WebView 140+에서 이 값이 있으면 여백을 CSS `env(safe-area-inset-*)`로 넘기는데, 우리 CSS는 그걸 `Nav`·`Header` 일부만 처리해 S25 등에서 헤더·하단 버튼·바텀시트가 상태바·내비게이션바에 가려졌다(QA P0). 빼면 네이티브가 WebView를 두 바 사이에 배치하고 `env()`는 0이 된다. 시스템 바 뒤까지 까는 디자인이 필요해지면 다시 켜되, 그때는 모든 고정 상·하단 요소에 safe-area 여백을 넣어야 한다.
  - 띠 색은 앱 테마(`AppTheme.NoActionBar`, DayNight) 배경, 아이콘 색도 기기 테마를 따른다(`SystemBars.setStyle`). **테마 배경만 흰색으로 고정하면 다크 모드에서 흰 띠 위 흰 아이콘이 된다** — 바꾸려면 `SystemBars.style`도 함께 고정할 것.

- **비로그인 둘러보기 — 로그인 페이지로 보내지 않고 바텀시트로 막는다** (2026-09-14 `7691b04`·`1e39b2a`): 검색 노출과 첫 방문 이탈 때문에 지도·탐색·피드·스팟·축제·큐레이션은 로그인 없이 열린다. 막힌 경로는 `src/lib/auth/session.ts`의 `PROTECTED_PATHS` 하나로 관리하고 `robots.ts`도 이 목록을 쓴다.
  - 막는 지점이 세 곳이다. ① 앱 안 링크: `LoginGuard`가 `<a>`/`<Link>` 클릭을 **캡처 단계에서 전역으로** 가로챈다(링크마다 막으면 빠뜨리기 쉽다) ② 버튼: `useRequireLogin` ③ 주소 직접 입력·새로고침: `middleware.ts`가 `/map?login=1`로 보내고 돌아올 곳을 one-shot 쿠키(`RETURN_TO`)에 남긴다.
  - **401 이어도 인증 마커가 없으면 refresh·리다이렉트를 하지 않는다** (`src/api/mutator/index.ts`). 비로그인 사용자는 갱신할 쿠키가 없고, 공개 화면이 401 하나로 튕기면 안 되기 때문이다. 마커가 있던 사용자의 refresh 가 실패했을 때만 마커를 지우고 현재 화면 위에 로그인 시트를 연다.
  - `/users`는 백엔드 조회 API가 아직 인증을 요구해서 막혀 있다. 공개되면 `PROTECTED_PATHS`에서 빼면 된다.
- **`loading.tsx` 스켈레톤은 ISR 캐시 미스일 때만 보인다** (2026-10-01 PR #109): `feed`·`feed/[id]`·`spot/[id]`·`explore` 서버 페이지는 `revalidate`로 캐시돼 대부분 즉시 응답한다. 그리고 `loading.tsx`는 **하위 라우트에도 상속**되므로 모양이 다른 하위 화면(`explore/spots`·`explore/festivals`·`spot/[id]/feed`)에는 각자 `loading.tsx`를 둬서 덮어썼다. 상위 화면 UI를 바꾸면 스켈레톤도 함께 맞출 것.
- **낙관적 업데이트는 `onMutate` 가 아니라 로컬 상태·캐시를 먼저 바꾸고 `onError`에서 되돌리는 방식이다**: `HeartBtn`·`BellBtn`·`FollowButton`·찜 시트·`ReactionBar`(`applyReactionToggle`)·스팟 상세(`setFavoriteCache`). `onMutate`로 검색하면 하나도 안 나오지만 낙관적 업데이트가 없는 게 아니다. 새 토글 버튼도 같은 방식으로 맞추고, 실패 시 `toast.error`를 띄운다.
- **분석은 GA4 + Mixpanel 을 같은 `track()`으로 보낸다** (2026-10-03): GA4 는 유입·SEO, Mixpanel 은 퍼널·리텐션용. 이벤트 사전은 [docs/ANALYTICS_EVENTS.md](docs/ANALYTICS_EVENTS.md).
  - **Mixpanel 토큰은 Vercel Production 에만 둔다** — 로컬·프리뷰 데이터가 섞이지 않게 하려는 것이고, 토큰이 없으면 아무것도 보내지 않는다. 그래서 운영 배포 전에는 단위 테스트로만 검증하고, 실제 전송은 운영의 Mixpanel Live View 로 확인한다.
  - **토큰 등록 = 수집 시작이다.** Mixpanel(미국 저장)은 국외 이전이라 개인정보처리방침·Google Play 데이터 보안 양식이 먼저 갱신돼야 한다. 코드를 머지해도 토큰 전에는 수집되지 않는다.
  - **Mixpanel 무료 플랜이라 커스텀 이벤트·코호트 저장이 없다** (2026-10-05 확인) — 그래서 Activation 은 `Activation Action`을 코드에서 함께 보내고, 회원/비회원은 리포트 필터로 나눈다. 저장 리포트는 계정당 5개. 자세한 건 이벤트 사전의 "무료 플랜 제한".
  - 로그아웃 이벤트처럼 "이 회원의 마지막 행동"은 `clearAuthMarker()` **전에** 보내야 한다. 마커가 지워지는 순간 `AnalyticsManager`가 `reset()`해 이후 이벤트는 새 익명 사용자로 간다.
  - **Mixpanel SDK는 코어 로더로 받는다** (2026-10-07): 기본 `mixpanel-browser`는 세션 리플레이 녹화기(rrweb)를 함께 실어 434KB(br 약 98KB, Buffer 폴리필 청크 별도)이고, 녹화를 쓰지 않는데도 하이드레이션 직후 받아 지도 SDK 로딩과 겹쳤다. `mixpanel-browser/src/loaders/loader-module-core`(약 128KB)로 바꿨다. 세션 리플레이를 켜려면 `loader-module-with-async-modules`로 바꾼다.
  - **GA 본체(gtag.js)는 페이지 로드가 끝난 뒤 받는다** (2026-10-07): br 179KB(원본 535KB)로 `/map` 자체 JS와 맞먹는데, `@next/third-parties`의 `GoogleAnalytics`는 `afterInteractive`라 `<head>`에 높은 우선순위 preload가 붙어 첫 화면 번들·지도 SDK와 대역폭을 다퉜다. 그래서 `layout.tsx`에서 `next/script`로 직접 넣고 본체만 `lazyOnload`로 바꿨다. gtag 스텁(`ga-init`)은 예전처럼 하이드레이션 직후 심으므로 `sendWhenReady`는 그대로이고, 그 사이 이벤트는 dataLayer에 쌓였다가 본체가 뜨면 나간다.
    - 대가: 본체가 뜨기 전에 나간 아주 짧은 방문은 GA에 잡히지 않고, 그 사이 다른 화면으로 넘어가면 쌓여 있던 이벤트가 넘어간 화면 주소로 붙을 수 있다. 느린 망에서는 `load`가 타일까지 기다려 늦어진다.
- **PR은 `main` 대상이고, `main`은 보호돼 있다** (2026-10-01): PR 필수 + `ci` 체크 통과 필수(관리자 우회 가능). 로컬 `develop`은 크게 뒤처져 있어 기준으로 쓰지 않는다. Android 워크플로는 필수 체크가 아니다.

## 자주 하는 작업

- **신규 API 도메인 추가**: swagger 갱신 → `pnpm generate:api` → `pnpm generate:facades` (없는 도메인만 스텁 생성) → 파사드 TODO 채우기. 언래핑 규칙: `res.data`(orval 래퍼) → `res.data.data`(백엔드 실제 payload).
- **카카오맵 관련 컴포넌트 추가**: `src/components/Map` 하위에 작성하고 `dynamic import + ssr: false`로 로드 (`src/CLAUDE.md` 참고).
