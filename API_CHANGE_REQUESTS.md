# Peakda API 변경 요청서

> **개정일**: 2026-08-10 (2차 개정 8/8 · 초판 8/4) · **기준 스펙**: PEAKDA API v1 (`swagger.json`, Develop: `https://peakda-dev.up.railway.app`)
> **범위**: 백엔드 조치가 필요한 항목만. 프론트에서 자체 해결 가능한 건은 제외했습니다.
> 이 문서의 모든 항목은 **작성일 기준 코드베이스에서 실제 호출부를 확인**하고 적었습니다.

## 이번 개정에서 달라진 것

지도 필터를 재설계하고 `GET /api/spots/preview` 를 실제로 연결하면서, **11번의 성격이 "쓸지 말지"에서 "쓰고 있는데 필드가 부족하다"로 바뀌었습니다.** 그 과정에서 신규 2건(12·13)이 생겼습니다.

| # | 우선순위 | 항목 | 8/8 대비 |
|---|---|---|---|
| 1 | **P0** | 조회 응답에 "내 상태"(리액션·차단·팔로우)가 없음 | 유지 |
| 2 | P1 | `SpotSearchItem` 표시 정보 부족 | 유지 (3건) |
| 3 | P1 | `ExploreFestivalItem` 에 이미지·진행상태 없음 | 유지 |
| 4 | P1 | `ExploreSpotItem.spotId` null 정책 | **근거 추가** — 필터 목록에서 스팟이 누락됨 |
| 5 | P2 | 필터 조건 파라미터 | 2건 (`region` 은 8/10 철회 취소) |
| 6 | P2 | 꽃 카테고리 enum | 철회 — 확인만 |
| 7 | P2 | 알림 딥링크 규격 미문서화 | 유지 (**P2 중 최우선**) |
| 8 | P2 | 축제 문의처 필드 없음 | 유지 |
| 9 | P3 | 미연동 엔드포인트 정리 | 유지 |
| 10 | P2 | 사진 업로드가 1장씩만 가능 | 유지 |
| 11 | **P1** | `GET /api/spots/preview` 필드 부족 | **P2 → P1 격상, 내용 전면 교체** |
| 12 | P2 | `category` 를 복수로 받을 수 없음 | **신규** |
| 13 | P3 | `date` 지정 시 동네형 핀 처리 | **신규** (질문) |

---

## P0

### 1. 조회 응답에 "내 상태"가 없어 토글이 중복 요청으로 나갑니다

세 곳에서 같은 문제가 반복됩니다. 상태를 만드는 API(POST/DELETE)는 있는데 **조회 응답에 현재 상태가 없어서** 프론트가 `false`/빈 배열로 시작합니다. 이미 누른 버튼이 "안 누른" 상태로 렌더되고, 누르면 취소가 아니라 **중복 생성 요청**이 나갑니다.

| 스키마 | 빠진 필드 | 영향 화면 | 증상 |
|---|---|---|---|
| `SpotRecordSummaryResponse`, `SpotRecordResponse` | `reactions` | `/feed`, `/feed/[id]`, `/spot/[id]`, `/record/[id]` | 개수가 항상 0, 새로고침하면 내 리액션이 사라짐 |
| `UserProfileResponse` | `blocked` | `/users/[id]` | 차단한 유저인데 메뉴가 "차단하기"로 뜸 |
| `UserSearchItem` | `following` | `/search` | 팔로우 중인 유저인데 버튼이 "팔로우"로 뜸 |

> `UserProfileResponse.following` 은 이미 있습니다 — 잘 쓰고 있습니다. **같은 필드를 `UserSearchItem` 에도** 주시면 됩니다.

**요청**

```jsonc
// SpotRecordSummaryResponse / SpotRecordResponse — FeedReactionSummaryResponse 구조 재사용
{
  "reactions": {                                   // required
    "counts": [{ "reactionType": "HEART", "count": 12 }],  // 0인 타입은 생략 가능
    "myReactions": ["HEART"]                       // 비로그인 시 빈 배열
  }
}

// UserProfileResponse
{ "blocked": false }    // required, 비로그인 시 false

// UserSearchItem
{ "following": false }  // required, 비로그인 시 false
```

**이 건의 체감 비용이 계속 커지고 있습니다.**

