# Peakda Metadata · SEO · GEO 점검 보고서

- 점검일: 2026-09-12
- 대상: Peakda Next.js 프런트엔드
- 점검 방식: 소스 코드 분석, 프로덕션 빌드, 로컬 HTTP 응답 확인
- GEO 범위: 생성형 검색 최적화와 지역 검색 최적화 모두 포함

## 1. 종합 결론

현재 상태는 기본 메타데이터만 일부 갖춘 수준이며, SEO 및 GEO 최적화가 잘 되어 있다고 보기는 어렵다.

가장 큰 문제는 명소·축제·큐레이션 같은 검색 가치가 높은 콘텐츠가 로그인 뒤에 가려져 있고, 상세 데이터가 클라이언트에서 API 호출 후 표시된다는 점이다. 이 구조에서는 메타 태그만 추가해도 검색 노출이 크게 개선되기 어렵다.

| 점검 항목 | 상태 | 요약 |
|---|---|---|
| 기본 title/description/lang | 부분 충족 | 전역 기본값과 한국어 설정 존재 |
| 검색엔진 크롤링·색인 | 문제 있음 | 핵심 콘텐츠 URL이 비로그인 요청을 로그인으로 리디렉션 |
| 명소·축제 동적 메타데이터 | 미구현 | `generateMetadata` 없음 |
| Open Graph·SNS 공유 카드 | 불충분 | 페이지별 정보와 이미지 없음 |
| robots.txt | 미구현 | `/robots.txt`가 404 반환 |
| sitemap.xml | 미구현 | `/sitemap.xml`이 404 반환 |
| JSON-LD 구조화 데이터 | 미구현 | schema.org 마크업 없음 |
| 생성형 검색 GEO | 미흡 | 공개·크롤링 가능한 본문과 출처·최신성 신호 부족 |
| 지역 검색 최적화 | 미흡 | 장소·주소·좌표·축제 정보를 서버 HTML과 구조화 데이터로 제공하지 않음 |
| 프로덕션 빌드 | 정상 | `pnpm build` 통과 |

## 2. 주요 문제

### 2.1 핵심 콘텐츠가 로그인 뒤에 가려져 있음 — 최우선

`src/middleware.ts`는 루트, 로그인, 온보딩, 약관 등 일부 경로를 제외한 대부분의 경로를 보호한다.

비로그인 상태에서 실제 HTTP 응답을 확인한 결과는 다음과 같다.

| 요청 URL | 응답 |
|---|---|
| `/` | `200 OK` |
| `/explore` | `307 Temporary Redirect` → `/login` |
| `/spot/1` | `307 Temporary Redirect` → `/login` |
| `/festivals/1` | `307 Temporary Redirect` → `/login` |

따라서 검색엔진과 SNS 공유 크롤러는 명소·축제 콘텐츠 대신 로그인 화면을 보게 된다. 생성형 검색 시스템도 공개적으로 접근하고 크롤링할 수 있는 콘텐츠를 기반으로 하므로 동일한 제약을 받는다.

관련 코드:

- `src/middleware.ts:8`
- `src/middleware.ts:15`
- `src/middleware.ts:22`

### 2.2 상세 페이지의 초기 HTML에 실제 콘텐츠가 없음 — 최우선

다음 상세 페이지는 모두 Client Component이며 브라우저에서 API를 호출한 뒤 내용을 렌더링한다.

- `src/app/spot/[id]/page.tsx`
- `src/app/festivals/[id]/page.tsx`
- `src/app/creators/[id]/page.tsx`
- `src/app/feed/[id]/page.tsx`

인증 마커 쿠키를 넣고 초기 HTML을 확인해도 모든 상세 페이지에서 다음과 같은 공통 정보만 확인됐다.

```text
title: Peakda | 계절 여행 타이밍
description: 벚꽃·단풍 등 20여 개 계절 명소의 실시간 개화 상태를 확인하세요.
og:title: Peakda | 계절 여행 타이밍
```

초기 HTML에는 실제 명소명, 주소, 축제명, 기간, 상세 설명이 없으며 canonical 및 Open Graph 이미지도 없다.

스팟 상세는 `useEffect`에서 `document.title`만 변경하지만, 이는 초기 HTML이나 일반적인 SNS 공유 크롤러에 반영되지 않는다.

관련 코드:

