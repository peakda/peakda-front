# Peakda API 변경 요청서

> **개정일**: 2026-08-08 (초판 2026-08-04) · **기준 스펙**: PEAKDA API v1 (`swagger.json`, Develop: `https://peakda-dev.up.railway.app`)
> **범위**: 백엔드 조치가 필요한 항목만. 프론트에서 자체 해결 가능한 건은 제외했습니다.

## 이번 개정에서 달라진 것

초판(8/4) 이후 프론트에서 대규모 연동 작업을 진행하면서 **9건 중 3건이 해소되거나 축소**됐습니다. 초판을 이미 보셨다면 아래 표의 **변경/철회 행만** 다시 봐주시면 됩니다.

| # | 우선순위 | 항목 | 초판 대비 |
|---|---|---|---|
| 1 | **P0** | 조회 응답에 "내 상태"(리액션·차단·팔로우)가 없음 | **유지** — 근거 보강 |
| 2 | P1 | `SpotSearchItem` 표시 정보 부족 | **축소** — `type`은 프론트가 쓰기 시작 |
| 3 | P1 | `ExploreFestivalItem` 에 이미지·진행상태 없음 | **축소** — 배지는 프론트에서 날짜로 임시 판정, 이미지는 미해결 |
| 4 | P1 | `ExploreSpotItem.spotId` null 정책 | 유지 |
| 5 | P2 | 필터 조건 파라미터 부재 | **축소** — 2건만 남음 (`region` 은 철회 취소) |
| 6 | P2 | 꽃 카테고리 enum | **철회** — 프론트에서 13개로 통일 완료 |
| 7 | P2 | 알림 딥링크 규격 미문서화 | 유지 (**P2 중 최우선**) |
| 8 | P2 | 축제 문의처 필드 없음 | 유지 |
| 9 | P3 | 미연동 엔드포인트 정리 | **8건 중 4건 해소** |
| 10 | P2 | 사진 업로드가 1장씩만 가능 | **P3 → P2 격상** |
| 11 | P2 | `GET /api/spots/preview` 를 핀 카드 정식 경로로 쓸지 | **P3 → P2 격상** — 필터 배지 불일치 발생 |

---

## P0

### 1. 조회 응답에 "내 상태"가 없어 토글이 중복 요청으로 나갑니다

세 곳에서 같은 문제가 반복됩니다. 상태를 만드는 API(POST/DELETE)는 있는데 **조회 응답에 현재 상태가 없어서** 프론트가 `false`/빈 배열로 시작합니다. 이미 누른 버튼이 "안 누른" 상태로 렌더되고, 누르면 취소가 아니라 **중복 생성 요청**이 나갑니다.

| 스키마 | 빠진 필드 | 영향 화면 | 증상 |
|---|---|---|---|
| `SpotRecordSummaryResponse`, `SpotRecordResponse` | `reactions` | `/feed`, `/feed/[id]`, `/spot/[id]`, `/record/[id]` | 개수가 항상 0, 새로고침하면 내 리액션이 사라짐 |
| `UserProfileResponse` | `blocked` | `/users/[id]` | 차단한 유저인데 메뉴가 "차단하기"로 뜸 |
| `UserSearchItem` | `following` | `/search` | 팔로우 중인 유저인데 버튼이 "팔로우"로 뜸 |

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

**8/8 추가된 근거 — 이 건의 체감 비용이 커졌습니다.**

- 목록 캐시 무효화를 걷어냈습니다. 리액션 mutation 이 피드 목록까지 무효화하면 무한 스크롤로 쌓인 모든 페이지를 다시 불러와 스크롤이 튀기 때문입니다. 그래서 **목록 카드는 이제 mutation 응답에만 의존**하며, 사용자가 한 번 누르기 전까지는 어떤 값도 표시할 방법이 없습니다.
- `/search` 팔로우 버튼은 프론트에서 실제 mutation 에 연결했습니다. 이제 **누르면 팔로우는 되지만, 새로고침하면 버튼이 "팔로우"로 되돌아갑니다.** `following` 필드만 오면 바로 정상화됩니다.
- `/users/[id]` 차단 상태는 여전히 컴포넌트 로컬 `useState(false)` 로만 추적합니다.