- 리액션 mutation 이 피드 목록까지 무효화하면 무한 스크롤로 쌓인 페이지를 전부 다시 불러와 스크롤이 튀기 때문에, **목록 캐시 무효화를 걷어냈습니다.** 그래서 목록 카드는 이제 mutation 응답에만 의존하며, 사용자가 한 번 누르기 전까지는 어떤 값도 표시할 방법이 없습니다.
- `/search` 팔로우 버튼(`src/app/search/_components/UserList.tsx`)은 실제 mutation 에 연결돼 있습니다. **누르면 팔로우는 되지만 새로고침하면 "팔로우"로 되돌아갑니다.** `following` 한 줄이면 정상화됩니다.
- `/users/[id]` 차단 상태는 여전히 `useState(false)` 로만 추적합니다 (`src/app/users/[id]/page.tsx:25`).

**보조 질문**: 목록(`GET /api/feed`)에서 N+1 이 부담이면 `counts` 만 내리고 `myReactions` 는 상세에만 넣어도 됩니다. 다만 그 경우 목록에서 토글 선택 상태를 표현할 수 없습니다.
**보조 질문**: 상대가 나를 차단한 경우의 응답 정책(404 / 빈 프로필 / 별도 플래그)도 알려주시면 화면에 반영하겠습니다.

---

## P1

### 2. `SpotSearchItem` 표시 정보 부족

**영향 화면**: `/search` — 검색 결과 카드가 다른 화면의 스팟 카드 대비 정보량이 적습니다.

현재 필드: `spotId`, `type`, `name`, `address`, `latitude`, `longitude`. `type` 은 명소/동네 태그로 쓰고 있습니다.

```jsonc
{
  "thumbnailUrl": "https://...",           // nullable
  "bloom": { /* 기존 bloom 구조 재사용 */ },  // nullable, 개화 정보 없으면 null
  "favorited": false                       // 비로그인 시 false
}
```

`SpotFavoriteResponse` / `ExploreSpotItem` 의 기존 구조를 그대로 재사용해 주시면 됩니다. `UserSearchItem.following` 은 1번에 포함했습니다.

### 3. `ExploreFestivalItem` 에 이미지·진행상태가 없습니다

**영향 화면**: `/explore`, `/explore/festivals`

목록용 DTO 에 이미지와 상태가 없어 축제 카드가 **전부 동일한 플레이스홀더 이미지**입니다. `FestivalDetailResponse` 에는 `phase` 와 `editorial.heroImageUrl` 이 있는데 목록에서는 못 씁니다.

```jsonc
// ExploreFestivalItem 추가
{
  "thumbnailUrl": "https://...",  // nullable. 에디토리얼 heroImageUrl 또는 대표 이미지
  "phase": "ONGOING"              // FestivalDetailResponse.phase 와 동일 enum
}
```

> **배지는 프론트에서 임시 해결했습니다.** `"진행중"` 하드코딩 때문에 이미 끝난 축제도 진행중으로 표시되던 문제라, `startsOn`/`endsOn`/`endsInDays` 로 `예정`/`진행중`/`곧 종료`/`종료` 를 판정하는 함수를 넣었습니다 (`src/lib/utils/explore.ts` 의 `toFestivalStatus`).
>
> **그래도 `phase` 를 요청드립니다.** 프론트 판정은 날짜만 보므로 **취소·연기를 표현할 수 없고**, 서버와 판정 기준이 갈릴 위험이 있습니다. `phase` 가 오면 이 함수는 걷어냅니다. **이미지(`thumbnailUrl`)는 대안이 없어 그대로 미해결입니다.**

`GET /api/explore/festivals` 가 진행 중 축제만 반환한다면 **최소한 `ONGOING` / `ENDING_SOON` 은 구분**되어야 "곧 종료" 안내가 가능합니다.

### 4. `ExploreSpotItem.spotId` 가 null 일 때 상세 진입 경로가 없습니다

**영향 화면**: `/explore`, `/explore/spots`, **그리고 8/10부터 지도 필터 목록**

`spotId` 가 null 이면 프론트에 `attractionId` 밖에 없는데, 상세는 `GET /api/spots/{id}` 로 **spotId 만** 받습니다. 같은 이유로 `favorited`/`notifyEnabled` 도 항상 false 라 찜 버튼을 눌러도 저장할 대상이 없습니다.

