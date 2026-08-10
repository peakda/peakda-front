# Peakda 백엔드 API 요청 사항

> **작성일**: 2026-08-10 · **기준 스펙**: PEAKDA API v1 (`swagger.json`, Develop: `https://peakda-dev.up.railway.app`)
>
> 이 문서는 **백엔드 조치가 필요한 것만** 담습니다. 프론트 진행 상황이나 임시 처리 경위는 [API_CHANGE_REQUESTS.md](API_CHANGE_REQUESTS.md) 를 참고해 주세요.
>
> **필드 추가 요청은 모두 nullable 또는 기본값이 있어 기존 클라이언트를 깨지 않습니다.**

## 요약

| # | 우선순위 | 대상 | 요청 |
|---|---|---|---|
| 1 | **P0** | `SpotRecordResponse` 외 2개 스키마 | 내 상태 필드 3개 추가 |
| 2 | P1 | `SpotSearchItem` | 필드 3개 추가 |
| 3 | P1 | `ExploreFestivalItem` | 필드 2개 추가 |
| 4 | P1 | `ExploreSpotItem.spotId` | null 정책 결정 |
| 5 | P1 | `SpotPreviewItem` | 필드 3개 추가 |
| 6 | P2 | `GET /api/search/spots`, `GET /api/seasonal/blooms` | 파라미터 2개 추가 |
| 7 | P2 | `GET /api/seasonal/blooms`, `GET /api/spots/preview` | `category` 복수 허용 |
| 8 | P2 | `NotificationResponse` | 딥링크 규격 문서화 |
| 9 | P2 | `FestivalDetailResponse` | 문의처 필드 추가 |
| 10 | P2 | `SpotRecordPhotoUploadForm` | 다중 업로드 |
| 11 | P3 | `GET /api/seasonal/blooms` | `date` 지정 시 동네형 정책 확인 |
| 12 | P3 | 스펙 문서 | 설명·중복 필드 정리 |
| 13 | P3 | 엔드포인트 | 폐기·계획 확인 |

---

## P0

### 1. 조회 응답에 "내 상태" 필드가 없습니다

상태를 만드는 API(POST/DELETE)는 있는데 **조회 응답에 현재 상태가 없습니다.** 프론트가 `false`/빈 배열로 시작할 수밖에 없어, 이미 누른 버튼이 "안 누른" 상태로 렌더되고 누르면 취소가 아니라 **중복 생성 요청**이 나갑니다.

| 스키마 | 추가 필드 | 증상 |
|---|---|---|
| `SpotRecordSummaryResponse`, `SpotRecordResponse` | `reactions` | 리액션 개수가 항상 0, 새로고침하면 내 리액션이 사라짐 |
| `UserProfileResponse` | `blocked` | 차단한 유저인데 메뉴가 "차단하기"로 뜸 |
| `UserSearchItem` | `following` | 팔로우 중인 유저인데 버튼이 "팔로우"로 뜸 |

```jsonc
// SpotRecordSummaryResponse / SpotRecordResponse
// 기존 FeedReactionSummaryResponse 구조를 그대로 재사용해 주시면 됩니다
{
  "reactions": {                                            // required
    "counts": [{ "reactionType": "HEART", "count": 12 }],   // 0인 타입은 생략 가능
    "myReactions": ["HEART"]                                // 비로그인 시 빈 배열
  }
}

// UserProfileResponse
{ "blocked": false }    // required, 비로그인 시 false

// UserSearchItem
{ "following": false }  // required, 비로그인 시 false
```

> `UserProfileResponse.following` 은 이미 있습니다. **같은 필드를 `UserSearchItem` 에도** 주시면 됩니다.

**확인 부탁드릴 것**

- 목록(`GET /api/feed`)에서 N+1 이 부담이면 `counts` 만 내리고 `myReactions` 는 상세에만 넣어도 됩니다. 다만 그 경우 목록에서 토글 선택 상태를 표현할 수 없습니다.
- **상대가 나를 차단한 경우의 응답 정책**(404 / 빈 프로필 / 별도 플래그)을 알려주세요.

