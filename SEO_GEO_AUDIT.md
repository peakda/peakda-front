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

- 최종 갱신: 2026-09-22 (운영 도메인 curl 재점검 — 9.1 배포 표시 갱신)
- 대표 도메인(canonical): `https://www.peakda.com` — 루트 `peakda.com` 은 `308` 으로 www 리다이렉트
- DNS: AWS Route 53 (`peakda.com` 호스팅 영역, 백엔드 AWS 계정). `www` 는 Vercel CNAME

### 9.1 완료

| 항목 | 위치 | 운영 반영 |
|---|---|---|
| api-dev swagger 기준 API 재생성 | 커밋 `5ac49c5` | ✅ |
| 비로그인 둘러보기 허용 — 첫 진입 스플래시 → 온보딩 → `/map`, 로그인 강제 제거 | 커밋 `7691b04` | ✅ |
| 로그인이 필요한 곳은 로그인 페이지 대신 바텀시트 (링크는 `LoginGuard` 가 전역으로 가로챔, 직접 접근은 `/map?login=1`) | 커밋 `7691b04`, `1e39b2a` | ✅ |
| 비로그인 마이 페이지 진입 허용 + 게스트 화면 | 커밋 `9f9f979` | ✅ |
| 네이버 서치어드바이저 인증 meta 태그 (`src/app/layout.tsx` `verification`) | 커밋 `d189c9a` | ✅ |
| Phase 3 SEO — 전역 metadata·기본 OG 이미지, robots, sitemap, noindex 헤더 | 커밋 `83f2a92` | ✅ |
| Phase 3 SEO — 스팟 상세 서버 렌더링(metadata·404·JSON-LD·예측 기준일 표시) | 커밋 `42848ee` | ✅ |
| Phase 3 SEO — 피드 상세 metadata·404 | 커밋 `c2ff423` | ✅ |
| 탐색·피드 목록 metadata, 홈 `Organization`·`WebSite` JSON-LD | 커밋 `d60f57f` | ✅ |
| Google Search Console 도메인 속성 `peakda.com` 소유 확인 (Route 53 TXT) | — | ✅ |
| 축제·큐레이션 상세 비로그인 접근 허용 (`PROTECTED_PATHS` 에서 `/festivals`, `/creators` 제거) | 커밋 `b0548c3` | ✅ |
| sitemap 에서 동네(LOCAL) 스팟 제외 (`src/app/sitemap.ts`) | 커밋 `aacfc17` | ✅ |
| 홈 `Organization.sameAs` 에 유튜브 채널 추가 (`src/app/page.tsx`) | 커밋 `56c9779` | ✅ |
| 사이트 설명(`SITE_DESCRIPTION`) 교체, 제목에서 브랜드를 뒤로 (`layout.tsx` 템플릿) | 커밋 `56c9779` | ✅ |
| `public/` 내부 문서 정리 — 약관 프롬프트 → `src/app/Terms/_prompts/`, `public/CLAUDE.md` 제거 | 커밋 `695b9ba` | ✅ |

> 2026-09-16 운영 확인 (curl): `/robots.txt`·`/sitemap.xml` 200 (URL 341개) / `/spot/527` 등 200 + 제목·설명·canonical·JSON-LD / `/my/settings` → `307 /map?login=1` / `/search` `X-Robots-Tag: noindex` / 페이지 소스에 `naver-site-verification` 있음.
>
> 2026-09-22 재확인 (curl): `b0548c3`·`aacfc17`·`56c9779`·`695b9ba` 모두 `origin/main` 포함 / `/sitemap.xml` URL 350개 / 홈 설명문·`sameAs` 유튜브 운영 반영 / `/festivals/1`·`/creators/1` `200`(리다이렉트 없음) / `/CLAUDE.md`·`/terms-prompt.md` `404`. `main` 반영 여부는 `git merge-base --is-ancestor <커밋> origin/main` 으로 확인.
>
> 비로그인 공개 경로: `/`, `/map`, `/explore`, `/feed`, `/feed/[id]`, `/search`, `/spot/[id]`, `/spot/[id]/feed`, `/my`(비로그인용 빈 화면, noindex). `/festivals/[id]`, `/creators/[id]` (`b0548c3`)
> 로그인 필요(바텀시트): `/my/settings`, `/my/records`, `/my/saved`, `/record`, `/notification`, `/profile/edit`, `/followers`, `/following`, `/users` — 목록은 `src/lib/auth/session.ts` `PROTECTED_PATHS`

### 9.2 외부 답변 대기 — 답이 오면 할 일

