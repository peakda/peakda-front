# 연동 안 된 API / 라우팅 안 된 페이지

> 조사 기준: 2026-08-08 (`feat/15` 브랜치, Phase 0 정리 직후)
> 이전 판(2026-07-26, `feat/11`)은 explore·festivals·creators가 모두 목데이터라고 적고 있었으나 그 사이 실 API로 연동되어 내용 대부분이 무효가 됐다. 전면 갱신했다.

## 아키텍처 요약

- `src/app/api` Route Handler는 **없다.** 유일하게 있던 uploadthing 라우트는 호출부가 없어 2026-08-08 제거했다.
- 백엔드 API는 `src/api/facades/*.ts`(수동 파사드) → `src/api/facades/generated/**`(orval) → `src/api/mutator` 순으로 호출된다.

---

## 1. 라우팅 안 된 페이지

**없다.** 이전 판에서 orphan으로 적혀 있던 두 페이지는 현재 모두 진입 동선이 있다.

| 라우트 | 진입 경로 |
|---|---|
| `/festivals/[id]` | `/explore` 축제 카드, `/explore/festivals` 목록 (둘 다 `Link` 연결됨) |
| `/creators/[id]` | `/explore` 큐레이션 카드 (`Link href={`/creators/${item.id}`}`) |

`/auth/callback`은 OAuth 리다이렉트 외부 진입점이라 내부 링크가 없는 게 정상이다.

---

## 2. 연동 안 된 API (파사드는 있고 호출부가 없음)

| 파사드 | 상태 |
|---|---|
| `seasonal-bloom.ts` — `bloomCalendarApi`, `useBloomCalendar` | **연동 가능, 화면 기획 대기.** 스팟 상세의 일별 개화 타임라인용. 필요한 파라미터(`attractionId`, `category`)는 `SpotDetailResponse`에 이미 다 있다 |
| `spot-record.ts` — `listMySpotRecordsApi`, `useMySpotRecords`, `useMySpotRecordsInfinite` | **Phase 1에서 연동 예정.** 마이 "내 기록 전체보기"(`/my/records`)용. `MyPageResponse.recordPreview` 스키마 주석에 "더보기는 스팟 기록 리스트 API로"라고 명시돼 있어 용도 확정 |
| `spot.ts` — `spotPreviewApi`, `useSpotPreview` | 지도 클러스터 다중 핀 리스트(SCR-011d)용. 해당 화면이 아직 없어 보류 |
| `device.ts` — `registerDeviceApi`, `unregisterDeviceApi` | 푸시 인프라(FCM 등) 도입 전까지 보류 |
| `auth.ts` — `refreshApi` | 실질 미사용. 토큰 갱신은 `src/api/mutator/index.ts`가 orval 부트스트랩 순환을 피하려고 **raw fetch로 직접** 호출한다. 파사드 쪽은 남은 껍데기 |

### 2026-08-08 삭제한 것

호출부가 없고 대체 경로가 확정된 것만 지웠다.

- `src/lib/uploadthing.ts`, `src/app/api/uploadthing/` — 프로필 이미지 업로드는 백엔드 API(`uploadProfileImageApi`)가 처리
- `seasonal-bloom.ts` — `bloomPeakApi` / `useBloomPeak` (`GET /api/explore`로 대체됨)
- `user-follow.ts` — `followSummaryApi` / `useFollowSummary` (`UserProfileResponse.stats`와 중복)
- `spot-record.ts` — `publishSpotRecordApi` / `usePublishSpotRecord` (DRAFT 흐름이 기획에 없음)

> ⚠️ `next.config.ts`의 UploadThing 이미지 도메인(`utfs.io`, `*.ufs.sh`, `t3.storageapi.dev`)은 **백엔드가 내려주는 presigned URL** 때문에 여전히 필요하다. 라우트를 지웠다고 함께 지우면 안 된다.
> `package.json`의 `uploadthing`·`@uploadthing/react` 의존성은 이제 소스에서 참조되지 않는다. 제거는 별도로 판단한다.

---

## 3. API가 주는데 화면이 안 쓰는 필드

백엔드 요청 없이 프론트에서 해결 가능한 것들. 상세는 [API_CHANGE_REQUESTS.md](API_CHANGE_REQUESTS.md)와 구분해서 본다(그쪽은 백엔드 조치가 필요한 건).

| 필드 | 화면 |
|---|---|
| `FestivalDetailResponse.latitude/longitude` | `/festivals/[id]` "지도에서 보기"가 좌표 없이 `/map`으로만 이동 (스키마 주석은 "지도 CTA에 사용할"이라고 명시) |
| `UserSearchItem.profileImageUrl` | `/search` 유저 결과 아바타가 항상 기본 아이콘 |
| `SpotSearchItem.type` | `/search` 스팟 카드에서 명소/동네 구분 미표시 |
| `SpotDetailResponse.recordCount` | `/spot/[id]` 헤더에 방문 기록 수 미표시 |
| `BloomMapPin.type` | `/map` 상단 "전체/명소/동네" 칩이 무기능 (`bloomToMapSpots`가 이 필드를 버림) |
| `ExploreFestivalItem.endsInDays` | 설명 문구엔 쓰지만 상태 배지는 `"진행중"` 하드코딩 |

---

## 4. 페이지네이션

모든 목록 API가 공통 `PageResponse`(`page`/`hasNext`/`totalPages`)를 주지만, 2026-08-08 이전에는 이를 쓰는 코드가 하나도 없어 전 목록이 첫 페이지 고정이었다.

Phase 0에서 파사드에 무한 스크롤 훅(`useXxxInfinite`)과 공용 헬퍼(`src/api/facades/pagination.ts`, `src/hooks/useInfiniteScroll.ts`)를 깔았고, 화면 연결은 Phase 1에서 진행한다. 연결 후 남는 단일 페이지 훅(`useFeedList`, `useNotificationList` 등)은 정리 대상이다.