> **8/10 추가된 근거.** 지도 필터 결과 목록을 `GET /api/spots/preview` 로 붙였는데, 이 API 도 `spotIds` 로만 조회합니다. 그래서 **`spotId` 가 null 인 명소는 지도에 핀으로는 보이는데 필터 목록에는 아예 나오지 않습니다.** "3개의 명소 보기"를 눌렀는데 2개만 나오는 상황이 가능합니다. 프론트에서 목록용으로 `POST /api/spots/match` 를 N번 호출하는 건 조회에 쓰기엔 부작용이 커서 하지 않았습니다.

| 안 | 내용 | 프론트 영향 |
|---|---|---|
| **A (선호)** | 탐색·지도 응답에 노출되는 명소는 Spot 행을 **미리 생성**해 `spotId` 를 항상 채움 | 분기 제거, 목록 누락 해소, `spots/match` 호출부 소멸 |
| B | `GET /api/spots/by-attraction/{attractionId}` 추가 | 상세 진입만 해결. 찜·목록 누락은 그대로 |
| C | 현행 유지 | `spotId == null` 카드 비활성 + 필터 목록 누락 감수 |

**현재 프론트는 C안으로 동작 중입니다.** A안으로 가시면 그 분기를 걷어내겠습니다. 어느 쪽인지만 알려주세요.

### 11. `GET /api/spots/preview` 에 `favorited` · `address` · 사진 배열이 필요합니다 *(P2 → P1, 내용 교체)*

> **8/8 문서에서는 "이 API 를 정식 경로로 쓸지 결정해 달라"는 A/B/C 선택지였습니다. 8/10 에 A안 방향으로 붙였고, 이제 부족한 필드가 화면에 그대로 드러나고 있어 격상합니다.**

**어디에 쓰고 있는지** — 필터 드로어에서 지역·시기·꽃 종류를 고르고 하단 `명소 보기` 를 누르면, 현재 지도에 걸린 스팟 id 들을 모아 이 API 를 **한 번** 호출하고 결과를 바텀시트 목록으로 띄웁니다 (`src/components/ui/layout/Drawer.tsx` 의 `openPreviewList`). 상세를 N번 부르는 대신 이 API 를 쓴 건 정확히 의도하신 용법이라고 봅니다 — `spotIds` 배열, 카드 한 장 분량 응답, 순서 보존까지 설계가 명확합니다.

**문제는 목록 카드가 요구하는 3가지가 응답에 없다는 점입니다.**

| 카드가 쓰는 것 | preview | 현재 프론트가 하는 임시 처리 |
|---|---|---|
| 유저 사진 **최대 3장** (3칸 그리드) | `thumbnailUrl` **1장** | 한 칸만 채우고 두 칸은 빈칸 |
| 찜 하트 상태 | ❌ 없음 | **항상 꺼진 하트**로 렌더 |
| 위치(주소) 줄 | ❌ 없음 | `distanceMeters` 를 `1.2km` 로 변환해 주소 자리에 대신 표시 |

**요청**

```jsonc
// SpotPreviewItem 추가
{
  "address": "경남 창원시 진해구 ...",   // nullable
  "favorited": false,                    // 비로그인 시 false
  "photoUrls": ["https://...", "..."]    // 최대 3장. thumbnailUrl 은 하위호환으로 남겨두셔도 됩니다
}
```

세 필드 모두 `GET /api/spots/{id}` 에 이미 있는 값입니다(`address`, `favorite.favorited`, `recordPreview[].coverPhoto`). **이게 오면 단일 핀 드로어까지 preview 로 통일**해서, 지도 핀 탭이 요청 1번으로 끝나고 `spots/{id}` 호출이 사라집니다. 지금은 단일 핀만 상세를 쓰고 있어 같은 드로어가 경로에 따라 다르게 채워집니다.

**추가 확인 2건**

- **`BloomBadge.status` 의 설명이 낡았습니다.** 설명에는 `(PREPARING/STARTED/PEAK)` 3개라고 적혀 있는데 실제 enum 과 실제 응답에는 `ENDED` 가 포함된 4개입니다. 프론트는 4개 기준(`개화 종료` 표기 포함)으로 처리하고 있으니 **설명 쪽을 고쳐 주세요.**
- 응답이 요청 순서를 보존한다고 되어 있습니다. 프론트는 지금 지도에 걸린 순서 그대로 넘기고 있는데, 목록은 **거리순**이 자연스럽습니다. `distanceMeters` 정렬은 프론트가 해도 되는지, 서버 정렬 옵션을 둘 계획인지 알려주세요.