**보조 질문**: 목록(`GET /api/feed`)에서 N+1 이 부담이면 `counts` 만 내리고 `myReactions` 는 상세에만 넣어도 됩니다. 다만 그 경우 목록에서 토글 선택 상태를 표현할 수 없습니다.
**보조 질문**: 상대가 나를 차단한 경우의 응답 정책(404 / 빈 프로필 / 별도 플래그)도 알려주시면 화면에 반영하겠습니다.

---

## P1

### 2. `SpotSearchItem` 표시 정보 부족 *(범위 축소)*

**영향 화면**: `/search` — 검색 결과 카드가 다른 화면의 스팟 카드 대비 정보량이 적습니다.

현재 필드: `spotId`, `type`, `name`, `address`, `latitude`, `longitude`.

~~`type` 미사용~~ → **8/8 프론트에서 명소/동네 태그로 표시하기 시작했습니다.** 아래 3개만 남았습니다.

```jsonc
{
  "thumbnailUrl": "https://...",           // nullable
  "bloom": { /* 기존 bloom 구조 재사용 */ },  // nullable, 개화 정보 없으면 null
  "favorited": false                       // 비로그인 시 false
}
```

`SpotFavoriteResponse` / `ExploreSpotItem` 의 기존 구조를 그대로 재사용해 주시면 됩니다. `UserSearchItem.following` 은 1번에 포함했습니다. `followerCount` 도 있으면 좋지만 필수는 아닙니다.

### 3. `ExploreFestivalItem` 에 이미지·진행상태가 없습니다

**영향 화면**: `/explore`, `/explore/festivals`

목록용 DTO 에 이미지와 상태가 없어, 축제 카드가 **전부 동일한 플레이스홀더 이미지**입니다. `FestivalDetailResponse` 에는 `phase` 와 `editorial.heroImageUrl` 이 있는데 목록에서는 못 씁니다.

> **8/9 업데이트 — 배지는 프론트에서 임시 해결했습니다.** `"진행중"` 하드코딩 때문에 **이미 끝난 축제도 진행중으로 표시되던** 문제라, `startsOn`/`endsOn`/`endsInDays` 만으로 `예정`/`진행중`/`곧 종료`/`종료` 를 판정하는 함수를 넣었습니다 (`src/lib/utils/explore.ts` 의 `toFestivalStatus`). **여전히 `phase` 를 요청드립니다** — 프론트 판정은 날짜만 보므로 취소·연기 같은 상태를 표현할 수 없고, 서버와 판정 기준이 갈릴 위험이 있습니다. `phase` 가 오면 이 함수만 걷어냅니다. **이미지(`thumbnailUrl`)는 그대로 미해결입니다.**

```jsonc
// ExploreFestivalItem 추가
{
  "thumbnailUrl": "https://...",  // nullable. 에디토리얼 heroImageUrl 또는 대표 이미지
  "phase": "ONGOING"              // FestivalDetailResponse.phase 와 동일 enum
}
```

`GET /api/explore/festivals` 가 진행 중 축제만 반환한다면 **최소한 `ONGOING` / `ENDING_SOON` 은 구분**되어야 "곧 종료" 안내가 가능합니다.

> 참고: `endsInDays` 로 카드 설명에 "종료 D-3" 은 이미 표시하고 있습니다. 배지 색·문구 판정만 `phase` 가 필요합니다.

### 4. `ExploreSpotItem.spotId` 가 null 일 때 상세 진입 경로가 없습니다

**영향 화면**: `/explore`, `/explore/spots`

`spotId` 가 null 이면 프론트에 `attractionId` 밖에 없는데, 상세는 `GET /api/spots/{id}` 로 **spotId만** 받습니다. 같은 이유로 `favorited`/`notifyEnabled` 도 항상 false 라 찜 버튼을 눌러도 저장할 대상이 없습니다.

| 안 | 내용 | 프론트 영향 |
|---|---|---|
| **A (선호)** | 탐색 응답에 노출되는 명소는 Spot 행을 **미리 생성**해 `spotId` 를 항상 채움 | 분기 제거, 가장 단순 |
| B | `GET /api/spots/by-attraction/{attractionId}` 추가 | 상세 진입만 해결, 찜은 불가 |
| C | 현행 유지 | `spotId == null` 카드를 비활성 처리 |

**현재 프론트는 C안으로 동작 중입니다** — `spotId` 가 null 인 카드는 링크 없이 렌더됩니다. A안으로 가시면 그 분기를 걷어내겠습니다. 어느 쪽인지만 알려주세요.

---

## P2

### 5. 필터 조건 파라미터 2건 *(축소, `region` 은 되살림)*