- `src/app/spot/[id]/page.tsx:1`
- `src/app/spot/[id]/page.tsx:44`
- `src/app/spot/[id]/page.tsx:46`
- `src/app/festivals/[id]/page.tsx:1`
- `src/app/festivals/[id]/page.tsx:45`
- `src/app/creators/[id]/page.tsx:1`
- `src/app/creators/[id]/page.tsx:35`

### 2.3 robots.txt와 sitemap.xml이 없음 — 높음

실제 응답:

```text
/robots.txt  → 404 Not Found
/sitemap.xml → 404 Not Found
```

robots.txt가 없다고 검색엔진의 크롤링이 자동 차단되는 것은 아니다. 하지만 크롤링 정책과 sitemap 위치를 전달할 수 없고, sitemap이 없어 신규·변경 상세 URL의 발견도 어려워진다.

특히 현재는 핵심 콘텐츠가 로그인으로 리디렉션되고 홈 화면에도 공개 상세 페이지로 연결되는 탐색 구조가 부족하므로 URL 발견 가능성이 매우 낮다.

### 2.4 페이지별 메타데이터가 부족하고 중복됨 — 높음

전역 메타데이터는 `src/app/layout.tsx:16`에 설정되어 있지만 다음 항목이 없다.

- `metadataBase`
- canonical URL
- `openGraph.url`
- `openGraph.siteName`
- `openGraph.images`
- Twitter 전용 이미지
- 페이지별 Open Graph title/description
- Google 및 네이버 사이트 소유권 인증값

전체 30개 `page.tsx` 중 자체 metadata를 정의한 페이지는 5개이며, 동적 `generateMetadata`를 사용하는 페이지는 없다.

현재 자체 metadata가 있는 페이지:

- `/`
- `/login`
- `/map`
- `/notification`
- `/onboarding`

로그인·지도 등의 HTML title은 개별 값으로 출력되지만 Open Graph 정보는 여전히 전역 기본값을 사용한다.

### 2.5 비공개·도구성 화면에 noindex가 없음 — 높음

다음 경로는 일반적으로 검색결과에 노출할 가치가 없거나 노출하지 않는 것이 안전하다.

- `/login`
- `/onboarding`
- `/auth/callback`
- `/search`
- `/notification`
- `/my/**`
- `/record/**`
- `/profile/**`
- `/followers`
- `/following`

현재 `robots` metadata나 `X-Robots-Tag` 설정은 없다. 인증 리디렉션은 접근 제어일 뿐 올바른 색인 제어를 대체하지 않는다.

약관 페이지는 운영 정책에 따라 색인 여부를 결정하되, 가입 동의 화면과 공개 법적 고지 페이지를 분리하는 것이 좋다.

### 2.6 JSON-LD 구조화 데이터가 없음 — 높음

코드에서 `application/ld+json`, schema.org 또는 JSON-LD 사용이 발견되지 않았다.

Peakda에 적합한 구조화 데이터 후보:

| 페이지 유형 | 권장 스키마 |
|---|---|
| 공개 랜딩 페이지 | `Organization`, `WebSite` |
| 명소 상세 | `Place` 또는 `TouristAttraction` |
| 축제 상세 | `Event`, `Place`, `PostalAddress` |
| 상세 페이지 탐색 구조 | `BreadcrumbList` |

명소·축제 API에는 주소, 좌표, 이미지, 일정 등의 데이터가 있으므로 구현 기반은 충분하다. 구조화 데이터는 반드시 화면에 표시되는 실제 내용과 일치해야 한다.

### 2.7 잘못된 상세 ID가 서버에서 404가 되지 않음 — 중간

상세 데이터가 클라이언트에서 로드되므로 존재하지 않는 ID도 최초 서버 응답은 `200 OK`가 된다. 이후 브라우저에서 오류 메시지만 표시될 가능성이 있어 검색엔진이 soft 404로 판단할 수 있다.

상세 페이지를 서버에서 조회하고 데이터가 없으면 Next.js의 `notFound()`를 호출해 실제 404 응답을 제공해야 한다.

### 2.8 홈이 검색용 랜딩 페이지 역할을 하지 못함 — 높음

홈은 `SplashScreen`만 출력한다.

- `src/app/page.tsx:9`
- `src/app/_components/SplashScreen.tsx:12`

