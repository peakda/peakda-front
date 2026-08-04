# Peakda API 변경 요청서

> **작성일**: 2026-08-04 · **기준 스펙**: PEAKDA API v1 (`swagger.json`, Develop: `https://peakda-dev.up.railway.app`)
> **범위**: 프론트 전체(비관리자 오퍼레이션 62개 / 페이지 29개) 점검 결과 중 **백엔드 조치가 필요한 항목만**.
> API가 이미 충분한데 프론트가 안 쓰고 있는 건은 프론트에서 자체 수정하므로 제외했습니다.

## 요약

| # | 우선순위 | 항목 | 유형 |
|---|---|---|---|
| 1 | **P0** | 조회 응답에 "내 상태"(리액션·차단·팔로우)가 없음 | 필드 추가 |
| 2 | **P0** | `FestivalDetailResponse.dDay` 가 `writeOnly` + `dday` 와 중복 | 스펙 버그 |
| 3 | P1 | `SpotSearchItem` 표시 정보 부족 | 필드 추가 |
| 4 | P1 | `ExploreFestivalItem` 에 이미지·진행상태 없음 | 필드 추가 |
| 5 | P1 | `ExploreSpotItem.spotId` null 시 상세 진입 불가 | 정책 확인 |
| 6 | P2 | 필터 조건(지역·개화상태·스팟타입) 파라미터 부재 | 파라미터 추가 |
| 7 | P2 | 꽃 카테고리 enum 확정 필요 | 정책 확인 |
| 8 | P2 | 알림 딥링크 규격 미문서화 | 문서화 |
| 9 | P2 | 축제 문의처 필드 없음 | 필드 추가 |
| 10 | P3 | 미연동 엔드포인트 사용 계획 확인 | 질의 |

---

## P0

### 1. 조회 응답에 "내 상태"가 없어 토글이 중복 요청으로 나감

세 곳에서 **동일한 문제**가 반복됩니다. 상태를 만드는 API(POST/DELETE)는 있는데 **조회 응답에 현재 상태가 없어서**, 프론트가 `false`/빈 배열로 시작합니다. 결과적으로 이미 누른 버튼이 "안 누른" 상태로 렌더링되고, 누르면 취소가 아니라 **중복 생성 요청**이 나갑니다.

| 스키마 | 빠진 필드 | 영향 화면 | 증상 |
|---|---|---|---|
| `SpotRecordSummaryResponse`, `SpotRecordResponse` | `reactions` | `/feed`, `/feed/[id]`, `/spot/[id]`, `/record/[id]` | 개수가 항상 0, 새로고침하면 내 리액션이 사라짐 |
| `UserProfileResponse` | `blocked` | `/users/[id]` | 차단한 유저인데 메뉴가 "차단하기"로 뜸 |
| `UserSearchItem` | `following` | `/search` | 팔로우 중인 유저인데 버튼이 "팔로우"로 뜸 |

리액션 집계 스키마(`FeedReactionSummaryResponse`)는 mutation 응답에만 붙어 있어, 프론트는 **사용자가 한 번 누르기 전까지 아무 값도 알 수 없습니다.** `UserProfileResponse` 는 `following` 은 주는데 `blocked` 만 빠져 있어 대칭 정보 중 한쪽만 없는 상태입니다.

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

- 목록(`GET /api/feed`)에서 N+1이 부담이면 `counts` 만 내리고 `myReactions` 는 상세에만 넣어도 됩니다. 다만 그 경우 **목록에서는 토글 선택 상태를 표현할 수 없습니다.**
- 참고: 상대가 나를 차단한 경우의 응답 정책(404 / 빈 프로필 / 별도 플래그)도 알려주시면 화면에 반영하겠습니다.

### 2. `FestivalDetailResponse.dDay` 가 `writeOnly` 이고 `dday` 와 중복

**영향 화면**: `/festivals/[id]`

의미가 겹치는 필드가 두 개 있고 둘 다 문제가 있습니다.

```jsonc
"dDay": { "type": ["integer","null"], "writeOnly": true },  // ← 규약상 응답에 미포함
"dday": { "type": "integer" }                                // ← nullable·description 없음
```

프론트는 카멜케이스 관례대로 `dDay` 를 읽고 있어, 응답에 이 필드가 없으면 **D-Day 배지("D-3" / "D-DAY")가 표시되지 않습니다.**

**요청**

1. 둘 중 하나로 통일해 주세요 (`dDay` 에서 `writeOnly` 제거 + `dday` 삭제 권장).
2. 남기는 필드에 **nullable 여부와 종료된 축제일 때의 값**을 명시해 주세요. 지금은 0인지 음수인지 필드 누락인지 알 수 없습니다.