---

## P1

### 2. `SpotSearchItem` 에 표시용 필드 3개

**영향 화면**: `/search` — 검색 결과 카드가 다른 화면의 스팟 카드보다 정보량이 적습니다.

현재 필드: `spotId`, `type`, `name`, `address`, `latitude`, `longitude`

```jsonc
{
  "thumbnailUrl": "https://...",           // nullable
  "bloom": { /* 기존 bloom 구조 재사용 */ },  // nullable, 개화 정보 없으면 null
  "favorited": false                       // 비로그인 시 false
}
```

`SpotFavoriteResponse` / `ExploreSpotItem` 의 기존 구조를 그대로 재사용해 주시면 됩니다.

### 3. `ExploreFestivalItem` 에 이미지·진행상태

**영향 화면**: `/explore`, `/explore/festivals` — 목록 DTO 에 이미지가 없어 축제 카드가 **전부 동일한 플레이스홀더**입니다. `FestivalDetailResponse` 에는 `phase` 와 `editorial.heroImageUrl` 이 있는데 목록에서는 쓸 수 없습니다.

```jsonc
{
  "thumbnailUrl": "https://...",  // nullable. 에디토리얼 heroImageUrl 또는 대표 이미지
  "phase": "ONGOING"              // FestivalDetailResponse.phase 와 동일 enum
}
```

- 날짜(`startsOn`/`endsOn`/`endsInDays`)만으로는 **취소·연기를 표현할 수 없어** `phase` 가 필요합니다.
- `GET /api/explore/festivals` 가 진행 중 축제만 반환한다면, 최소한 **`ONGOING` / `ENDING_SOON` 구분**은 있어야 "곧 종료" 안내가 가능합니다.

### 4. `ExploreSpotItem.spotId` 가 null 일 때의 정책을 정해 주세요

`spotId` 가 null 이면 클라이언트에 `attractionId` 밖에 없는데, 상세(`GET /api/spots/{id}`)와 프리뷰(`GET /api/spots/preview`) 모두 **spotId 로만** 조회합니다.

**그 결과**

- 상세로 진입할 수 없습니다.
- `favorited` / `notifyEnabled` 가 항상 false 라 찜을 눌러도 저장할 대상이 없습니다.
- **지도 필터 결과 목록에서 통째로 누락됩니다.** 지도에 핀으로는 보이는데 목록에는 안 나와, "3개의 명소 보기"를 눌렀는데 2개만 나오는 상황이 가능합니다.

| 안 | 내용 |
|---|---|
| **A (선호)** | 탐색·지도 응답에 노출되는 명소는 Spot 행을 **미리 생성**해 `spotId` 를 항상 채움 |
| B | `GET /api/spots/by-attraction/{attractionId}` 추가 — 상세 진입만 해결, 찜·목록 누락은 그대로 |
| C | 현행 유지 — 클라이언트가 해당 카드를 비활성 처리하고 목록 누락을 감수 |

**A안이면 `POST /api/spots/match` 호출도 함께 사라집니다** (13번 참고).

### 5. `SpotPreviewItem` 에 `address` · `favorited` · 사진 배열

지도 필터 결과 목록을 이 API 로 한 번에 조회하고 있는데, **목록 카드가 요구하는 3가지가 응답에 없습니다.**

| 카드가 쓰는 것 | 현재 응답 | 결과 |
|---|---|---|
| 유저 사진 최대 3장 (3칸 그리드) | `thumbnailUrl` 1장 | 한 칸만 차고 두 칸은 빈칸 |
| 찜 하트 상태 | 없음 | 항상 꺼진 하트 |
| 위치(주소) 줄 | 없음 | 주소 자리에 거리(`1.2km`)를 대신 표시 |

```jsonc
// SpotPreviewItem 추가
{
  "address": "경남 창원시 진해구 ...",   // nullable
  "favorited": false,                    // 비로그인 시 false
  "photoUrls": ["https://...", "..."]    // 최대 3장. thumbnailUrl 은 하위호환으로 두셔도 됩니다
}
```