초기 콘텐츠는 브랜드명과 짧은 문구뿐이며, 2초 뒤 로컬 저장값에 따라 로그인 또는 온보딩으로 클라이언트 이동한다. 검색엔진 관점에서는 서비스 설명, 계절별 탐색 콘텐츠, 공개 명소 링크가 없는 매우 얇은 페이지다.

## 3. GEO 점검

### 3.1 생성형 검색 최적화

별도의 GEO 전용 메타 태그보다 다음 기반 요소가 우선이다.

- 공개적으로 접근 가능한 HTML
- 서버에서 확인 가능한 명확한 본문과 제목
- 사실의 출처와 작성 주체
- 최종 업데이트 시각
- 명확한 장소·축제·식물 엔티티 관계
- 실제 본문과 일치하는 구조화 데이터
- 안정적인 canonical URL

현재 Peakda는 로그인 리디렉션과 클라이언트 데이터 로딩 때문에 위 신호 대부분이 검색 크롤러에 전달되지 않는다.

개화 상태처럼 자주 바뀌는 정보에는 다음 정보를 사용자에게도 표시하는 것이 좋다.

- 마지막 업데이트 시각
- 현장 기록 또는 데이터 출처
- 개화 단계 판정 기준
- 예측값과 실제 관측값의 구분

`llms.txt`는 핵심 해결책이 아니다. 먼저 정상적인 공개 HTML, 색인, sitemap, 메타데이터 및 신뢰할 수 있는 콘텐츠를 갖추는 것이 우선이다.

### 3.2 지역 검색 최적화

화면에는 명소명과 주소가 표시되지만 초기 서버 HTML과 구조화 데이터에는 포함되지 않는다.

명소 상세에서 제공하면 좋은 정보:

- 공식 명소명
- 도로명 주소
- 지역명
- 위도·경도
- 대표 이미지
- 관람 가능 시간과 공식 URL
- 현재 개화 상태와 업데이트 시각
- 관련 축제와 식물 종류

축제 상세에서는 다음 필드를 `Event` JSON-LD로 구성할 수 있다.

- `name`
- `description`
- `startDate`
- `endDate`
- `eventStatus`
- `image`
- `location.name`
- `location.address`
- `location.geo`
- `organizer`
- `url`

Google Event 전용 검색 기능은 지역별 지원 범위가 있으므로 한국에서 리치 결과가 보장되지는 않는다. 그래도 정확한 엔티티와 일정 정보를 제공하는 의미는 있다.

## 4. 잘 되어 있는 부분

- `<html lang="ko">` 설정
- 기본 title과 description 존재
- Open Graph locale이 `ko_KR`로 설정됨
- favicon 및 Apple touch icon 존재
- 모바일 viewport 설정
- 주요 콘텐츠 이미지에 alt 속성 사용
- 일부 상세 화면에 시각적 `h1` 존재
- Next.js 프로덕션 빌드 정상 통과

## 5. 권장 개선 순서

### P0 — 색인 가능한 공개 콘텐츠 구조 만들기

1. `/spot/[id]`, `/festivals/[id]`, `/creators/[id]`를 로그인 없이 접근 가능한 공개 페이지로 전환한다.
2. 앱 기능은 계속 인증 뒤에 두되, 조회용 상세 정보는 공개한다.
3. 공개가 어려우면 별도의 `/places/**`, `/events/**`, `/guides/**` SEO 페이지를 만든다.
4. 검색엔진 User-Agent에만 콘텐츠를 보여주는 방식은 사용하지 않는다.

### P0 — 상세 페이지 서버 렌더링

1. `page.tsx`를 Server Component로 유지한다.
2. 인터랙션이 필요한 부분만 별도 Client Component로 분리한다.
3. 서버에서 상세 데이터를 조회한다.
4. `generateMetadata`로 페이지별 metadata를 생성한다.
5. 데이터가 없으면 `notFound()`로 실제 404를 반환한다.

권장 상세 metadata 구성:

- 고유 title
- 실제 데이터 기반 description
- canonical
- Open Graph title/description/url/image
- Twitter card/image
- index/follow 정책

### P1 — 크롤링 및 색인 제어