```jsonc
{ "dDay": { "type": ["integer","null"], "description": "개막까지 남은 일수. 당일 0, 이미 시작했거나 종료면 null" } }
```

> 실제 서버가 직렬화하는 필드명만 알려주시면 프론트는 즉시 맞추겠습니다.

---

## P1

### 3. `SpotSearchItem` 표시 정보 부족

**영향 화면**: `/search` — 검색 결과 카드가 다른 화면의 스팟 카드 대비 정보량이 적어 빈 껍데기처럼 보입니다.
현재 필드: `spotId`, `type`, `name`, `address`, `latitude`, `longitude`.

**요청** — `SpotFavoriteResponse` / `ExploreSpotItem` 의 기존 구조를 재사용해 주세요.

```jsonc
{
  "thumbnailUrl": "https://...",           // nullable
  "bloom": { /* 기존 bloom 구조 재사용 */ },  // nullable, 개화 정보 없으면 null
  "favorited": false                       // 비로그인 시 false
}
```

`UserSearchItem` 은 1번에 포함했습니다. `followerCount` 도 있으면 좋지만 필수는 아닙니다.

### 4. `ExploreFestivalItem` 에 이미지·진행상태가 없음

**영향 화면**: `/explore`, `/explore/festivals`

목록용 DTO에 이미지와 상태가 없어, 축제 카드가 **전부 동일한 플레이스홀더 이미지**에 배지는 **`"진행중"` 하드코딩**입니다. `FestivalDetailResponse` 에는 `phase` 와 `editorial.heroImageUrl` 이 있는데 목록에서는 못 씁니다.

```jsonc
// ExploreFestivalItem 추가
{
  "thumbnailUrl": "https://...",  // nullable. 에디토리얼 heroImageUrl 또는 대표 이미지
  "phase": "ONGOING"              // FestivalDetailResponse.phase 와 동일 enum
}
```

`GET /api/explore/festivals` 가 진행 중 축제만 반환한다면 **최소한 `ONGOING` / `ENDING_SOON` 은 구분**되어야 "곧 종료" 안내가 가능합니다.

### 5. `ExploreSpotItem.spotId` 가 null 일 때 상세 진입 경로가 없음

**영향 화면**: `/explore`, `/explore/spots`

`spotId` 가 null이면 프론트에 `attractionId` 밖에 없는데, 상세는 `GET /api/spots/{id}` 로 **spotId만** 받습니다. 같은 이유로 `favorited`/`notifyEnabled` 도 항상 false라 **찜 버튼을 눌러도 저장할 대상이 없습니다.**

**아래 중 하나를 선택해 주세요**

| 안 | 내용 | 프론트 영향 |
|---|---|---|
| **A (선호)** | 탐색 응답에 노출되는 명소는 Spot 행을 **미리 생성**해 `spotId` 를 항상 채움 | 분기 제거, 가장 단순 |
| B | `GET /api/spots/by-attraction/{attractionId}` 추가 | 상세 진입만 해결, 찜은 불가 |
| C | 현행 유지 | `spotId == null` 카드를 **비활성 처리**(클릭·찜 불가), UX 저하 |

C로 확정되면 프론트에서 비활성 처리로 마감하겠습니다. 어느 쪽인지만 알려주세요.

---

## P2

### 6. 필터 조건에 대응하는 파라미터가 없음

**영향 화면**: `/map`(필터 드로어), `/explore`, `/search`

필터 드로어에 **지역 / 시기 / 꽃 종류** 3개 탭이 구현되어 있지만, 꽃 종류를 뺀 나머지는 **전달할 파라미터가 없어 선택해도 결과가 바뀌지 않습니다.** (꽃 종류는 `category` 가 이미 있고 프론트 미연결 — 자체 수정 예정)

```
GET /api/seasonal/blooms  + status?: PREPARING|STARTED|PEAK|ENDED (복수 선택 시 반복 파라미터)
                          + type?:   ATTRACTION|LOCAL          ← 지도 상단 칩
GET /api/explore          + region?: CAPITAL|GANGWON|CHUNGCHEONG|GYEONGSANG|JEOLLA|JEJU
                          + status?: PREPARING|STARTED|PEAK|ENDED
GET /api/search/spots     + category?: (꽃 카테고리 enum)
```

- 지역 6개 권역은 프론트가 임의로 쓰는 값입니다. **서버 기준 코드가 있으면 그쪽에 맞추겠습니다.**
- 이 필터를 살릴 계획이 없으면 **UI를 걷어내겠으니 알려만 주세요.**

### 7. 꽃 카테고리 enum 확정 필요

프론트에 꽃 목록이 두 벌 있고 서로 다릅니다. `profile/edit`(관심 꽃 설정)은 API enum 13개와 정확히 일치하지만, **필터 드로어는 해바라기·국화가 추가되고 핑크뮬리가 빠져** 있습니다.