#### A. [백엔드] Route 53 TXT 레코드 — ✅ 반영 완료 (2026-09-16)

- 현재 값: `google-site-verification=cPND8sbP0ERYniDG0s9MXLQgWe6lwMocT5NsY-KKo9Y` (예전 값 `E1TcUP-...` 은 조회 결과에 없음)
- [x] 반영 확인 — `curl -s "https://dns.google/resolve?name=peakda.com&type=TXT"`
- [x] Google Search Console 도메인 속성 `peakda.com` 확인
- [ ] 백엔드에 "이 TXT 레코드는 지우면 소유권이 해제되니 유지" 전달

#### B. [백엔드] 축제·큐레이션 상세 API 비로그인 허용 — 운영 반영 확인 (2026-09-16)

요청은 `BACKEND_SEO_REQUESTS.md` 1번. 쿠키 없이 호출해 확인:

- dev: `GET /api/festivals/1` `200`, `GET /api/curations` `200`, `GET /api/curations/1` `404 CURATION_NOT_FOUND`(발행 0건)
- 운영(`api.peakda.com`): `GET /api/festivals/1` `200`, `GET /api/curations` `200`, `GET /api/curations/1` `200`

단 **dev 스웨거에는 `security` 표기가 그대로 남아 있어** `pnpm generate:api` 로는 바뀐 걸 알 수 없다.

- [ ] 백엔드에 확인: 의도된 공개인지, 스웨거 `security` 표기 정리
- [x] 2026-09-16 `PROTECTED_PATHS` 에서 `/festivals`, `/creators` 제거 (커밋 `b0548c3`) — 운영 API 가 열려 있으니 배포 가능
- [ ] 축제·큐레이션 상세 서버 렌더링 + sitemap 추가 — 작업 내용은 9.3-8

#### C. [디자이너] 로그인 바텀시트 시안

- 커밋 `d359822` "로그인 바텀시트 디자인 변경 및 기능별 안내 문구 적용" 이 운영에 반영됨 — 시안 최종본인지 확인 후 체크
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

#### F. [백엔드] 개화 카테고리 오분류 — ⚠️ 아직 요청 안 함 (2026-09-16 발견)

운영 `GET /api/seasonal/blooms`(한반도 전체) 기준 단풍 핀 50개 중 대구 도심 POI 30여 곳이 단풍 명소로 잡혀 있다 — 예: `미진분식`(5488), `월성찜갈비`(8506), `동대구시장`(5526), `카페멜트`(9025), `호텔 라온제나`(5230). 이 스팟들이 "미진분식 단풍 개화 시기" 같은 페이지로 sitemap 에 들어가 저품질 페이지로 보일 수 있다. 억새(209개)도 같은 문제인지는 미확인.

- [ ] `BACKEND_SEO_REQUESTS.md` 에 추가 후 전달 — 카테고리 매칭 기준 확인 및 오분류 정리
- [ ] 정리 전까지 해당 스팟은 URL 검사 색인 요청에서 제외
- [x] 2026-09-23 규모 재확인 — 대구만이 아니라 **전국**. sitemap 대상 346곳 중 억새만 달린 208곳 대부분이 광주·강진의 호텔·식당·상점(올리브영 12곳, 아울렛, 모텔 등)이고, 다른 꽃에도 음식점·시장이 섞여 있다(대구 단풍 등)
- [x] 2026-09-23 임시 조치: sitemap 에서 억새만 달린 명소 + 음식점·숙박·시장 이름 제외 (`src/lib/utils/spotSeo.ts` `isSitemapSpotPin`). 스팟 URL 346 → 116. 정상 억새 명소(`광주서창억새축제`, `신선대와 억새평전` 등 소수)도 함께 빠지는 대가가 있다. 도서관·체육관 등은 아직 남아 있음. 백엔드 정리 후 이 기준을 되돌릴 것

### 9.3 프론트 할 일 (순서대로)

#### 1) 네이버 인증 태그 배포 → 소유 확인

- [x] `src/app/layout.tsx` 인증 태그 커밋 (`d189c9a`)
- [x] 운영(Production) 배포
- [x] 2026-09-16 `https://www.peakda.com` 페이지 소스에 `naver-site-verification` 확인
- [ ] 네이버 서치어드바이저 → 웹마스터 도구 → `https://www.peakda.com` → **소유 확인** 클릭 (소유 확인 전에는 `요청 > 사이트맵 제출` 메뉴가 보이지 않는다)

#### 2) 비로그인 모드 운영 반영