1. `src/app/robots.ts`를 추가한다.
2. `src/app/sitemap.ts`를 추가한다.
3. sitemap에는 공개·정상 응답하는 canonical URL만 포함한다.
4. 로그인·설정·작성 화면에는 `noindex, nofollow`를 적용한다.
5. Google Search Console과 네이버 서치어드바이저에 sitemap을 제출한다.

### P1 — 전역 metadata 보강

`src/app/layout.tsx`에 다음을 보강한다.

- 운영 도메인 기반 `metadataBase`
- `applicationName`
- `openGraph.siteName`
- 기본 `openGraph.url`
- 기본 OG 이미지
- Twitter 카드 설정
- 사이트 소유권 인증값

### P1 — 구조화 데이터 적용

1. 랜딩 페이지에 `Organization`과 `WebSite`를 추가한다.
2. 명소 상세에 `Place` 또는 `TouristAttraction`을 추가한다.
3. 축제 상세에 `Event`를 추가한다.
4. 상세 페이지에 `BreadcrumbList`를 추가한다.
5. Google Rich Results Test와 Schema Markup Validator로 검증한다.

### P1 — 공개 랜딩 페이지 개선

스플래시는 앱 내부 진입 화면으로 유지하더라도 웹 루트에는 다음 콘텐츠가 필요하다.

- Peakda가 제공하는 가치에 대한 설명
- 현재 절정인 명소
- 다음 주 추천 명소
- 진행 중인 축제
- 계절 및 식물별 탐색 링크
- 서비스의 데이터 출처와 업데이트 방식

### P2 — 운영 검증

- Google Search Console URL 검사
- 네이버 서치어드바이저 수집·색인 검사
- 모바일 Lighthouse 및 Core Web Vitals
- SNS 공유 디버거로 OG 카드 확인
- 실제 운영 도메인의 HTTP/HTTPS 및 canonical 통일 확인
- sitemap의 `lastModified` 정확성 확인

## 6. 구현 완료 기준

- [ ] 비로그인 상태에서 공개 상세 URL이 `200 OK`와 실제 본문을 반환한다.
- [ ] 존재하지 않는 상세 ID가 실제 `404`를 반환한다.
- [ ] 각 공개 상세 페이지의 title과 description이 고유하다.
- [ ] 각 공개 상세 페이지에 절대 canonical URL이 있다.
- [ ] 각 공개 상세 페이지에 대표 OG 이미지가 있다.
- [ ] `/robots.txt`가 `200 OK`를 반환한다.
- [ ] `/sitemap.xml`이 `200 OK`를 반환하고 공개 URL만 포함한다.
- [ ] 앱 전용 경로에 `noindex`가 설정된다.
- [ ] 명소·축제 JSON-LD가 실제 화면 내용과 일치한다.
- [ ] 홈에서 공개 상세 페이지까지 일반 `<a>` 링크로 탐색할 수 있다.
- [ ] 개화 상태에 업데이트 시각과 출처가 표시된다.
- [ ] Search Console과 네이버 서치어드바이저에서 sitemap 오류가 없다.

## 7. 참고 문서

