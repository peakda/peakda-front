# 연동 안 된 API / 라우팅 안 된 페이지 정리

> 조사 기준: 2026-07-26 (`feat/11` 브랜치)

## 아키텍처 요약

- `src/app/api`에는 uploadthing 라우트 1개만 존재 (`route.ts` + `core.ts`) — 백엔드 API 프록시가 아니라 이미지 업로드 전용.
- 실제 백엔드 API는 `src/api/facades/*.ts` (수동 파사드) → `src/api/facades/generated/**` (orval 생성) 구조로 호출됨. 컴포넌트/페이지는 파사드의 `useXxx` 훅 또는 `xxxApi` 비동기 함수를 사용.

---

## 1. 연동 안 된 API

| 파일/함수 | 이유 |
|---|---|
| `src/app/api/uploadthing/route.ts`, `core.ts` | 이를 호출하는 `src/lib/uploadthing.ts`의 `useUploadThing` 헬퍼가 앱 어디서도 미사용. 실제 프로필 이미지 업로드는 `uploadProfileImageApi`/`uploadSignupProfileImageApi`(백엔드 API)로 처리되고 있어 죽은 코드로 보임 |
| `src/api/facades/seasonal-bloom.ts` — `bloomCalendarApi`, `useBloomCalendar` | "개화 캘린더" 엔드포인트. 함수·훅 모두 어디서도 호출되지 않음 (`useBloomMap`, `useBloomPeak`만 사용됨) |
| `src/api/facades/spot-record.ts` — `listMySpotRecordsApi`, `useMySpotRecords` | "내 스팟 기록 목록" 엔드포인트. 함수·훅 모두 미사용 |
| `src/api/facades/spot-record.ts` — `publishSpotRecordApi`, `usePublishSpotRecord` | "기록 게시(publish)" 엔드포인트. 미사용 (기록 작성 플로우는 create/update만 사용) |
| `src/api/facades/user-follow.ts` — `followSummaryApi`, `useFollowSummary` | "팔로우 요약" 엔드포인트. 미사용 |
| `src/api/facades/device.ts` — `registerDeviceApi`, `unregisterDeviceApi` | 디바이스(푸시) 등록/해제 API. 미사용 |
| `src/api/facades/auth.ts` — `refreshApi` | 직접 호출 지점 없음 (단, axios interceptor 내부에서 처리될 가능성 있음 — 아래 애매한 경우 참고) |

---

## 2. 라우팅 안 된 페이지 (Orphan Pages)

| 파일 경로 | 라우트 | 이유 |
|---|---|---|
| `src/app/creators/[id]/page.tsx` | `/creators/[id]` | `/creators` 링크가 코드베이스 어디에도 없음. `MOCK_CREATOR_DETAIL` 목데이터만 사용, API 연동도 없음 |
| `src/app/festivals/[id]/page.tsx` | `/festivals/[id]` | `/festivals` 링크 없음. `explore` 페이지의 축제 카드(`ExplorCard`)에 `onClick`/`Link`가 구현되어 있지 않아 클릭해도 이동하지 않음. `MOCK_FESTIVAL_DETAIL` 목데이터만 사용 |

두 페이지 모두 화면 구현 자체는 완성돼 있고, 진입 동선(카드 클릭 → 라우팅)만 빠진 상태.

### 정상 라우팅된 페이지 (참고)

`/map`, `/explore`, `/record`(+`[id]`, `[id]/edit`), `/feed`(+`[id]`), `/my`(+`/saved`, `/settings`), `/notification`, `/search`, `/spot/[id]`(+`/feed`), `/users/[id]`, `/followers`, `/following`, `/profile`(+`/edit`), `/Terms`(+`/[slug]`), `/login`, `/onboarding` — 모두 `Nav.tsx`, 각 상세/목록 페이지, `SplashScreen`, `OnboardingCarousel` 등에서 `router.push`/`Link`로 연결됨.

---

## 3. 딥다이브 — `/spot/[id]` (스팟 상세) 축제/일반 연동 여부

### 결론: `/spot/[id]` 자체는 정상, "축제"는 데이터 모델에 없는 개념이라 별도로 겉돎