초판에서 요청드린 필터 파라미터 대부분은 프론트에서 해결했습니다. **남은 건 두 줄입니다.**

```
GET /api/search/spots     + category?: (꽃 카테고리 enum)
GET /api/seasonal/blooms  + region?:   (권역 코드)
```

**`region` 은 초판에서 철회했다가 되살립니다.** 필터 드로어의 지역 탭을 없애려다 유지하기로 방향이 바뀌었는데, 서버 파라미터가 없어 지금은 **고를 수만 있고 결과에 전혀 반영되지 않습니다.** 사용자 입장에선 "제주를 골랐는데 보고 있던 서울 명소가 그대로 나오는" 상태라, 사실상 고장난 화면으로 보입니다.

권역 6개(수도권 / 강원 / 충청 / 경상 / 전라 / 제주)는 프론트가 임의로 정한 값입니다. **서버 기준 권역 코드가 있으면 그쪽에 맞추겠습니다.** 없으면 이 6개를 그대로 쓰실지, 아니면 다른 구분을 쓰실지 알려주세요.

> 이 파라미터가 언제 가능할지만 알려주시면, 그때까지 프론트에서 지역 탭을 임시로 막을지 판단하겠습니다.

<details>
<summary>초판에서 요청했다가 철회하는 항목과 그 이유</summary>

- **`GET /api/seasonal/blooms` 의 `status`, `type`** — 철회. 지도는 bbox 로 조회하므로 응답을 받아 **클라이언트에서 거르는 것으로 충분**했습니다. `BloomMapPin.type` 과 `BloomSlot.status` 가 이미 응답에 있어 추가 필드도 필요 없었습니다. 다소 과다 조회지만 bbox 범위가 좁아 감수합니다.
- **`category`** — 이미 `GET /api/seasonal/blooms`, `GET /api/explore`, `GET /api/explore/spots`, `GET /api/explore/festivals` 에 있었고, 프론트가 연결하지 않고 있었을 뿐입니다. 8/8 연결 완료.

</details>

### 6. ~~꽃 카테고리 enum 확정~~ — 철회, 확인만 부탁드립니다

프론트의 꽃 목록 두 벌(프로필 편집 / 필터 드로어)이 서로 달랐던 문제는 **API enum 13개 기준으로 통일해 해결했습니다.** 필터 드로어에만 있던 해바라기·국화를 제거하고 핑크뮬리를 넣었습니다.

- **해바라기 / 국화 지원 계획이 있나요?** 있으면 `SUNFLOWER`, `CHRYSANTHEMUM` 추가 시점만 알려주세요. 없으면 이 건은 종결입니다.

현재 enum(13): `PLUM, FORSYTHIA, AZALEA_KR, CHERRY, CANOLA, AZALEA, HYDRANGEA, LOTUS, COSMOS, PINK_MUHLY, SILVERGRASS, MAPLE, CAMELLIA`

> 확인 하나: 프론트는 `AZALEA` = 진달래, `AZALEA_KR` = 철쭉으로 매핑하고 있습니다. enum 이름만 보면 반대로 읽히는데(`_KR` 이 진달래일 것 같은), **서버가 내려주는 `displayName` 기준이 맞습니다.** 현재 매핑이 맞는지만 확인 부탁드립니다.

### 7. 알림 딥링크 규격 문서화 — **P2 중 가장 시급합니다**

**영향 화면**: `/notification` — 알림을 눌러도 **읽음 처리만 되고 아무 데도 가지 않습니다.**

`NotificationResponse` 에 `linkType`(INTERNAL/EXTERNAL) · `linkUrl` · `targetId` 가 있고 `targetId` 설명에 "팔로워 id·기록 id·스팟 id 등"이라고만 적혀 있어, 타입별 조합을 확정할 수 없습니다. **아래 표만 채워주시면 바로 연결하겠습니다.**

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

### 10. 사진 업로드가 1장씩만 가능합니다 *(P3 → P2 격상)*

`SpotRecordPhotoUploadForm.images` 가 `type: string`(단일 바이너리)이라 5장 올릴 때 **요청을 5번** 보냅니다.

**스펙 자체가 모순입니다** — 필드명은 복수형이고 설명에도 `"업로드할 이미지 파일들 (jpeg/png/webp, 1~5장, 단일 파일 최대 10MB)"` 라고 적혀 있는데, 타입은 단일 `Blob` 입니다. 다중 업로드가 원래 의도였던 것으로 보입니다.