- [Google 생성형 AI 검색 최적화 가이드](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
- [Google JavaScript SEO 기본 가이드](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Google Sitemap 작성 및 제출 가이드](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google URL Canonicalization 가이드](https://developers.google.com/search/docs/crawling-indexing/canonicalization)
- [Google 구조화 데이터 일반 지침](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
- [Google Event 구조화 데이터 문서](https://developers.google.com/search/docs/appearance/structured-data/event)
- [Next.js generateMetadata 문서](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Next.js robots.txt 문서](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots)
- [Next.js Metadata 및 OG 이미지 문서](https://nextjs.org/docs/app/getting-started/metadata-and-og-images)

## 8. 점검 범위 제한

이번 점검에는 운영 도메인이 제공되지 않아 다음 항목은 포함하지 않았다.

- 실제 Google·네이버 색인 현황
- Search Console 및 네이버 서치어드바이저 데이터
- 운영 환경 Core Web Vitals
- 운영 CDN·캐시·리디렉션 상태
- 외부 백링크와 브랜드 검색량

운영 URL이 확보되면 위 항목을 추가로 검증해야 한다.

---

## 9. 진행 현황과 남은 일

- 최종 갱신: 2026-09-16
- 대표 도메인(canonical): `https://www.peakda.com`
- DNS: AWS Route 53 (`peakda.com` 호스팅 영역, 백엔드 AWS 계정). `www` 는 Vercel CNAME

### 9.1 완료

| 항목 | 위치 | 운영 반영 |
|---|---|---|
| api-dev swagger 기준 API 재생성 | 커밋 `5ac49c5` | ❌ 미배포 (`fix/profileSelect`) |
| 비로그인 둘러보기 허용 — 첫 진입 스플래시 → 온보딩 → `/map`, 로그인 강제 제거 | 커밋 `7691b04` | ❌ 미배포 |
| 로그인이 필요한 곳은 로그인 페이지 대신 바텀시트 (링크는 `LoginGuard` 가 전역으로 가로챔, 직접 접근은 `/map?login=1`) | 커밋 `7691b04`, `1e39b2a` | ❌ 미배포 |
| 네이버 서치어드바이저 인증 meta 태그 (`src/app/layout.tsx` `verification`) — 이 커밋만 먼저 배포 가능 | 커밋 `d189c9a` | ❌ 미배포 |
| Phase 3 SEO — 전역 metadata·기본 OG 이미지, robots, sitemap, noindex 헤더 | 커밋 `83f2a92` | ❌ 미배포 |
| Phase 3 SEO — 스팟 상세 서버 렌더링(metadata·404·JSON-LD·예측 기준일 표시) | 커밋 `42848ee` | ❌ 미배포 |
| Phase 3 SEO — 피드 상세 metadata·404 | 커밋 `c2ff423` | ❌ 미배포 |

> 비로그인 공개 경로: `/`, `/map`, `/explore`, `/feed`, `/feed/[id]`, `/search`, `/spot/[id]`, `/spot/[id]/feed`, `/festivals/[id]`, `/creators/[id]`, `/my`(비로그인용 빈 화면, noindex)
> 로그인 필요(바텀시트): `/my/settings`, `/my/records`, `/my/saved`, `/record`, `/notification`, `/profile/edit`, `/followers`, `/following`, `/users` — 목록은 `src/lib/auth/session.ts` `PROTECTED_PATHS`

### 9.2 외부 답변 대기 — 답이 오면 할 일

#### A. [백엔드] Route 53 TXT 레코드 추가 — 2026-09-14 요청, 2026-09-16 새 값으로 재요청 예정

- 2026-09-15: 첫 값(`E1TcUP-...`)은 반영됐지만 Search Console 에서 새 값을 받아 다시 요청한다.

요청 내용: `peakda.com` 루트 TXT 레코드를 **편집해** 아래 줄을 추가 (Route 53 은 같은 이름의 TXT 레코드를 둘 만들 수 없다). 예전 값은 새 값으로 확인이 끝나면 지워도 된다.

```
"google-site-verification=cPND8sbP0ERYniDG0s9MXLQgWe6lwMocT5NsY-KKo9Y"
```

답변 오면:
- [ ] 반영 확인 — 아래 결과의 `Answer` 에 `google-site-verification=cPND8...` 가 보이는지
  ```
  curl -s "https://dns.google/resolve?name=peakda.com&type=TXT"
  ```
- [ ] Google Search Console → 도메인 속성 `peakda.com` → **확인** 클릭
- [ ] 백엔드에 "이 TXT 레코드는 지우면 소유권이 해제되니 유지" 전달

#### B. [백엔드] 축제·큐레이션 상세 API 비로그인 허용 — dev 반영 확인 (2026-09-16), 운영 미확인

요청은 `BACKEND_SEO_REQUESTS.md` 1번. 2026-09-16 dev 에 쿠키 없이 호출해 보니 이미 열려 있다 — `GET /api/festivals/1` `200`, `GET /api/curations` `200`, `GET /api/curations/1` `404 CURATION_NOT_FOUND`(dev 에 발행 큐레이션이 0건이라 실데이터 `200` 은 못 봤고, `401` 이 아니므로 인증은 통과한 것으로 판단).
단 **dev 스웨거에는 `security` 표기가 그대로 남아 있어** `pnpm generate:api` 로는 바뀐 걸 알 수 없다.

- [ ] 백엔드에 확인: 의도된 공개인지, 운영(`api.peakda.com`) 반영 여부, 스웨거 `security` 표기 정리
- [x] 2026-09-16 `src/lib/auth/session.ts` `PROTECTED_PATHS` 에서 `/festivals`, `/creators` 제거 — 운영 백엔드가 아직 막혀 있으면 비로그인 상세가 빈 화면이 되므로 **배포 전 위 확인 필요**
- [ ] 축제 상세 서버 렌더링 + `generateMetadata` + `notFound()` + `Event` JSON-LD
- [ ] 큐레이션 상세 서버 렌더링 + `generateMetadata`
- [ ] sitemap 에 축제·큐레이션 URL 추가

#### C. [디자이너] 로그인 바텀시트 시안

- [ ] 시안 오면 `src/components/auth/LoginSheet.tsx` 내용만 교체 (여는 로직은 `LoginGuard.tsx`, `useRequireLogin` 이라 건드리지 않음)

#### D. [팀 결정] 스팟 상세 서버 렌더링 시 찜 하트 깜빡임

서버 요청에는 사용자 쿠키가 없어 비로그인 기준(찜 false)으로 먼저 그려지고, 로그인 사용자는 클라이언트 재조회 후 켜진다.

- [x] 2026-09-14 일단 그대로 두기로 함 (가장 단순). 거슬리면 `SpotDetailClient.tsx` 에서 재조회 전까지 찜·알림 버튼만 로딩 표시로 바꾼다

#### E. [백엔드] 기록 사진 영구 공개 URL — ⚠️ 아직 요청 안 함

피드 상세 공유 카드(og:image)에 기록 사진을 쓰고 싶지만 `photos[].url` 이 만료되는 presigned URL 이라, SNS·검색 크롤러가 나중에 다시 가져가면 깨진다. 지금은 기본 카드(`/opengraph-image`)를 쓴다. 동네(LOCAL) 스팟 대표 사진도 같은 이유로 공유 카드·JSON-LD 에서 뺐다.

- [ ] `BACKEND_API_REQUESTS.md` 에 "기록 사진·스팟 대표 사진의 만료 없는 공개 URL(또는 CDN 경로) 필드" 요청 추가 후 전달

답변 오면:
- [ ] `src/app/feed/[id]/page.tsx` openGraph.images 를 첫 사진으로 교체
- [ ] `src/lib/utils/spotSeo.ts` `toSpotShareImage` 의 LOCAL 제외 조건 제거

### 9.3 프론트 할 일 (순서대로)

#### 1) 네이버 인증 태그 배포 → 소유 확인

- [x] `src/app/layout.tsx` 인증 태그 커밋 (`d189c9a`)
- [ ] 운영(Production) 배포
- [ ] `https://www.peakda.com` 페이지 소스에 `naver-site-verification` 확인
- [ ] 네이버 서치어드바이저 → 웹마스터 도구 → `https://www.peakda.com` → **소유 확인** 클릭
#### 2) 비로그인 모드 운영 반영

배포 전 브라우저 확인 (아직 **curl 로 리다이렉트만 확인**, 화면 동작은 미확인):

- [ ] 비로그인 첫 방문: `/` → 온보딩 → `/map`, 재방문: `/` → `/map`
- [ ] 스팟 상세 찜·알림·방문 기록 남기기 → 바텀시트
- [ ] 피드 반응·신고, 관심 식물·팔로잉 탭 → 바텀시트
- [ ] 하단 탭 `+`·`My`, 작성자 프로필 링크 → 이동 없이 바텀시트
- [ ] 탐색 축제·큐레이션 카드 → 바텀시트 없이 상세 화면으로 이동
- [ ] 하단 탭 `My` → 비로그인용 마이 화면 ("로그인하고 시작해보세요"), 알림·설정·편집·전체·기록하기·팔로워 → 바텀시트
- [ ] 주소창에 `/my/settings` 직접 입력 → `/map` + 바텀시트 (새로고침 시 다시 안 뜸)
- [ ] 시트에서 구글·카카오·네이버 로그인 → 원래 가려던 화면으로 복귀
- [ ] Android 앱: Custom Tab 로그인 후 시트 닫힘 / 실패 시 토스트 + 시트
- [ ] 로그인 사용자 세션 만료 → 현재 화면 위에 바텀시트
- [ ] 로그아웃·탈퇴 후 `/map`
- [ ] PR 생성 → `main` 머지 → 운영 배포

#### 3) Phase 3 — SEO/GEO 구현 (2026-09-14 구현, 커밋 `83f2a92`·`42848ee`·`c2ff423`)

- [x] `src/app/layout.tsx`: `metadataBase`, `applicationName`, `openGraph.siteName`, Twitter 카드. 공통값은 `src/constants/site.ts`
- [x] 기본 OG 이미지 `src/app/opengraph-image.tsx` (next/og + 로고. 기본 폰트에 한글이 없어 문구는 영문)
- [x] `src/app/robots.ts` — 로그인 필요 경로·`/auth/` disallow + sitemap 위치
- [x] `src/app/sitemap.ts` — 고정 4개 + 스팟 상세 (api-dev 기준 313개), 하루 단위 revalidate, 조회 실패 시 고정 페이지만
- [x] `next.config.ts` `headers()` — `/login`, `/onboarding`, `/search`, `/profile`, `/auth/*` 에 `X-Robots-Tag: noindex`
- [x] 스팟 상세 서버 렌더링: `page.tsx` 서버 + `_components/SpotDetailClient.tsx`, `generateMetadata`, `notFound()`, `TouristAttraction`/`Place` + `BreadcrumbList` JSON-LD
- [x] 피드 상세: `page.tsx` 서버 + `_components/FeedDetailClient.tsx`, `generateMetadata` + `notFound()` (OG 이미지는 기본 카드 — 9.2-E)
- [x] 개화 정보 최신성: 응답의 `bloom.baseDate` 로 "M.D 기준 개화 예측이에요" 화면 표시 + 설명문에 포함 (백엔드 요청 불필요)
- [x] `/`·`/map` canonical, `/` 제목이 "Peakda | Peakda | …" 로 중복되던 것 수정
- [x] 로컬 빌드(api-dev) 후 curl 검증: `/spot/166`·`/feed/7` 200 + 제목·설명·canonical·og:image·JSON-LD / 없는 id·`/spot/abc` 404 / `/robots.txt`·`/sitemap.xml`(317 URL)·`/opengraph-image` 200 / 앱 전용 화면 noindex 헤더
- [x] 커밋
- [ ] 브라우저에서 스팟 상세·피드 상세 화면 확인(서버 렌더링 전환 후 찜·반응·기록 남기기, 로그인 사용자 찜 상태 반영) → 배포
- [ ] 배포 후 Rich Results Test / Schema Markup Validator 로 스팟 상세 JSON-LD 검증
- [x] 2026-09-15 `/explore`, `/explore/spots`, `/explore/festivals`, `/feed` 목록 — 각 `layout.tsx` 로 제목·설명·canonical (`/explore/spots` 는 `?section` 마다 목록이 달라 canonical 비움)
- [x] 2026-09-15 홈 `Organization`(+인스타 `sameAs`)·`WebSite` JSON-LD (`src/app/page.tsx`)
- [ ] 목록 페이지 og:title 은 여전히 전역 기본값 (`/map` 과 같은 방식)

#### 4) Phase 4 — 문서

- [ ] `BACKEND_API_REQUESTS.md` — 9.2-B 요청
- [ ] `MEMORY.md` — 비로그인 모드 결정, 401 시 마커 없으면 리다이렉트 안 하는 이유, `LoginGuard` 전역 링크 가로채기, 막힌 경로와 이유
- [ ] 이 문서 6장 체크리스트 갱신

#### 5) Phase 3 배포 후 — 검색엔진 제출

- [ ] Search Console → 색인 생성 → Sitemaps → `https://www.peakda.com/sitemap.xml` 제출
- [ ] 네이버 서치어드바이저 → 요청 → 사이트맵 제출 (같은 주소)
- [ ] 네이버 → 검증 → robots.txt / 웹 페이지 최적화 확인
- [ ] 대표 페이지(`/explore`, 스팟 상세 몇 개) URL 검사 → 실제 URL 테스트로 로그인 화면이 아닌지 확인 → 색인 생성 요청 / 네이버 웹 페이지 수집 요청
- [ ] 1~2주 뒤 Search Console 페이지 색인 보고서, 네이버 수집 현황 오류 확인

#### 6) 도메인 정리

- [ ] 루트 도메인 `peakda.com` 연결 시 Vercel 에서 `peakda.com` → `www.peakda.com` 영구 리다이렉트(308) — 주소가 둘로 갈려 색인되지 않도록
