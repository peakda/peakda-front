# UX 백로그 — 알고 있으나 아직 안 고친 것

> 조사 기준: 2026-08-09 (`refactor/17`). 사용자 흐름 점검에서 나온 항목 중 **이번에 고치지 않기로 한 것**만 적는다.
> 백엔드 조치가 필요한 건은 [API_CHANGE_REQUESTS.md](API_CHANGE_REQUESTS.md), 화면에 연결 안 된 라우트/API는 [UNLINKED_ROUTES.md](UNLINKED_ROUTES.md)를 본다. 여기는 **동작은 하지만 사용자가 이상하게 느끼는 것**을 모은다.

같은 점검에서 나왔지만 이미 처리한 항목(라우트 가드, 닉네임 검증, 찜 해제, 삭제 확인 통일, 축제 배지, Nav 접근성, 최근 검색어, 로딩 피드백)은 여기 없다. git log 참고.

---

## 1. 애플·네이버 로그인 버튼이 무반응

**파일**: `src/app/login/_components/SocialLoginBtns.tsx`

카카오만 `onClick={handleKakaoLogin}` 이 붙어 있고 애플·네이버는 핸들러가 없다. `disabled` 도 아니라 정상 버튼으로 보이고, 누르면 아무 일도 일어나지 않는다. **첫 화면에서 사용자가 가장 먼저 만지는 지점**이라 체감이 크다.

- 구현 계획이 없으면: `disabled` + "준비 중" 표기로 최소 방어
- 구현한다면: 백엔드에 `/oauth2/authorization/apple`, `/oauth2/authorization/naver` 가 열려 있는지 먼저 확인. 카카오와 같은 방식(`window.location.href` 로 백엔드 도메인 직행)이면 각 3줄로 끝난다 — 프런트/백엔드 도메인이 달라 프록시를 거치면 OAuth 세션 쿠키가 끊기므로 반드시 백엔드 직행이어야 한다 (`src/lib/kakao/kakaoLogin.ts` 주석 참고)

## 2. 가입 도중 뒤로가기가 막다른 길

**파일**: `src/app/Terms/page.tsx`, `src/app/profile/page.tsx` (둘 다 헤더에 `<LeftArrow />`)

두 화면 모두 뒤로가기 화살표가 있는데, 히스토리상 뒤는 `/auth/callback` 이다. 거기 도착하면 `/auth/me` 를 다시 호출해 신규 유저를 `/Terms` 로 되돌린다. **버튼은 있는데 나갈 수 없다.**

- 가입 플로우에서는 화살표를 빼거나
- "나중에 하기 → 로그아웃 후 `/login`" 으로 의미를 명확히 하거나
- `/Terms` → `/profile` 구간만 뒤로가기를 살리고 `/Terms` 에서는 감춘다

참고: 라우트 가드(`src/middleware.ts`)는 `/Terms` 와 `/profile` 을 **공개**로 둔다. 신규 가입자는 `/auth/me` 가 401 이라 아직 인증 마커가 없기 때문이다. 이 항목을 고칠 때 그 전제를 깨지 않도록 주의한다.

## 3. 지역(권역) 필터가 결과에 반영되지 않는다

**파일**: `src/components/ui/layout/FilterDrawerContent.tsx` (지역 탭), `src/stores/useFilterStore.ts` (`FilterValues.region`)

`GET /api/seasonal/blooms` 에 `region` 파라미터가 없어서, 사용자가 권역을 고르고 "명소 보기"를 눌러도 **직전과 똑같은 목록**이 나온다. 고장난 화면으로 보인다.

→ **[API_CHANGE_REQUESTS.md](API_CHANGE_REQUESTS.md) 5번으로 이미 요청 중.** 서버 권역 코드가 확정되면 `date` 옆에 붙이면 된다. 그 전까지 지역 탭을 임시로 막을지는 응답을 받고 판단한다.

## 4. 탐색의 꽃 종류 복수 선택이 하나만 적용된다

**파일**: `src/app/explore/page.tsx` (`applied.categories[0]`), `src/app/explore/spots/page.tsx` (동일)

필터 드로어는 꽃을 여러 개 고르게 해주는데(`FilterDrawerContent.tsx` 의 `toggleDraftCategory`), 탐색은 서버 `category` 가 단일 값이라 **첫 번째만** 보낸다. 벚꽃+수국+단풍을 고르면 벚꽃 결과만 나온다.

같은 값을 지도(`MapContainer.tsx`)는 **클라이언트에서 OR 로 걸러** 3개 다 반영한다. **같은 필터 UI, 다른 결과** — 사용자가 예측할 수 없다.

- 단순한 해법: 탐색도 지도처럼 응답을 받아 클라에서 거른다. 단 탐색은 섹션별 상위 N건만 내려오므로 거르면 카드가 비어버릴 수 있다
- 또는 탐색 필터를 단일 선택으로 바꿔 UI 를 결과에 맞춘다
- 또는 서버가 `category` 를 배열로 받게 한다 (백엔드 요청 필요)

## 5. 필터 드로어 하단 버튼 라벨이 탭마다 바뀐다

**파일**: `src/components/ui/layout/Drawer.tsx` (`showsCount` 분기)

꽃 종류 탭에서만 "12개의 명소 보기", 지역·시기 탭에서는 "명소 보기". 탭을 옮길 때마다 버튼 문구가 왔다 갔다 한다.

이유는 정당하다 — 꽃 종류는 클라 필터라 개수를 미리 셀 수 있고, 지역·시기는 서버를 다녀와야 안다. 다만 **사용자에게는 그 사정이 안 보인다.** 셋 다 "명소 보기" 로 통일할지, 개수를 못 세는 탭에서도 적용 후 개수를 보여줄지 결정 필요. 기능 문제가 아니라 판단 대기라 보류.

## 6. `SpotCard` 의 종 아이콘이 죽은 어포던스

**파일**: `src/components/ui/card/SpotCard.tsx`

`<Bell className="h-5 w-5 text-gray-300" />` 이 `IconBtn` 안에 들어 있어 누를 수 있게 생겼는데 `onClick` 이 없다. 항상 회색이고 아무 일도 안 한다.

개화 알림 토글 API(`PATCH /api/spots/favorites/{spotId}/notify`)는 이미 있고 `useUpdateFavoriteNotify` 로 감싸져 있다. 다만 **찜하지 않은 스팟에는 알림을 걸 수 없으므로**(알림은 찜에 종속), 하트와의 관계를 먼저 정해야 한다.

- 찜 안 된 상태에서 종을 누르면 → 찜부터 하게 할지, 비활성으로 둘지
- 아니면 종을 아예 제거하고 찜 시트의 토글만 남길지