**격상 이유**: 8/8 프론트에서 **부분 실패 시 기록 생성을 전체 중단**하도록 바꿨습니다. 이전에는 실패한 사진만 조용히 빠진 채 기록이 만들어져 사용자가 손실을 몰랐기 때문입니다. 그 결과 **5장 업로드에 실패 지점이 5개**가 되어, 모바일 네트워크에서 기록 작성 실패율이 직접적으로 올라갑니다.

```jsonc
// 요청
{ "images": ["<binary>", "<binary>"] }   // 배열로 변경, 1~5장
```

### 11. `GET /api/spots/preview` 를 지도 핀 카드의 정식 경로로 쓸지 결정해 주세요 *(P3 → P2 격상)*

초판에서 "클러스터 화면(SCR-011d) 용도 맞나요?"라고만 물었는데, 스펙을 다시 읽어 보니 **설명에 이미 답이 있었고**(단일=SCR-011e / 복수=SCR-011d), 대신 프론트가 판단해야 할 게 남아 있었습니다. 8/8 지도 필터를 붙이면서 **지금 결정이 필요한 건**이 되어 격상합니다.

**이 API 의 설계 의도는 명확합니다** — `spotIds` 가 배열이고, 응답이 `name`/`thumbnailUrl`/`badge`/`distanceMeters` 로 카드 한 장 분량만 담고, 순서 보존까지 명시돼 있습니다. `GET /api/spots/{id}` 가 1건을 깊게 준다면 이쪽은 **N건을 싸게** 주는 읽기 모델입니다. 클러스터 12개를 상세로 열면 요청 12번에 안 쓰는 `recordPreview` 까지 딸려오니, 이 API 가 있는 이유에 동의합니다.

**문제는 현재 단일 핀 드로어가 preview 로는 못 그린다는 점입니다.** 드로어가 요구하는 것 중 3가지가 응답에 없습니다.

| 드로어가 쓰는 것 | preview | detail |
|---|---|---|
| 유저 사진 **여러 장**(최대 3장 캐러셀) | `thumbnailUrl` **1장** | `recordPreview[].coverPhoto` ✅ |
| 찜 하트 상태 | ❌ 없음 | `favorite.favorited` ✅ |
| 위치(주소) 줄 | ❌ 없음 | `address` ✅ |

그래서 프론트는 단일 핀에 `spotDetailApi` 를 쓰고 있고, 클러스터 탭은 리스트 없이 `map.setBounds()` 로 **줌인만** 합니다(SCR-011d 미구현).

**그런데 `category` 파라미터 때문에 지금 실제 불일치가 생겼습니다.**
8/8 지도 꽃 필터를 연결한 뒤로, **벚꽃으로 거른 지도에서 핀을 탭하면 드로어에 단풍 배지가 뜰 수 있습니다.** `detail.bloom` 은 그 스팟의 *대표* 개화라 필터 문맥을 모르기 때문입니다. `preview?category=CHERRY` 는 정확히 이걸 위한 파라미터로 보입니다("생략 시 각 스팟의 대표 단계").

**아래 중 하나를 골라 주세요**

| 안 | 내용 | 백엔드 작업 |
|---|---|---|
| **A (선호)** | preview 에 `favorited`, `address`, **사진 배열**(최대 3장)을 추가해 **단일·클러스터 모두 preview 로 통일**. 핀 탭 경로에서 `spots/{id}` 호출이 사라지고 배지도 필터와 일치 | 필드 3개 추가 |
| B | 단일은 detail 유지, 클러스터만 preview. 배지 불일치는 프론트가 `category` 로 detail 을 재조회하거나 감수 | 없음 (SCR-011d 기획만 확정) |
| C | 드로어 디자인을 preview 수준(사진 1장·하트 없음)으로 축소 | 없음 (디자인 변경) |

A 로 가면 지도 핀 탭이 **요청 1번**으로 끝나고 필터 배지도 정확해집니다. B/C 면 프론트에서 마감하겠습니다.

**추가 스펙 확인 2건**

- **`BloomBadge.status` 의 설명이 낡았습니다.** 설명에는 `(PREPARING/STARTED/PEAK)` 3개라고 적혀 있는데 실제 enum 과 실제 응답에는 `ENDED` 가 포함된 4개입니다. 프론트는 4개 기준(`개화 종료` 표기 포함)으로 처리하고 있으니 **설명 쪽을 고쳐 주세요.**
- 응답이 요청 순서를 보존한다고 되어 있는데, 클러스터 리스트는 보통 **거리순**으로 보여줍니다. `distanceMeters` 정렬은 프론트가 하면 되는지, 서버 정렬 옵션을 둘 계획인지 알려 주세요.