- **해바라기 / 국화** 지원 계획이 있나요? 있으면 `SUNFLOWER`, `CHRYSANTHEMUM` 추가를 요청드립니다.
- 없으면 프론트에서 제거하고 `PINK_MUHLY` 를 넣어 13개로 통일하겠습니다.

현재 enum(13): `PLUM, FORSYTHIA, AZALEA_KR, CHERRY, CANOLA, AZALEA, HYDRANGEA, LOTUS, COSMOS, PINK_MUHLY, SILVERGRASS, MAPLE, CAMELLIA`

### 8. 알림 딥링크 규격 문서화 요청

**영향 화면**: `/notification` — 현재 알림을 눌러도 **읽음 처리만 되고 아무 데도 가지 않습니다.**

`NotificationResponse` 에 `linkType`(INTERNAL/EXTERNAL) · `linkUrl` · `targetId` 가 있지만 알림 타입별 조합 정의가 없습니다. **아래 표만 채워주시면 바로 연결하겠습니다.**

| `type` | `linkType` | `targetId` 의미 | 이동할 화면 |
|---|---|---|---|
| `TIMING` | ? | spotId? attractionId? | `/spot/{id}` ? |
| `FOLLOW` | ? | userId | `/users/{id}` ? |
| `REACTION` | ? | recordId | `/feed/{id}` ? |
| `NOTICE` | ? | noticeId? | ? |

- `INTERNAL` 일 때 `linkUrl` 이 **프론트 경로 문자열**인지, `targetId` 로 프론트가 조합해야 하는지도 알려주세요.
- `segment` 에 `TIMING` 값이 있는데 화면 탭은 전체/활동/공지 3개뿐입니다. **TIMING 탭이 기획에 있나요?**

### 9. 축제 문의처 필드 없음

`FestivalDetailResponse` / `FestivalEditorialResponse` 에 전화번호·문의처가 없어 현재 `homepageUrl` 링크로 대체 중입니다. 원천 데이터(TourAPI 등)에 있다면 `{ "inquiryPhone": "055-225-3000" }`(nullable) 추가를 요청드립니다.

---

## P3 — 미연동 엔드포인트 사용 계획 확인

구현되어 있으나 프론트에서 호출하지 않는 API입니다. 계획을 알려주시면 연동하거나 정리하겠습니다.

| 엔드포인트 | 질문 |
|---|---|
| `GET /api/curations` | 큐레이션 **목록 화면**이 기획에 있나요? 현재는 `/api/explore` 섹션으로만 노출 |
| `GET /api/seasonal/blooms/peak` | `/api/explore` 와 중복입니다. **폐기 예정**인가요? |
| `GET /api/seasonal/blooms/calendar` | 스팟 상세의 **일별 개화 타임라인** 용도 맞나요? 화면 확정 시 연동 예정 |
| `GET /api/spots/records/me` | 마이페이지 "내 기록 **전체보기**" 용으로 쓰면 될까요? (현재는 `myPage.recordPreview` 만) |
| `POST /api/spots/records/{id}/publish` | **임시저장(DRAFT) 흐름**이 기획에 있나요? 현재 생성은 항상 `PUBLISHED` |
| `GET /api/users/{userId}/follow-summary` | `UserProfileResponse.stats` 와 겹칩니다. 어떤 케이스용인가요? |
| `GET /api/spots/preview` | 지도 **클러스터 다중 핀 리스트**(SCR-011d) 용도 맞나요? |
| `POST /api/devices` / `DELETE /api/devices/{token}` | **푸시 인프라(FCM 등) 도입 일정**이 잡히면 알려주세요. 그 전까지 보류 |

**추가 확인 2건**

- **`POST /api/spots/match` 의 부작용** — 지도 핀 클릭 시 `spotId` 없는 명소를 이 API로 생성(materialize)하고 있습니다. **조회 동작에 POST 생성이 일어나는 구조**라, 5번을 A안으로 해결하면 이 호출은 사라집니다. 함께 검토 부탁드립니다.
- **사진 업로드가 1장씩만 가능** — `SpotRecordPhotoUploadForm.images` 가 `type: string`(단일 바이너리)이라 5장 올릴 때 **요청을 5번** 보냅니다. 필드명이 복수형인데 다중 업로드 의도였는지 확인 부탁드리며, 가능하면 배열로 변경 요청드립니다.

---

## 부록: 대응 API가 없는 로컬 전용 기능 (기획 확인)

- 설정 > **위치 정보 활용 / EXIF 자동 추출** 토글 — 서버 저장이 필요한가요, 클라이언트 설정으로 충분한가요?
- 검색 **최근 검색어** — 서버 동기화 계획이 있나요? (현재 하드코딩)