- [x] PR 생성 → `main` 머지 → 운영 배포
- [x] `b0548c3`(축제·큐레이션 상세 공개) 배포 — 2026-09-22 운영 `/festivals/1` `200` 확인

운영 브라우저 확인 (배포 전 확인 기록 없음 — curl 로 리다이렉트만 확인):

- [ ] 비로그인 첫 방문: `/` → 온보딩 → `/map`, 재방문: `/` → `/map`
- [ ] 스팟 상세 찜·알림·방문 기록 남기기 → 바텀시트
- [ ] 피드 반응·신고, 관심 식물·팔로잉 탭 → 바텀시트
- [ ] 하단 탭 `+`·`My`, 작성자 프로필 링크 → 이동 없이 바텀시트
- [ ] 탐색 축제·큐레이션 카드 → 바텀시트 없이 상세 화면으로 이동 (`b0548c3` 배포 후)
- [ ] 하단 탭 `My` → 비로그인용 마이 화면 ("로그인하고 시작해보세요"), 알림·설정·편집·전체·기록하기·팔로워 → 바텀시트
- [ ] 주소창에 `/my/settings` 직접 입력 → `/map` + 바텀시트 (새로고침 시 다시 안 뜸)
- [ ] 시트에서 구글·카카오·네이버 로그인 → 원래 가려던 화면으로 복귀
- [ ] Android 앱: Custom Tab 로그인 후 시트 닫힘 / 실패 시 토스트 + 시트
- [ ] 로그인 사용자 세션 만료 → 현재 화면 위에 바텀시트
- [ ] 로그아웃·탈퇴 후 `/map`

#### 3) Phase 3 — SEO/GEO 구현 (2026-09-14 구현, 커밋 `83f2a92`·`42848ee`·`c2ff423`)

- [x] `src/app/layout.tsx`: `metadataBase`, `applicationName`, `openGraph.siteName`, Twitter 카드. 공통값은 `src/constants/site.ts`
- [x] 기본 OG 이미지 `src/app/opengraph-image.tsx` (next/og + 로고. 기본 폰트에 한글이 없어 문구는 영문)
- [x] `src/app/robots.ts` — 로그인 필요 경로·`/auth/` disallow + sitemap 위치
- [x] `src/app/sitemap.ts` — 고정 4개 + 스팟 상세, 하루 단위 revalidate, 조회 실패 시 고정 페이지만
- [x] `next.config.ts` `headers()` — `/login`, `/onboarding`, `/search`, `/profile`, `/auth/*` 에 `X-Robots-Tag: noindex`
- [x] 스팟 상세 서버 렌더링: `page.tsx` 서버 + `_components/SpotDetailClient.tsx`, `generateMetadata`, `notFound()`, `TouristAttraction`/`Place` + `BreadcrumbList` JSON-LD
- [x] 피드 상세: `page.tsx` 서버 + `_components/FeedDetailClient.tsx`, `generateMetadata` + `notFound()` (OG 이미지는 기본 카드 — 9.2-E)
- [x] 개화 정보 최신성: 응답의 `bloom.baseDate` 로 "M.D 기준 개화 예측이에요" 화면 표시 + 설명문에 포함 (백엔드 요청 불필요)
- [x] `/`·`/map` canonical, `/` 제목이 "Peakda | Peakda | …" 로 중복되던 것 수정
- [x] 로컬 빌드(api-dev) 후 curl 검증
- [x] 운영 배포
- [ ] 운영에서 스팟 상세·피드 상세 브라우저 확인 (찜·반응·기록 남기기, 로그인 사용자 찜 상태 반영)
- [ ] Rich Results Test / Schema Markup Validator 로 스팟 상세(`/spot/527`)·홈 JSON-LD 검증
- [x] 2026-09-15 `/explore`, `/explore/spots`, `/explore/festivals`, `/feed` 목록 — 각 `layout.tsx` 로 제목·설명·canonical (`/explore/spots` 는 `?section` 마다 목록이 달라 canonical 비움)
- [x] 2026-09-15 홈 `Organization`(+인스타 `sameAs`)·`WebSite` JSON-LD (`src/app/page.tsx`)
- [x] 2026-09-16 홈 `Organization.sameAs` 에 유튜브 `https://www.youtube.com/@peakda` 추가 (`56c9779`)
- [x] 2026-09-16 sitemap 에서 동네(LOCAL) 스팟 제외 — 사용자가 기록으로 만든 지점(`하늘채아파트 정문` 등)이라 검색 노출 대상이 아니다. 운영 API 기준 스팟 URL 338 → 332 (`aacfc17`)
- [ ] 목록 페이지 og:title 은 여전히 전역 기본값 (`/map` 과 같은 방식)

