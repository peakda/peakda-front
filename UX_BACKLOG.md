# UX 백로그 — 알고 있으나 아직 안 고친 것

> 최종 갱신: 2026-08-19 (`feat/19`). 사용자 흐름 점검에서 나온 항목 중 **아직 고치지 않은 것**만 적는다.
> 백엔드 조치가 필요한 건은 [BACKEND_API_REQUESTS.md](BACKEND_API_REQUESTS.md), 화면에 연결 안 된 라우트/API는 [UNLINKED_ROUTES.md](UNLINKED_ROUTES.md)를 본다. 여기는 **동작은 하지만 사용자가 이상하게 느끼는 것**을 모은다.

이미 처리한 항목은 여기서 지운다. git log 참고.
2026-08-18 에 해소된 것: **지역(권역) 필터 무반응** — 서버 `region` 파라미터가 생겨 실제로 결과에 반영된다.
2026-08-19 에 해소된 것: **핀 프리뷰·스팟 카드의 하트/종 무반응** — `spotId` 배선이 끊겨 있었고 종은 아예 버튼이 아니었다. `BellBtn` 을 만들어 둘 다 연결했다(찜 안 된 스팟에서는 종 비활성).
2026-09-01 에 해소된 것: **네이버 로그인 버튼 무반응** — 카카오와 같은 방식(`src/lib/naver/naverLogin.ts`, `window.location.href` 로 `${NEXT_PUBLIC_API_URL}/oauth2/authorization/naver` 직행)으로 연결. 단, 백엔드에 `/oauth2/authorization/naver` 가 실제로 열려 있는지는 미검증 — 확인 필요.

---

## 1. 애플 로그인 버튼이 무반응

**파일**: `src/app/login/_components/SocialLoginBtns.tsx`

애플만 아직 핸들러가 없다. `disabled` 도 아니라 정상 버튼으로 보이고, 누르면 아무 일도 일어나지 않는다. **첫 화면에서 사용자가 가장 먼저 만지는 지점**이라 체감이 크다.

- 구현 계획이 없으면: `disabled` + "준비 중" 표기로 최소 방어
- 구현한다면: 백엔드에 `/oauth2/authorization/apple` 이 열려 있는지 먼저 확인. 카카오·네이버와 같은 방식(`window.location.href` 로 백엔드 도메인 직행)이면 3줄로 끝난다 — 프런트/백엔드 도메인이 달라 프록시를 거치면 OAuth 세션 쿠키가 끊기므로 반드시 백엔드 직행이어야 한다 (`src/lib/kakao/kakaoLogin.ts` 주석 참고)

## 2. 가입 도중 뒤로가기가 막다른 길

**파일**: `src/app/Terms/page.tsx`, `src/app/profile/page.tsx` (둘 다 헤더에 `<LeftArrow />`)

두 화면 모두 뒤로가기 화살표가 있는데, 히스토리상 뒤는 `/auth/callback` 이다. 거기 도착하면 `/auth/me` 를 다시 호출해 신규 유저를 `/Terms` 로 되돌린다. **버튼은 있는데 나갈 수 없다.**

- 가입 플로우에서는 화살표를 빼거나
- "나중에 하기 → 로그아웃 후 `/login`" 으로 의미를 명확히 하거나
- `/Terms` → `/profile` 구간만 뒤로가기를 살리고 `/Terms` 에서는 감춘다

참고: 라우트 가드(`src/middleware.ts`)는 `/Terms` 와 `/profile` 을 **공개**로 둔다. 신규 가입자는 `/auth/me` 가 401 이라 아직 인증 마커가 없기 때문이다. 이 항목을 고칠 때 그 전제를 깨지 않도록 주의한다.

## 3. 탐색의 꽃 종류 복수 선택이 하나만 적용된다

**파일**: `src/app/explore/page.tsx:70`, `src/app/explore/spots/page.tsx:30` (둘 다 `applied.categories[0]`)

필터 드로어는 꽃을 여러 개 고르게 해주는데, 탐색은 **첫 번째만** 보낸다. 벚꽃+수국+단풍을 고르면 벚꽃 결과만 나온다.

같은 값을 지도(`MapContainer.tsx`)는 응답을 받아 **클라이언트에서 OR 로** 걸러 3개 다 반영한다. **같은 필터 UI, 다른 결과** — 사용자가 예측할 수 없다.

2026-08-18 백엔드가 `categories`(복수)를 추가했지만 **`GET /api/seasonal/blooms` 와 `GET /api/spots/preview` 에만** 넣었다. 탐색 3개 엔드포인트(`/api/explore`, `/api/explore/spots`, `/api/explore/festivals`)는 여전히 단일 `category` 뿐이다.

- 가장 단순한 해법: 탐색 엔드포인트에도 `categories` 를 요청한다 → [BACKEND_API_REQUESTS.md](BACKEND_API_REQUESTS.md) 의 남은 요청 참고
- 그 전까지 임시로: 탐색 필터를 단일 선택으로 바꿔 UI 를 결과에 맞추거나, 지도처럼 클라에서 거른다(탐색은 섹션별 상위 N건만 내려와 거르면 카드가 비어버릴 수 있다)

## 4. 필터 드로어 하단 버튼 라벨이 탭마다 바뀐다

**파일**: `src/components/ui/layout/Drawer.tsx` (`showsCount` 분기)

꽃 종류 탭에서만 "12개의 명소 보기", 지역·시기 탭에서는 "명소 보기". 탭을 옮길 때마다 버튼 문구가 왔다 갔다 한다.

이유는 정당하다 — 꽃 종류는 클라 필터라 개수를 미리 셀 수 있고, 지역·시기는 서버를 다녀와야 안다(2026-08-18 이후에도 그대로다. 꽃 종류를 일부러 서버로 안 보내는 이유는 `MapContainer.tsx` 의 `bloomParams` 주석 참고). 다만 **사용자에게는 그 사정이 안 보인다.** 셋 다 "명소 보기" 로 통일할지, 개수를 못 세는 탭에서도 적용 후 개수를 보여줄지 결정 필요. 기능 문제가 아니라 판단 대기라 보류.

## 5. 핀 프리뷰 카드가 배지를 3개까지만 보여준다

**파일**: `src/components/ui/display/PinText.tsx` (`MAX_BADGES`)

한 스팟에 꽃이 4종 이상 피어 있고 필터로 그걸 다 골랐다면, 카드에는 3개까지만 나오고 나머지는 조용히 잘린다. 칩이 한 줄을 넘기면 카드 레이아웃이 깨져서 건 제한이다.

"+2" 같은 표기로 잘린 개수를 알려줄지, 줄바꿈을 허용할지 디자인 판단이 필요하다. 현재는 조용히 자른다.