---

## P2

### 5. 필터 조건 파라미터 2건

```
GET /api/search/spots     + category?: (꽃 카테고리 enum)
GET /api/seasonal/blooms  + region?:   (권역 코드)
```

**`region` 은 초판에서 철회했다가 되살립니다.** 필터 드로어의 지역 탭을 없애려다 유지하기로 방향이 바뀌었는데, 서버 파라미터가 없어 지금은 **고를 수만 있고 결과에 전혀 반영되지 않습니다.** 사용자 입장에선 "제주를 골랐는데 보고 있던 서울 명소가 그대로 나오는" 상태라, 사실상 고장난 화면으로 보입니다.

권역 6개(수도권 / 강원 / 충청 / 경상 / 전라 / 제주)는 프론트가 임의로 정한 값입니다. **서버 기준 권역 코드가 있으면 그쪽에 맞추겠습니다.** 없으면 이 6개를 그대로 쓰실지, 다른 구분을 쓰실지 알려주세요.

> 일정만 알려주시면, 그때까지 프론트에서 지역 탭을 임시로 막을지 판단하겠습니다.

<details>
<summary>초판에서 요청했다가 철회한 항목과 그 이유</summary>

- **`GET /api/seasonal/blooms` 의 `status`, `type`** — 철회. 지도는 bbox 로 조회하므로 응답을 받아 **클라이언트에서 거르는 것으로 충분**했습니다. `BloomMapPin.type` 과 `BloomSlot.status` 가 이미 응답에 있어 추가 필드도 필요 없었습니다.
- **`category`** — 이미 여러 엔드포인트에 있었고 프론트가 연결하지 않고 있었을 뿐입니다. 8/8 연결 완료. 다만 **복수 선택 문제는 12번으로 남았습니다.**

</details>

### 12. `category` 를 복수로 받을 수 없습니다 *(신규)*

**영향 화면**: `/map` 필터 드로어의 꽃 종류 탭

디자인상 꽃 종류는 **복수 선택**입니다(벚꽃 + 유채를 같이 보기). 그런데 `GET /api/seasonal/blooms` 와 `GET /api/spots/preview` 의 `category` 는 **단일 enum** 이라 그대로는 표현할 수 없습니다.

**현재 프론트 처리와 그 대가**

- `blooms` 는 `category` 를 **아예 보내지 않고** 전부 받아서 응답의 `blooms[].category` 로 클라이언트에서 거릅니다. 동작은 하지만 **필요 없는 핀까지 다 받습니다.**
- `preview` 는 1개만 골랐을 때만 `category` 를 보내고, **2개 이상이면 생략합니다.** 생략하면 각 스팟의 *대표* 단계로 배지가 내려오므로, **벚꽃+유채로 거른 목록에 단풍 배지가 뜰 수 있습니다.**

```
GET /api/seasonal/blooms  category → categories?: enum[]   (반복 파라미터 또는 콤마 구분)
GET /api/spots/preview    category → categories?: enum[]
```

기존 `category` 는 그대로 두고 `categories` 를 추가하셔도 됩니다. **우선순위는 `preview` 쪽이 높습니다** — 배지가 틀리는 건 사용자 눈에 바로 보이는 오류이고, `blooms` 쪽은 과다 조회일 뿐입니다.

### 6. ~~꽃 카테고리 enum 확정~~ — 철회, 확인만 부탁드립니다

프론트의 꽃 목록 두 벌(프로필 편집 / 필터 드로어)이 서로 달랐던 문제는 **API enum 13개 기준으로 통일해 해결했습니다.** 필터 드로어에만 있던 해바라기·국화를 제거하고 핑크뮬리를 넣었습니다.

현재 enum(13): `PLUM, FORSYTHIA, AZALEA_KR, CHERRY, CANOLA, AZALEA, HYDRANGEA, LOTUS, COSMOS, PINK_MUHLY, SILVERGRASS, MAPLE, CAMELLIA`

