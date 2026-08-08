# ARCHITECTURE.md

Peakda 프런트엔드(Next.js, Vercel)와 백엔드(AWS) 간 실제 데이터 흐름. 세부 디렉터리는 `src/CLAUDE.md`, `public/CLAUDE.md` 참고.

## API 호출 흐름

```mermaid
flowchart LR
  Page["src/app/** (Server/Client Component)"]
  Facade["src/api/facades/*.ts"]
  Generated["src/api/facades/generated/** (orval, react-query)"]
  Mutator["src/api/mutator (customInstance)"]
  Backend[("Backend API · AWS")]
  Upload["src/app/api/uploadthing (Route Handler)"]
  UT[("UploadThing")]

  Page --> Facade --> Generated --> Mutator
  Mutator -->|"fetch + credentials: include"| Backend
  Page -->|파일 업로드만| Upload --> UT
```

- 새 API 도메인: swagger 갱신 → `pnpm generate:api` → `pnpm generate:facades` → 파사드 TODO 채우기 (`src/CLAUDE.md` 참고).
- 응답 언래핑: 파사드에서 `res.data`(orval 래퍼) → `res.data.data`(백엔드 실제 payload) 순으로 벗겨 앱에 노출한다.

## 인증 흐름 (토큰 refresh)

```mermaid
sequenceDiagram
  participant C as Client
  participant M as customInstance
  participant B as Backend

  C->>M: API 요청
  M->>B: fetch (credentials: include)
  B-->>M: 401 (access token 만료)
  M->>B: POST /api/auth/refresh (동시 요청은 1회로 합침)
  alt refresh 성공
    B-->>M: 200
    M->>B: 원요청 재시도
    B-->>M: 200
    M-->>C: 데이터 반환
  else refresh 실패
    M-->>C: /login 으로 리다이렉트
  end
```

> **Note**: 프런트(Vercel)·백엔드(AWS) 도메인이 달라 크로스사이트 쿠키(`SameSite=None; Secure`)로 인증을 주고받는다. 이 때문에 `src/api/mutator/index.ts`는 `NEXT_PUBLIC_API_URL`로 **브라우저/서버에서 백엔드를 직접 호출**하는 것이 의도된 설계다 (`CLAUDE.md` API 호출 규칙과 일치, 2026-07-19 정합). Route Handler 프록시 패턴은 `src/app/api/uploadthing` (파일 업로드)에만 적용된다.

## 카카오맵 흐름

```mermaid
flowchart LR
  MapUI["src/components/Map (dynamic import, ssr:false)"] --> Loader["src/lib/kakao/kakaoLoader"] --> SDK[("Kakao Maps SDK")]
  Hooks["src/hooks (useKakaoPlaces, useMapPins, useLazyMapLoad)"] --> Loader
  MapUI --> Prefetch["src/lib/kakao/tilePrefetch"]
  MapUI -->|"navigator.serviceWorker.register"| SW["public/map-tile-sw.js"]
  Prefetch --> SW --> SDK
```

- 타일 캐싱: `src/components/Map/MapContainer.tsx`가 서비스워커(`public/map-tile-sw.js`)를 등록하고 `prefetchInitialTiles`로 초기 타일을 미리 받는다.
- `src/lib/kakao/kakaoLogin.ts`는 지도가 아니라 **카카오 소셜 로그인**용이다 (`src/app/login`에서 사용) — 같은 디렉터리에 있지만 위 흐름과 무관.

## 상태 관리 계층

| 계층 | 도구 | 위치 |
| --- | --- | --- |
| 서버 상태 (API 데이터) | TanStack Query | `src/api/facades/*.ts` (generated 훅을 감싼 파사드) — 페이지는 generated를 직접 쓰지 않는다 |
| 클라이언트 전역 상태 | Zustand | `src/stores/` |
| 탭 등 국소 공유 상태 | React Context | `src/context/TabContext.tsx` (신규 공유 상태는 Zustand 우선 검토) |
| 로컬 UI 상태 | useState | 컴포넌트 내부 |