세 필드 모두 `GET /api/spots/{id}` 에 이미 있는 값입니다 (`address`, `favorite.favorited`, `recordPreview[].coverPhoto`). **이 필드들이 오면 단일 핀 드로어까지 preview 로 통일**할 수 있어, 지도 핀 탭이 요청 1번으로 끝나고 `GET /api/spots/{id}` 호출이 사라집니다.

---

## P2

### 6. 필터 파라미터 2개

```
GET /api/search/spots     + category?: (꽃 카테고리 enum)
GET /api/seasonal/blooms  + region?:   (권역 코드)
```

**`region`**: 필터 드로어에 지역 탭이 있는데 서버 파라미터가 없어 **선택해도 결과에 반영되지 않습니다.** "제주를 골랐는데 보고 있던 서울 명소가 그대로 나오는" 상태입니다.

권역 6개(수도권 / 강원 / 충청 / 경상 / 전라 / 제주)는 프론트가 임의로 정한 값입니다. **서버 기준 권역 코드가 있으면 그쪽에 맞추겠습니다.** 없다면 이 6개를 쓸지, 다른 구분을 쓸지 알려주세요.

### 7. `category` 를 복수로 받을 수 있게

꽃 종류는 **복수 선택**입니다(벚꽃 + 유채를 같이 보기). 그런데 두 엔드포인트의 `category` 가 **단일 enum** 이라 표현할 수 없습니다.

```
GET /api/seasonal/blooms  category → categories?: enum[]   (반복 파라미터 또는 콤마 구분)
GET /api/spots/preview    category → categories?: enum[]
```

기존 `category` 는 두고 `categories` 를 추가하셔도 됩니다.

**`preview` 쪽이 더 급합니다.** `category` 를 생략하면 각 스팟의 *대표* 단계로 배지가 내려오므로, **벚꽃+유채로 거른 목록에 단풍 배지가 뜹니다.** `blooms` 쪽은 과다 조회 문제라 상대적으로 덜 급합니다.

### 8. 알림 딥링크 규격을 문서화해 주세요

**영향 화면**: `/notification` — 알림을 눌러도 **아무 데도 가지 않습니다.**

`NotificationResponse` 에 `linkType`(INTERNAL/EXTERNAL) · `linkUrl` · `targetId` 가 있지만, `targetId` 설명이 "팔로워 id·기록 id·스팟 id 등"이라 타입별 조합을 확정할 수 없습니다. **아래 표만 채워주시면 바로 연결하겠습니다.**

| `type` | `linkType` | `targetId` 의미 | 이동할 화면 |
|---|---|---|---|
| `TIMING` | ? | spotId? attractionId? | `/spot/{id}` ? |
| `FOLLOW` | ? | userId | `/users/{id}` ? |
| `REACTION` | ? | recordId | `/feed/{id}` ? |
| `NOTICE` | ? | noticeId? | ? |

- `INTERNAL` 일 때 `linkUrl` 이 **프론트 경로 문자열**인지, `targetId` 로 클라이언트가 조합해야 하는지 알려주세요.
- `segment` 에 `TIMING` 값이 있는데 화면 탭은 전체/활동/공지 3개뿐입니다. **TIMING 탭이 기획에 있나요?**

### 9. 축제 문의처 필드

`FestivalDetailResponse` / `FestivalEditorialResponse` 에 전화번호·문의처가 없어 `homepageUrl` 링크로 대체 중입니다. 원천 데이터(TourAPI 등)에 있다면 추가를 요청드립니다.

```jsonc
{ "inquiryPhone": "055-225-3000" }   // nullable
```

### 10. 사진 다중 업로드

`SpotRecordPhotoUploadForm.images` 가 `type: Blob`(단일)이라 5장 올릴 때 **요청을 5번** 보냅니다. 모바일 네트워크에서 **실패 지점이 5개**가 되어 기록 작성 실패율에 직접 영향을 줍니다.

**스펙 자체가 모순입니다** — 필드명은 복수형이고 설명에도 `"업로드할 이미지 파일들 (jpeg/png/webp, 1~5장, 단일 파일 최대 10MB)"` 라고 적혀 있는데 타입은 단일입니다.