- **해바라기 / 국화 지원 계획이 있나요?** 있으면 `SUNFLOWER`, `CHRYSANTHEMUM` 추가 시점만 알려주세요. 없으면 종결입니다.
- 프론트는 `AZALEA` = 진달래, `AZALEA_KR` = 철쭉으로 매핑하고 있습니다. enum 이름만 보면 반대로 읽히는데(`_KR` 이 진달래일 것 같은), **서버 `displayName` 기준으로 맞춘 것**입니다. 이대로 맞는지만 확인 부탁드립니다.

### 7. 알림 딥링크 규격 문서화 — **P2 중 가장 시급합니다**

**영향 화면**: `/notification` — 알림을 눌러도 **읽음 처리만 되고 아무 데도 가지 않습니다** (`src/components/notification/NotificationTabs.tsx`, `onClick` 이 `markRead` 만 호출).

`NotificationResponse` 에 `linkType`(INTERNAL/EXTERNAL) · `linkUrl` · `targetId` 가 있고 `targetId` 설명에 "팔로워 id·기록 id·스팟 id 등"이라고만 적혀 있어 타입별 조합을 확정할 수 없습니다. **아래 표만 채워주시면 바로 연결하겠습니다.**

| `type` | `linkType` | `targetId` 의미 | 이동할 화면 |
|---|---|---|---|
| `TIMING` | ? | spotId? attractionId? | `/spot/{id}` ? |
| `FOLLOW` | ? | userId | `/users/{id}` ? |
| `REACTION` | ? | recordId | `/feed/{id}` ? |
| `NOTICE` | ? | noticeId? | ? |

- `INTERNAL` 일 때 `linkUrl` 이 **프론트 경로 문자열**인지, `targetId` 로 프론트가 조합해야 하는지도 알려주세요.
- `segment` 에 `TIMING` 값이 있는데 화면 탭은 전체/활동/공지 3개뿐입니다. **TIMING 탭이 기획에 있나요?**

### 8. 축제 문의처 필드가 없습니다

`FestivalDetailResponse` / `FestivalEditorialResponse` 에 전화번호·문의처가 없어 현재 `homepageUrl` 링크로 대체 중입니다. 원천 데이터(TourAPI 등)에 있다면 `{ "inquiryPhone": "055-225-3000" }`(nullable) 추가를 요청드립니다.

### 10. 사진 업로드가 1장씩만 가능합니다

`SpotRecordPhotoUploadForm.images` 가 `type: Blob`(단일)이라 5장 올릴 때 **요청을 5번** 보냅니다.

**스펙 자체가 모순입니다** — 필드명은 복수형이고 설명에도 `"업로드할 이미지 파일들 (jpeg/png/webp, 1~5장, 단일 파일 최대 10MB)"` 라고 적혀 있는데 타입은 단일입니다. 다중 업로드가 원래 의도였던 것으로 보입니다.

**우선순위 이유**: 프론트에서 **부분 실패 시 기록 생성을 전체 중단**하도록 바꿨습니다. 이전에는 실패한 사진만 조용히 빠진 채 기록이 만들어져 사용자가 손실을 몰랐기 때문입니다. 그 결과 **5장 업로드에 실패 지점이 5개**가 되어, 모바일 네트워크에서 기록 작성 실패율이 직접 올라갑니다.

```jsonc
{ "images": ["<binary>", "<binary>"] }   // 배열로 변경, 1~5장
```

---

## P3

### 13. `date` 를 지정하면 동네형 핀은 어떻게 다뤄야 하나요 *(신규 · 질문)*

`GET /api/seasonal/blooms` 의 `date` 설명이 이렇습니다.

> 방문예정일 (생략 시 오늘 기준). 명소형 핀 상태를 해당일 기준으로 재계산한다. **동네형은 최근 관측값 유지.**

필터의 시기 탭을 이 파라미터로 붙였습니다 (`절정`=오늘·미전송 / `피기시작`=+10일 / `이르다`=+25일). 그런데 미래 날짜를 보낼 때 **명소형은 그날 기준, 동네형은 오늘 기준**이라 두 기준이 한 지도에 섞입니다. "2주 뒤 절정인 곳"을 보는데 동네 핀은 지금 절정인 곳이 나옵니다.

**프론트는 미래 날짜일 때 상단 칩을 명소로 강제하고 전체·동네를 비활성 처리했습니다.** 사용자가 동네 핀을 볼 수 없게 되지만, 섞이는 것보다는 낫다고 판단했습니다.