#### 4) Phase 4 — 문서

- [ ] `BACKEND_API_REQUESTS.md` — 9.2-B 요청
- [ ] `MEMORY.md` — 비로그인 모드 결정, 401 시 마커 없으면 리다이렉트 안 하는 이유, `LoginGuard` 전역 링크 가로채기, 막힌 경로와 이유
- [ ] 이 문서 6장 체크리스트 갱신

#### 5) 검색엔진 제출

- [ ] Search Console → 색인 생성 → Sitemaps → `https://www.peakda.com/sitemap.xml` 제출 → 상태 "성공" 확인
- [x] 2026-09-16 Search Console URL 검사 색인 요청: `/`, `/explore`, `/feed`, `/map`
- [ ] 스팟 상세 색인 요청 (하루 10개 내외 한도. 2026-09-16 운영에서 200·제목·설명·JSON-LD 확인한 URL)
  - 제철: `/spot/988` 느러지전망관람대(코스모스 절정), `/spot/1654` 무안 전통생활문화 테마파크(코스모스 절정), `/spot/6151` 황매산(산청)(억새), `/spot/3212` 월출산 국화축제
  - 대표 명소: `/spot/527` 광양 매화마을, `/spot/4433` 홍쌍리 청매실농원, `/spot/618` 구례 섬진강 벚꽃길, `/spot/11` 서동공원과 궁남지, `/spot/8486` 삼척 맹방유채꽃 마을, `/spot/5727` 서산 해미읍성, `/spot/1888` 보배섬 유채꽃 축제, `/spot/352` 강진수국길축제
- [ ] 네이버 서치어드바이저 → 소유 확인 → 요청 → 사이트맵 제출 (`sitemap.xml`)
- [ ] 네이버 → 요청 → 웹 페이지 수집 (위 URL)
- [ ] 네이버 → 검증 → robots.txt / 웹 페이지 최적화 확인
- [ ] 1~2주 뒤 Search Console 페이지 색인 보고서("크롤링됨 - 현재 색인이 생성되지 않음" 비율), 네이버 수집 현황 오류 확인

#### 6) 도메인 정리

- [x] 루트 도메인 `peakda.com` → `www.peakda.com` 영구 리다이렉트(308) — 2026-09-16 확인

#### 7) 운영 점검에서 추가로 발견한 것 (2026-09-16)

- [x] `public/` 내부 문서가 운영에서 공개됨 (`https://www.peakda.com/CLAUDE.md`, `/terms-prompt.md` 등 `200`) — 약관 프롬프트 4개는 `src/app/Terms/_prompts/` 로 옮기고 `public/CLAUDE.md` 는 제거 (이유는 `MEMORY.md`, `695b9ba`)
- [ ] 배포 후 위 URL 이 `404` 인지 확인 → 이미 색인됐으면 Search Console 삭제 요청
- [x] `SITE_DESCRIPTION` 교체 — "계절 명소의 타이밍을 한눈에. 벚꽃·유채꽃·철쭉·수국·단풍·억새까지, 지금 이 순간 가장 예쁜 곳을 Peakda에서 확인하세요." ("20여 개 계절 명소"는 실제 데이터(운영 스팟 332곳)와 달라 뺐다, `56c9779`)
- [x] 제목 순서를 `'%s | Peakda'` 로 변경 — 루트 템플릿, 스팟·피드 상세 og:title, `/explore/spots`·`/explore/festivals` 절대 제목. 홈만 `Peakda | 계절 여행 타이밍` 유지 (`56c9779`)
- [ ] 동네(LOCAL) 스팟 상세 색인 — **보류**. 색인된 게 보이면 그때 `generateMetadata` 에서 `robots: { index: false }` 를 붙이거나 Search Console 삭제 요청
- [ ] 홈 `/` 개선 — 결정 대기 (9)
- [ ] 내부 링크 — 결정 대기 (10)
- [ ] `llms.txt` — 후순위 (3.1). AI 검색이 사이트 요약을 읽어가라고 루트에 두는 마크다운 파일 제안 규격이다. 구글은 쓰지 않는다고 밝혔고 효과가 확인되지 않았다

#### 8) 축제·큐레이션 상세 서버 렌더링 (9.2-B 후속)

선행: `b0548c3` 배포. 운영 API 는 쿠키 없이 `GET /api/festivals/{id}`·`/api/curations/{id}`·`/api/explore/festivals`·`/api/curations` 모두 `200` (2026-09-16).