- 백엔드 스키마(`SpotDetailResponseType`)에는 `ATTRACTION`(명소) / `LOCAL`(사용자 등록 로컬 스팟) 두 타입만 존재하고 **"축제(festival)" 타입 자체가 없음**. `SpotSearchItemType`, `SpotPreviewItemType`도 동일.
- `src/app/spot/[id]/page.tsx`, `src/app/spot/[id]/feed/page.tsx` 모두 `spot.type` 분기 없이 `useSpotDetail`/`useSpotRecordsBySpot` 공통 로직으로 처리하며 ATTRACTION/LOCAL 둘 다 정상 동작.

### 진입 동선

| 진입 경로 | 동작 |
|---|---|
| 지도 핀 클릭 → `Drawer.tsx` "명소 보기" | `router.push(`/spot/${id}`)` — 정상 |
| 검색 → `SpotCard.tsx` | `Link href={`/spot/${id}`}` — 정상 |
| explore "요즘 뜨는 축제" (`ExplorCard type='festival'`, `FESTIVAL_CARDS`) | 완전 하드코딩 목데이터 + `ExplorCard`에 `onClick`/`Link` 자체가 없어 클릭해도 이동 안 함 |
| explore "지금이 절정이에요"(`type='peak'`) / "이번 주말 어디로"(`type='course'`) | 마찬가지로 `ExplorCard`에 이벤트 핸들러 없어 클릭 불가 |

### `/festivals/[id]` vs `/spot/[id]` 관계 판단

중복/미완성 기능이며 서로 통합되지 않은 상태. `/festivals/[id]`가 다루려던 "축제"는 현재 백엔드 데이터 모델에 없고, `dateRange`/`status` 같은 독자 필드는 `SpotDetailResponse`에도 없어 지금 스키마로는 `/spot/[id]`에 자연스럽게 흡수되지도 않음. 라우트 이름(`festivals`)과 explore 축제 카드의 도메인이 일치하는 것으로 보아 원래는 카드 클릭 → `/festivals/[id]` 연결을 의도했던 것으로 보이나, `ExplorCard`에 클릭 핸들러가 빠지면서 구현이 중단된 상태로 남음.

---

## 4. 애매한 경우

- **`/auth/callback`**: 내부 `Link`/`router.push`로 연결되는 곳은 없지만, 카카오 OAuth 로그인 후 백엔드/카카오가 브라우저를 리다이렉트시키는 외부 진입점이므로 orphan 아님.
- **`src/api/facades/spot.ts` — `useSpotPreview`**: 훅 자체는 미사용이지만, 같은 파일의 `spotPreviewApi`(원시 비동기 함수)는 `MapContainer.tsx`에서 직접 호출됨. 엔드포인트는 연동되어 있고 훅 래퍼만 중복.
- **`src/api/facades/auth.ts` — `refreshApi`**: axios 401 인터셉터(`src/api/mutator/index.ts`) 내부에서 자동 토큰 갱신 로직으로 쓰일 가능성이 있어 정적 grep만으로는 완전한 미사용이라 단정하기 어려움 (인터셉터 코드 직접 확인 필요).
- **`bloomMapApi`, `bloomPeakApi`, `matchSpotApi` 등**: 프론트에서 직접 호출되는 곳은 없지만 같은 파일의 `useBloomMap`/`useBloomPeak`/`useMatchSpot` 훅으로 래핑되어 실제 사용 중. "미사용"이 아니라 imperative 호출용으로 병행 제공되는 설계로 판단해 미사용 목록에서 제외.

---

## 다음 액션 후보

1. `creators`/`festivals` 진입 동선(카드 클릭 → 라우팅) 연결 여부 결정
2. uploadthing 및 미사용 파사드 함수(`bloomCalendarApi`, `listMySpotRecordsApi`, `publishSpotRecordApi`, `followSummaryApi`, `registerDeviceApi`/`unregisterDeviceApi`) 삭제 여부 결정
3. `refreshApi` 및 axios 인터셉터의 실제 토큰 갱신 흐름 확인
4. `ExplorCard`에 클릭 핸들러 추가 여부 및 방향 결정 — (a) `/festivals/[id]`를 살려서 연결할지, (b) 백엔드에 축제 타입이 없으므로 `/spot/[id]`로 통합하고 `/festivals/[id]`·`FESTIVAL_CARDS` 목데이터는 정리할지
