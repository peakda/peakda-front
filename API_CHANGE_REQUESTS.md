# API 변경 요청 — 프론트 대응 현황

> **최종 갱신**: 2026-08-18 (`refactor/18`) · **기준 스펙**: PEAKDA API v1 (Develop: `https://api-dev.peakda.com`)
> 백엔드에 전달한 요청 원문은 [BACKEND_API_REQUESTS.md](BACKEND_API_REQUESTS.md). 여기는 **그 요청들에 대한 프론트 대응 현황과 경위**(내부용)를 적는다.

2026-08-10 자 요청 13건에 대해 백엔드 회신을 받았고(PR #70~#75), 프론트 대응을 완료했다.
백엔드 스펙 재생성은 `76dd538`, 화면 반영은 그 뒤 11개 커밋이다.

---

## 대응 결과 요약

| # | 요청 | 백엔드 | 프론트 대응 | 커밋 |
|---|---|---|---|---|
| 1 | 조회 응답에 내 리액션·차단 상태 | 반영 | 완료 | `fea4986` |
| 2 | `SpotSearchItem` 표시 정보 보강 | 반영 | 완료 | `93ed1d0` |
| 3 | `ExploreFestivalItem` 이미지·진행상태 | 반영 | 완료 | `93ed1d0` |
| 4 | `ExploreSpotItem.spotId` null 정책 | A안(백필) | 완료 | `98ee3f8` |
| 5 | 필터 조건 파라미터(`region`·`category`) | 반영 | 완료 | `287cf53`, `93ed1d0` |
| 6 | 꽃 카테고리 enum | 해바라기·국화 추가 | 완료 | `00063a6` |
| 7 | 알림 딥링크 규격 | 반영 | 완료 | `c5d3dae` |
| 8 | 축제 문의처 | **미반영**(디자인에 영역 없음) | 대응 없음 | — |
| 9 | 미연동 엔드포인트 정리 | 일부 회신 | 아래 참고 | — |
| 10 | 사진 다중 업로드 | 원래 지원, 문서만 수정 | 완료 | `8fb9768` |
| 11 | `preview` 응답 필드 보강 | 반영 | 완료 | `0f8799d`, `010ae82`, `54847f0` |
| 12 | `category` 복수 조건 | blooms·preview 에 추가 | **부분 완료** — 아래 참고 | `0f8799d` |
| 13 | `date` 지정 시 동네형 처리 | `status` 로 재설계 | 완료 | `287cf53` |

---

## 회신으로 밝혀진 것 (요청 당시 프론트가 틀렸던 것)

- **`AZALEA` / `AZALEA_KR` 매핑이 반대였다.** 서버 `displayName` 기준은 `AZALEA_KR`=진달래, `AZALEA`=철쭉인데 프론트는 뒤집혀 있었다. 6번에서 "이대로 맞는지 확인만" 이라고 적었던 게 실제로는 틀린 상태였다. **같은 매핑이 3곳에 복제**돼 있었고(`constants/flower.ts`, `app/profile/page.tsx`, `app/profile/edit/page.tsx`) 아이콘까지 4·5곳을 함께 고쳤다.
  - 프로필 **조회**는 서버 `displayName` 을 쓰고 **편집**은 하드코딩을 써서, 같은 유저의 관심 꽃이 두 화면에서 다르게 보이고 있었다.
  - 이미 잘못 저장된 사용자 데이터는 프론트 수정으로 되돌아가지 않는다. 보정이 필요한지는 미결.
- **사진 다중 업로드는 원래 서버가 지원하고 있었다.** 스키마가 단수 `Blob` 으로 보인 건 OpenAPI 문서 설정 문제였다. 스키마 수정 후 orval 이 `formData.append` 를 순회로 생성해 클라 수정은 한 줄이었다.
- **시기 탭은 방문예정일이 아니라 개화 상태를 고르는 UI 였다.** `date` 로 붙였던 게 설계 오해였고 `status` 로 재설계했다.

## 요청과 별개로 이번에 고친 것

- **꽃 필터를 걸어도 핀 아이콘·색이 선택과 어긋났다** (`00063a6`). `filterMapSpots` 가 핀을 통과시키기만 하고 핀이 보여줄 꽃은 그대로 둬서, 벚꽃으로 걸러도 같은 핀의 단풍 아이콘이 뜨고 색도 단풍 기준으로 칠해졌다. 백엔드가 preview 배지에서 지적한 것과 **같은 부류의 버그가 지도 핀에도 있었다.**
- **배지를 여러 개 띄우면 아이콘이 전부 첫 꽃 것이었다** (`54847f0`). `Badges: string[]` + `badgeIcon` 하나 구조라 구조적으로 어긋날 수밖에 없어 `badges: { label, icon }[]` 로 바꿨다.
- **설정의 위치정보·EXIF 토글이 아무 동작도 안 했다** (`f000e99`). 백엔드에 대응 API 가 없다고 확정돼 localStorage 로 마무리했다.

---

## 부분 완료·미결

### 12번 — `categories` 가 탐색 엔드포인트에는 없다

백엔드가 `categories`(복수)를 **`GET /api/seasonal/blooms` 와 `GET /api/spots/preview` 에만** 추가했다. 탐색 3개(`/api/explore`, `/api/explore/spots`, `/api/explore/festivals`)는 여전히 단일 `category` 라, 탐색 화면은 지금도 `applied.categories[0]` 으로 **첫 번째 꽃만** 보낸다.

→ [UX_BACKLOG.md](UX_BACKLOG.md) 3번, 추가 요청은 [BACKEND_API_REQUESTS.md](BACKEND_API_REQUESTS.md) 참고.

### `blooms` 에는 `categories` 를 일부러 안 보낸다

파라미터는 생겼지만 쓰지 않기로 했다. 서버가 걸러 주면 ①필터 드로어 하단의 "N개의 명소 보기" 를 draft 기준으로 셀 수 없고 ②응답에서 안 고른 꽃이 빠져 **핀 아이콘을 선택에 맞게 좁힐 수 없다.** 과다 조회는 bbox 한 화면 분량이고 React Query 가 격자 스냅으로 캐싱하므로 그 대가가 더 싸다고 판단했다. 근거는 `MapContainer.tsx` 의 `bloomParams` 주석에 남겼다.

### 권역 `displayName`·`subtitle` 이 스펙에 없다

회신에는 "`displayName` 과 `subtitle` 도 응답하므로 프론트 하드코딩은 제거할 수 있습니다" 라고 되어 있는데, **재생성한 스펙에 권역 목록을 주는 엔드포인트도 `Region` 응답 스키마도 없다.** `GetSeasonalBloomsRegion` 은 요청 파라미터 enum 일 뿐이다. 그래서 라벨은 `src/constants/region.ts` 에 그대로 뒀다. 백엔드 확인 필요.

### `spotId` 백필을 실데이터로 확인하지 못했다

4번을 A안(서버가 Spot 행 미리 생성)으로 받아 `spotId == null` 분기를 제거했다. 다만 회신에 적힌 "관리자 트리거 백필 작업" 엔드포인트가 **스펙에 없어** 스키마만으로는 확인할 수 없었다. 타입은 여전히 `Long?` 이므로, `null` 이 내려오면 `/spot/null` 로 이동한다. 탐색 응답 실데이터 확인이 필요하다.

### 9번 미연동 엔드포인트 — 백엔드/기획 대기

| 엔드포인트 | 상태 |
|---|---|
| `GET /api/seasonal/blooms/peak` | 백엔드가 제거 여부 검토 중. 프론트 파사드는 삭제 상태 유지 |
| `GET /api/users/{userId}/follow-summary` | 백엔드가 용도 확인 중. 프론트 파사드는 삭제 상태 유지 |
| `GET /api/curations` | 큐레이션 **목록 화면** 기획 확인 필요 |
| `POST /api/spots/records/{id}/publish` | DRAFT 흐름 확정 대기 |
| `POST /api/devices` / `DELETE /api/devices/{token}` | 푸시 인프라 도입 일정 대기 |

### 로컬 전용으로 확정된 것

- 위치 정보 활용 / EXIF 자동 추출 토글 → localStorage (`src/lib/utils/appSettings.ts`)
- 최근 검색어 → localStorage (기기 간 동기화 없음)

---

## 검증 상태

`pnpm typecheck` · `pnpm lint` · `pnpm test`(215건) · `pnpm validate:context` 통과.

**브라우저 확인은 하지 않았다.** 이번 대응으로 지도·탐색·검색·알림·피드·설정이 모두 바뀌었으므로 화면 검증이 필요하다. 특히 지도 필터(`status`·`region` 의 실제 필터링), 핀 클릭 드로어, 4칸 사진 그리드, 알림 딥링크.