- [x] 2026-09-22 `/festivals/[id]` — 서버 조회·metadata·canonical·404·og:image(에디토리얼 대표 이미지, CDN 영구 URL) 적용. **JSON-LD(`Event`·`BreadcrumbList`)는 아직** — 스팟 상세(`src/app/spot/[id]/page.tsx`)와 같은 구조로 나눈다
  - `page.tsx` 서버: `cache` 로 묶은 조회 + `generateMetadata` + 없는 id 는 `notFound()`
  - 지금의 `'use client'` 본문은 `_components/FestivalDetailClient.tsx` 로 이동
  - 제목: `{축제명} 일정·장소` (템플릿으로 `… | Peakda`), 설명: 기간·장소·진행 상태
  - canonical `/festivals/{id}`. og:image 는 대표 이미지 URL 이 만료되지 않는지 확인 후 사용, 아니면 기본 카드 (9.2-E 와 같은 문제)
  - JSON-LD: `Event`(name, startDate, endDate, eventStatus, location = `Place`(name, address, geo), url) + `BreadcrumbList`(Peakda > 탐색 > 축제명)
- [x] 2026-09-22 `/creators/[id]` (큐레이션) — 같은 구조로 적용 (JSON-LD 없음). 제목은 큐레이션 제목, 설명은 부제·주차 라벨
- [ ] `src/app/sitemap.ts` 에 추가 — 축제 id 는 `GET /api/explore/festivals`, 큐레이션 id 는 `GET /api/curations`. 목록 하나가 실패해도 나머지는 낸다 (스팟과 같은 방식)
- [ ] 검증: 없는 id `404`, 로컬 빌드 후 curl 로 제목·설명·canonical·JSON-LD, Rich Results Test (Event 리치 결과는 한국에서 보장되지 않음 — 3.2)

#### 9) 홈 `/` 개선 — 결정 대기

현황: 서버 HTML 은 스플래시 문구(약 40자)뿐이고 2초 뒤 JS 로 `/onboarding`(첫 방문, noindex) 또는 `/map` 으로 이동한다. 크롤러는 localStorage 가 없어 매번 첫 방문이라, 구글 렌더링 결과가 온보딩 화면으로 보일 수 있다 (추측 — URL 검사 "실제 URL 테스트" 스크린샷으로 확인).

- **A안 (추천) `/about` 서비스 소개 페이지 신설** — 서버 컴포넌트로 소개문(앱 소개 문구), 데이터 출처(한국관광공사 관광정보·기상청), 지금 절정인 명소 링크(`GET /api/explore`, 쿠키 없이 `200`), `/map`·`/explore` 링크. sitemap 에 추가하고 비로그인 마이 화면·온보딩 마지막 단계에서 링크. `/` 와 앱 흐름은 그대로
- B안 웹으로 `/` 에 들어오면 랜딩, 앱(Capacitor)은 기존 스플래시 — 앱/웹 판별이 클라이언트에서만 돼 화면 깜빡임과 분기 관리 부담이 있다
- 하지 말 것: 스플래시에 사용자에게 안 보이는 소개문 숨기기, 봇 User-Agent 에만 리다이렉트를 끄기 (클로킹)

#### 10) 내부 링크 — 결정 대기

현황: 스팟 상세 서버 HTML 에 다른 페이지로 가는 `<a>` 가 0개, `/explore` 는 카드가 클라이언트 조회라 첫 HTML 에 스팟 링크가 없다. 스팟 발견이 sitemap 에만 기대고 있다.

- **① (추천) 스팟 상세 하단 "근처 명소"** — `page.tsx` 에서 스팟 좌표 주변 bbox 로 `bloomMapApi` 를 조회해 자기 자신·LOCAL 을 뺀 최대 6곳을 `<Link href="/spot/{id}">` 로 서버 렌더링. 백엔드 요청 없음. 스팟끼리 연결되고 사용자에게는 여행 동선이 된다
- ② `/explore` 서버 렌더링 — `GET /api/explore` 가 쿠키 없이 `200` 이라 가능. 스팟 상세처럼 서버 조회 + 클라이언트 분리로 첫 HTML 에 절정·다음 주 카드 링크를 싣는다. 꽃 필터(Zustand)를 고르면 클라이언트에서 재조회
- ③ 꽃별 허브 페이지 (예: `/bloom/cherry` "벚꽃 명소 개화 시기") — 검색 키워드 가치는 가장 크지만 9.2-F 카테고리 오분류가 정리된 뒤에