---

## P3 — 미연동 엔드포인트 정리 *(8건 중 4건 해소)*

### 해소된 것 — 확인만 부탁드립니다

| 엔드포인트 | 8/8 결과 |
|---|---|
| `GET /api/spots/records/me` | **연동 완료.** `/my/records`(내 기록 전체보기) 신설. `MyPageResponse.recordPreview` 주석의 "더보기는 스팟 기록 리스트 API로"를 근거로 삼았습니다 |
| `GET /api/curations` | 큐레이션 카드 → `/creators/{id}` 상세로 연동 완료. **다만 별도의 큐레이션 "목록 화면"은 여전히 없습니다** — 기획에 있나요? 없으면 이 엔드포인트는 미사용으로 남습니다 |
| `GET /api/seasonal/blooms/peak` | `GET /api/explore` 와 중복이라 **프론트 파사드를 삭제**했습니다. **폐기 예정이 맞나요?** 아니라면 되돌리겠습니다 |
| `GET /api/users/{userId}/follow-summary` | `UserProfileResponse.stats` 와 겹쳐 **프론트 파사드를 삭제**했습니다. 다른 용도가 있으면 알려주세요 |
| `GET /api/seasonal/blooms/calendar` | **연동 완료(피드 상세 `/feed/{id}`).** 파라미터는 `SpotDetailResponse.attractionId` + `bloom.category` 로 조립합니다. 다만 **`days[]` 를 타임라인 UI 로 그리지는 않고** ① 오늘 상태 뱃지 ② 다가오는 주말 절정 여부(`이번 주말이 딱이에요`) 판정에만 씁니다. 절정 구간·지속일은 `peakStartDate`/`peakEndDate`/`peakDurationDays` 를 그대로 표시합니다 |

### 여전히 미연동

| 엔드포인트 | 상태 |
|---|---|
| `GET /api/spots/preview` | **11번으로 옮겼습니다** — 클러스터 화면 대기 건이 아니라 지금 결정이 필요한 건이 됐습니다 |
| `POST /api/spots/records/{id}/publish` | **임시저장(DRAFT) 흐름이 기획에 있나요?** 현재 생성은 항상 `PUBLISHED` 이고, 프론트 파사드는 삭제했습니다. 계획이 없으면 엔드포인트도 정리하시는 편이 좋겠습니다 |
| `POST /api/devices` / `DELETE /api/devices/{token}` | **푸시 인프라(FCM 등) 도입 일정**이 잡히면 알려주세요. 그 전까지 보류 |

### 스펙 정리 (급하지 않음)

- **`FestivalDetailResponse` 의 `dDay` / `dday` 중복** — 의미가 같은 필드가 둘인데 `dDay` 는 `writeOnly: true`(규약상 응답 미포함)이고 `dday` 는 nullable·description 이 없습니다. 프론트는 `startsOn` 으로 직접 계산하도록 수정했으므로 급하지 않지만, 둘 중 하나로 정리하시는 편이 좋겠습니다.
- **`POST /api/spots/match` 의 부작용** — 지도 핀 클릭 시 `spotId` 없는 명소를 이 API 로 생성(materialize)하고 있습니다. **조회 동작에 POST 생성이 일어나는 구조**입니다.
  - 8/8 업데이트: 스팟 상세 → 기록 작성 경로(`/record?spotId=`)에서는 이 호출을 제거했습니다. **남은 호출부는 지도 핀 클릭 한 곳뿐**이고, 4번을 A안으로 해결하면 그것도 사라집니다.

---

## 부록: 대응 API 가 없는 로컬 전용 기능 (기획 확인)

- 설정 > **위치 정보 활용 / EXIF 자동 추출** 토글 — 서버 저장이 필요한가요, 클라이언트 설정으로 충분한가요? **현재 이 토글들은 켜진 것처럼 보이지만 아무 동작도 하지 않습니다.** 클라이언트 설정으로 충분하다면 프론트에서 localStorage 로 마무리하겠습니다.
- 검색 **최근 검색어** — 8/8 localStorage 로 구현했습니다. 기기 간 동기화 계획이 있으면 알려주세요.
