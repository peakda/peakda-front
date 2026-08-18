# 연동 안 된 API / 라우팅 안 된 페이지

> 최종 갱신: 2026-08-18 (`refactor/18`) · 이전 판: 2026-08-08 (`feat/15`, Phase 0 직후)
> 8/8 판에서 "연동 예정"으로 적혀 있던 항목 대부분이 그 사이 실제로 연결되어 무효가 됐다. 확인 후 갱신했다.

## 아키텍처 요약

- `src/app/api` Route Handler는 **없다.** 유일하게 있던 uploadthing 라우트는 호출부가 없어 2026-08-08 제거했다.
- 백엔드 API는 `src/api/facades/*.ts`(수동 파사드) → `src/api/facades/generated/**`(orval) → `src/api/mutator` 순으로 호출된다.

---

## 1. 라우팅 안 된 페이지

**없다.** 모든 페이지에 진입 동선이 있다.

| 라우트 | 진입 경로 |
|---|---|
| `/festivals/[id]` | `/explore` 축제 카드, `/explore/festivals` 목록 |
| `/creators/[id]` | `/explore` 큐레이션 카드 |
| `/my/records` | `/my` "내 기록 전체보기" |
| `/spot/[id]` · `/users/[id]` · `/feed/[id]` | 기존 동선 + **2026-08-18부터 알림 딥링크** (`toNotificationHref`) |

`/auth/callback`은 OAuth 리다이렉트 외부 진입점이라 내부 링크가 없는 게 정상이다.

---

## 2. 연동 안 된 API (파사드는 있고 호출부가 없음)

| 파사드 | 상태 |
|---|---|
| `spot.ts` — `useSpotPreview` (훅) | **plain async 버전만 쓰인다.** 프리뷰는 핀 클릭·필터 결과처럼 렌더 밖 이벤트에서 부르므로 `spotPreviewApi` 를 쓰고 훅은 남은 껍데기다. 정리 대상 |
| `device.ts` — `registerDeviceApi`, `unregisterDeviceApi` | 푸시 인프라(FCM 등) 도입 전까지 보류. 백엔드도 일정 미정 |
| `auth.ts` — `refreshApi` | 실질 미사용. 토큰 갱신은 `src/api/mutator/index.ts`가 orval 부트스트랩 순환을 피하려고 **raw fetch로 직접** 호출한다. 파사드 쪽은 남은 껍데기 |

### 2026-08-18에 해소된 것

| 파사드 | 연결된 곳 |
|---|---|
| `seasonal-bloom.ts` — `useBloomCalendar` | `src/app/feed/[id]/_components/SpotBloomSummary.tsx` (오늘 상태 뱃지 + 주말 절정 판정. `days[]`를 타임라인 UI로 그리지는 않는다) |
| `spot-record.ts` — `useMySpotRecordsInfinite` | `src/app/my/records/page.tsx` |
| `spot.ts` — `spotPreviewApi` | `Drawer.tsx`(필터 결과 목록), `MapContainer.tsx`(단일 핀 클릭). 2026-08-18에 단일 핀도 상세 대신 프리뷰로 통일 |

### 2026-08-08에 삭제한 것

- `src/lib/uploadthing.ts`, `src/app/api/uploadthing/` — 프로필 이미지 업로드는 백엔드 API(`uploadProfileImageApi`)가 처리
- `seasonal-bloom.ts` — `bloomPeakApi` / `useBloomPeak` (`GET /api/explore`로 대체)
- `user-follow.ts` — `followSummaryApi` / `useFollowSummary` (`UserProfileResponse.stats`와 중복)
- `spot-record.ts` — `publishSpotRecordApi` / `usePublishSpotRecord` (DRAFT 흐름이 기획에 없음)

> 위 3건은 백엔드에 폐기 여부를 물어둔 상태다. 회신이 오면 되돌릴지 판단한다 ([BACKEND_API_REQUESTS.md](BACKEND_API_REQUESTS.md) 참고).

### 2026-08-18에 삭제한 것

- `spot.ts` — `matchSpotApi`(plain async), `useSpotDetailFetcher`. 지도 핀 클릭에서 `POST /api/spots/match`로 Spot을 만들어 내던 우회가 사라졌다(서버가 노출 명소의 Spot 행을 미리 생성). `useMatchSpot`은 기록 작성에서 계속 쓰므로 남겼다
- `lib/utils/spotPreview.ts` — `formatDistance`. 프리뷰 응답에 `address`가 생겨 거리로 주소를 대신할 이유가 없어졌다
- `lib/utils/timing.ts` — `timingToDate`, `isFutureTiming`. 시기 필터가 `date`에서 `status`로 바뀌었다

> ⚠️ `next.config.ts`의 UploadThing 이미지 도메인(`utfs.io`, `*.ufs.sh`, `t3.storageapi.dev`)은 **백엔드가 내려주는 presigned URL** 때문에 여전히 필요하다. 라우트를 지웠다고 함께 지우면 안 된다.
> `package.json`의 `uploadthing`·`@uploadthing/react` 의존성은 이제 소스에서 참조되지 않는다. 제거는 별도로 판단한다.

---

## 3. API가 주는데 화면이 안 쓰는 필드

백엔드 요청 없이 프론트에서 해결 가능한 것들.

| 필드 | 화면 |
|---|---|
| `SpotDetailResponse.recordCount` | `/spot/[id]` 헤더에 방문 기록 수 미표시 (다른 화면들은 각자의 `recordCount`를 쓰고 있다) |
| `SpotPreviewItem.recordCount` | 핀 프리뷰 카드가 받아오지만 표시하지 않는다 |
| `SpotSearchItem.notifyEnabled` · `SpotPreviewItem.notifyEnabled` | 카드의 종 아이콘이 아직 죽은 어포던스 → [UX_BACKLOG.md](UX_BACKLOG.md) 5번 |
| `BloomBadge.peakDurationDays` | 프리뷰 카드에서 미사용 |

### 2026-08-18에 해소된 것

`FestivalDetailResponse.latitude/longitude`(→ `buildMapUrl`), `UserSearchItem.profileImageUrl`, `SpotSearchItem.type`, `BloomMapPin.type`(→ 상단 명소/동네 칩), `ExploreFestivalItem.endsInDays`. 축제 상태 배지의 `"진행중"` 하드코딩도 서버 `phase`로 교체됐다.

---

## 4. 페이지네이션

Phase 0에서 깐 무한 스크롤 훅(`useXxxInfinite`)과 공용 헬퍼(`src/api/facades/pagination.ts`, `src/hooks/useInfiniteScroll.ts`)는 피드·알림·검색·팔로우 목록·내 기록에 모두 연결됐다.

남은 단일 페이지 훅이 있으면 정리 대상이다.