```jsonc
{ "images": ["<binary>", "<binary>"] }   // 배열로 변경, 1~5장
```

---

## P3

### 11. `date` 를 지정하면 동네형 핀은 어떻게 다뤄야 하나요

`GET /api/seasonal/blooms` 의 `date` 설명입니다.

> 방문예정일 (생략 시 오늘 기준). 명소형 핀 상태를 해당일 기준으로 재계산한다. **동네형은 최근 관측값 유지.**

미래 날짜를 보내면 **명소형은 그날 기준, 동네형은 오늘 기준**이라 두 기준이 한 지도에 섞입니다. "2주 뒤 절정인 곳"을 보는데 동네 핀은 지금 절정인 곳이 나옵니다.

- **서버가 `date` 지정 시 동네형을 아예 빼는 게** 맞나요, 클라이언트가 거르는 게 맞나요?
- 동네형도 예측 재계산이 가능해질 계획이 있나요?

급하지 않습니다. **의도만 확인되면 됩니다.**

### 12. 스펙 문서 정리

- **`BloomBadge.status` 의 설명이 낡았습니다.** 설명에는 `(PREPARING/STARTED/PEAK)` 3개라고 적혀 있는데 실제 enum 과 실제 응답에는 `ENDED` 가 포함된 4개입니다. 클라이언트는 4개 기준으로 처리하고 있으니 **설명 쪽을 고쳐 주세요.**
- **`FestivalDetailResponse` 의 `dDay` / `dday` 중복.** 의미가 같은 필드가 둘인데 `dDay` 는 `writeOnly: true`(규약상 응답 미포함)이고 `dday` 는 nullable·description 이 없습니다. 둘 중 하나로 정리 부탁드립니다.
- **`GET /api/spots/preview` 정렬.** 응답이 요청 순서를 보존한다고 되어 있는데, 목록은 **거리순**이 자연스럽습니다. `distanceMeters` 정렬은 클라이언트가 해도 되는지, 서버 정렬 옵션을 둘 계획인지 알려주세요.
- **꽃 카테고리 enum 확인.** 현재 13개(`PLUM, FORSYTHIA, AZALEA_KR, CHERRY, CANOLA, AZALEA, HYDRANGEA, LOTUS, COSMOS, PINK_MUHLY, SILVERGRASS, MAPLE, CAMELLIA`)입니다.
  - **해바라기 / 국화 지원 계획이 있나요?** 있으면 `SUNFLOWER`, `CHRYSANTHEMUM` 추가 시점만 알려주세요.
  - 클라이언트는 `AZALEA` = 진달래, `AZALEA_KR` = 철쭉으로 매핑했습니다(서버 `displayName` 기준). enum 이름만 보면 반대로 읽히는데 **이대로 맞나요?**

### 13. 엔드포인트 폐기·계획 확인

| 엔드포인트 | 확인할 것 |
|---|---|
| `GET /api/seasonal/blooms/peak` | `GET /api/explore` 와 중복으로 보입니다. **폐기 예정이 맞나요?** |
| `GET /api/users/{userId}/follow-summary` | `UserProfileResponse.stats` 와 겹칩니다. **다른 용도가 있나요?** |
| `POST /api/spots/records/{id}/publish` | **임시저장(DRAFT) 흐름이 기획에 있나요?** 없으면 엔드포인트도 정리하시는 편이 좋겠습니다 |
| `GET /api/curations` | **큐레이션 목록 화면이 기획에 있나요?** 없으면 이 엔드포인트는 쓰이지 않습니다 |
| `POST /api/devices`, `DELETE /api/devices/{token}` | **푸시 인프라(FCM 등) 도입 일정**이 잡히면 알려주세요 |
| `POST /api/spots/match` | 지도 핀 클릭 시 `spotId` 없는 명소를 이 API 로 생성하고 있습니다. **조회 동작에 POST 생성이 일어나는 구조**인데 의도하신 게 맞나요? 4번을 A안으로 해결하면 호출부가 사라집니다 |