- 이 처리가 의도에 맞나요? 아니면 **서버가 `date` 지정 시 동네형을 아예 빼는 게** 맞나요?
- 동네형도 예측 재계산이 가능해질 계획이 있나요? 있으면 프론트 제약을 걷어내겠습니다.

급하지 않습니다. **의도만 확인되면 됩니다.**

### 9. 미연동 엔드포인트 정리

**해소된 것 — 확인만 부탁드립니다**

| 엔드포인트 | 결과 |
|---|---|
| `GET /api/spots/records/me` | **연동 완료.** `/my/records`(내 기록 전체보기) 신설. `MyPageResponse.recordPreview` 주석의 "더보기는 스팟 기록 리스트 API로"를 근거로 삼았습니다 |
| `GET /api/curations` | 큐레이션 카드 → `/creators/{id}` 상세로 연동 완료. **다만 별도의 큐레이션 "목록 화면"은 여전히 없습니다** — 기획에 있나요? 없으면 이 엔드포인트는 미사용으로 남습니다 |
| `GET /api/seasonal/blooms/peak` | `GET /api/explore` 와 중복이라 **프론트 파사드를 삭제**했습니다. **폐기 예정이 맞나요?** 아니라면 되돌리겠습니다 |
| `GET /api/users/{userId}/follow-summary` | `UserProfileResponse.stats` 와 겹쳐 **프론트 파사드를 삭제**했습니다. 다른 용도가 있으면 알려주세요 |
| `GET /api/seasonal/blooms/calendar` | **연동 완료(피드 상세 `/feed/{id}`).** 파라미터는 `SpotDetailResponse.attractionId` + `bloom.category` 로 조립합니다. 다만 **`days[]` 를 타임라인 UI 로 그리지는 않고** ① 오늘 상태 뱃지 ② 다가오는 주말 절정 여부(`이번 주말이 딱이에요`) 판정에만 씁니다. 절정 구간·지속일은 `peakStartDate`/`peakEndDate`/`peakDurationDays` 를 그대로 표시합니다 |
| `GET /api/spots/preview` | **연동 완료.** 11번으로 옮겼습니다 |

**여전히 미연동**

| 엔드포인트 | 상태 |
|---|---|
| `POST /api/spots/records/{id}/publish` | **임시저장(DRAFT) 흐름이 기획에 있나요?** 현재 생성은 항상 `PUBLISHED` 이고 프론트 파사드는 삭제했습니다. 계획이 없으면 엔드포인트도 정리하시는 편이 좋겠습니다 |
| `POST /api/devices` / `DELETE /api/devices/{token}` | 파사드는 있으나 화면 연결 없음. **푸시 인프라(FCM 등) 도입 일정**이 잡히면 알려주세요 |

**스펙 정리 (급하지 않음)**

- **`FestivalDetailResponse` 의 `dDay` / `dday` 중복** — 의미가 같은 필드가 둘인데 `dDay` 는 `writeOnly: true`(규약상 응답 미포함)이고 `dday` 는 nullable·description 이 없습니다. 프론트는 `startsOn` 으로 직접 계산하도록 바꿨으므로 급하지 않지만, 둘 중 하나로 정리하시는 편이 좋겠습니다.
- **`POST /api/spots/match` 의 부작용** — 지도 핀 클릭 시 `spotId` 없는 명소를 이 API 로 생성(materialize)하고 있습니다. **조회 동작에 POST 생성이 일어나는 구조**입니다. 스팟 상세 → 기록 작성 경로에서는 제거해서 **남은 호출부는 지도 핀 클릭 한 곳뿐**이고, 4번을 A안으로 해결하면 그것도 사라집니다.

---

## 부록: 대응 API 가 없는 로컬 전용 기능 (기획 확인)

- 설정 > **위치 정보 활용 / EXIF 자동 추출** 토글 — 서버 저장이 필요한가요, 클라이언트 설정으로 충분한가요? **현재 두 토글은 켜진 것처럼 보이지만 아무 동작도 하지 않습니다**(`initialStatus={true}` 고정). 클라이언트 설정으로 충분하다면 프론트에서 localStorage 로 마무리하겠습니다.
- 검색 **최근 검색어** — localStorage 로 구현했습니다. 기기 간 동기화 계획이 있으면 알려주세요.
