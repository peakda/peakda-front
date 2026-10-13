# Map · Explore · Feed 성능 분석

작성일: 2026-10-13. 대상: 현재 작업 디렉터리의 Next.js 15.5.15 / React 19 / TanStack Query 5 코드.

## 범위와 결론

소스 코드와 공식 문서를 확인하고 실제 `clusterSpots` 함수에 합성 데이터 벤치마크를 실행했다. 앱 소스는 수정하지 않았다. 운영 API 응답 크기, 실제 사용자 데이터 분포, 브라우저 LCP/INP, Android WebView 프레임·메모리는 이번에 측정하지 않았다. 아래 우선순위는 개선 후보의 조사·구현 순서이며, 운영 장애나 개선율을 확정하는 의미는 아니다.

현재 기본 최적화는 상당 부분 구현돼 있다. 가장 먼저 볼 곳은 **지도 프레임 작업 범위, 피드 링크 미리보기 요청, 탐색 외부 이미지**다. 긴 목록의 캐시·마운트 비용은 사용량이 커질 때 중요해진다.

## 이미 적용된 최적화

- 지도: 전국 데이터 재사용, 30분 staleTime / 60분 gcTime, Supercluster 인덱스 WeakMap 캐시, 줌별 결과 캐시, HTML WeakMap 캐시, 화면 주변 오버레이만 생성, 동일 오버레이 재사용, 드래그 중 생성 작업 분할.
- 탐색: 서버 초기 데이터와 5분 서버 캐시, 첫 절정 이미지 우선 로딩, 캐러셀의 보이지 않는 이미지 생성 지연, 드로어 첫 열기 시 로딩.
- 피드: 서버 첫 페이지와 1분 서버 캐시, 20건 페이지네이션, memo 카드와 안정적인 편집·삭제 콜백, content-visibility, 첫 이미지 우선 로딩, 단일 사진 Embla 생성 생략, 캐러셀 이미지 단계 로딩.
- 공통: React Query 캐시, 로그인 시 서버의 공개 데이터를 개인화 데이터로 갱신하는 처리, WebVitalsReporter.

따라서 memo·lazy loading·클러스터링을 처음 도입하는 작업은 필요하지 않다. 로그인 직후 개인화 재요청도 무조건 제거하면 찜·리액션 상태가 잘못 표시된다.

## 1. Map: 4ms 제한이 렌더 함수 전체를 제한하지 않는다 — 우선

근거: [useMapPins.ts](../src/hooks/useMapPins.ts), 특히 84, 89, 194, 225, 237, 246, 279행.

- 시간 측정은 클러스터 계산, 전체 클러스터 순회, HTML 준비, 기존 오버레이 제거가 끝난 뒤 시작한다.
- `budgetMs`는 새 오버레이 생성 루프에만 적용된다. 개별 생성 작업 하나가 오래 걸리는 것도 중단할 수 없다.
- 데이터 변경, 줌 디바운스, idle에서는 `render(map)`을 호출해 기본값 Infinity로 실행한다.
- 드래그 rAF마다 캐시된 전국 클러스터를 순회한다. 계산 캐시가 있어도 가시 영역 판정과 큐 생성은 반복된다.

영향: 핀 데이터가 많거나 필터·줌이 바뀌는 순간 작업이 몰릴 수 있다. 현재 끊김의 실측 원인으로 단정하지는 않는다.

제안: render 전체 구간을 계측하고, 초기 표시·줌·필터 변경·idle에도 취소 가능한 작업 큐를 적용한다. 화면 중심에 가까운 핀을 먼저 처리하고, 이전 조건의 큐는 세대 번호로 폐기한다. 제거도 밀집 화면에서 비용을 확인한다. 인덱스 생성처럼 분할하기 어려운 동기 작업이 실제로 오래 걸리면 Worker로 옮긴다. 단순히 타이머 위치만 옮기면 반복 준비 작업 때문에 진행이 멎을 수 있으므로 처리 위치를 보존해야 한다.

## 2. Map: 전국 결과의 구성원을 모두 펼치는 비용 — 데이터 증가 시 우선

근거: [mapCluster.ts](../src/lib/utils/mapCluster.ts) 112~146행, [MapContainer.tsx](../src/components/Map/MapContainer.tsx) 141행 이후.

`getClusters`를 전 세계 bbox로 호출하고, 모든 클러스터에 `getLeaves(..., Infinity)`를 실행한다. 결과적으로 화면에 안 보이는 그룹의 구성원 배열도 만든다. 인덱스는 재사용하지만 새 줌의 결과나 새 필터 배열을 처리할 때 비용이 발생한다.

제안: 전국 인덱스는 유지하면서 화면 bbox + 여백에 해당하는 클러스터만 조회한다. 개수·단계·대표 꽃은 Supercluster map/reduce 집계로 저장하고 전체 구성원 조회는 클릭/목록 열기로 미룬다. 기존 꽃 대표 선정, 줌 분리 판단, 클릭 시 bounds 계산이 동일하게 동작해야 한다. 화면 밖 클러스터 중심에 대한 여백도 필요하다.

전국 API를 바로 화면별 API로 바꾸는 것은 별도 판단이다. 현재 코드는 지도 이동 때 데이터 교체를 줄이려고 전국 조회를 선택했다. 실제 응답 크기와 핀 수가 충분히 커지면 권역/타일 캐시, 안정적인 핀 ID 병합, 이전 화면 데이터 유지까지 함께 설계한다.

### 합성 데이터 벤치마크

실제 mapCluster.ts를 TypeScript transpileModule로 메모리에서 변환해 실행했다. Node v22.16.0, level 8, seed 42의 LCG 난수, 위도 33~38.5 / 경도 125~130 균등 분포, 각 규모 9회 중앙값. 100개로 준비 실행 후 측정했다.

| 합성 핀 수 | 결과 그룹 수 | 새 배열: 인덱스 생성 + 결과 펼치기 | 동일 인덱스: 결과 펼치기 |
|---:|---:|---:|---:|
| 665 | 654 | 4.35ms | 0.30ms |
| 5,000 | 4,248 | 21.99ms | 1.75ms |
| 20,000 | 11,523 | 107.83ms | 13.04ms |

665개는 소스 주석에 등장하는 규모를 참고한 합성 입력이며 현재 운영 핀 수가 아니다. 동일 인덱스 열은 함수 재호출 비용이다. 훅의 줌별 결과 캐시가 적중하면 함수 자체를 호출하지 않으므로 이 비용이 매 드래그 프레임에 발생하는 것은 아니다. DOM·카카오 SDK·네트워크 비용을 제외한 데스크톱 수치이고 모바일 체감 속도로 환산할 수 없다.

## 3. Feed: 화면 밖 링크 카드도 외부 메타데이터를 요청한다 — 우선

근거: [FeedCard.tsx](../src/components/ui/card/FeedCard.tsx)의 ContentLinkCard, [useContentLinkMeta.ts](../src/hooks/useContentLinkMeta.ts) 24, 43, 96~99행, [FeedListItem.tsx](../src/components/ui/card/FeedListItem.tsx) 29행.

링크 미리보기 쿼리의 enabled에는 플랫폼과 URL 안정 여부만 있고 화면 노출 여부는 없다. 목록을 마운트하면 화면 밖 카드도 요청 가능하다. 서로 다른 지원 URL이 20개인 첫 페이지라면 캐시가 없는 경우 최대 20개의 추가 메타데이터 요청이 시작될 수 있다. 웹은 YouTube, 네이티브는 네이버·Instagram도 대상이며 네이티브에서는 HTML 본문을 받아 파싱한다. 실제 요청 수는 링크 포함률과 URL 중복에 따라 달라진다.

제안: 카드가 화면 근처에 들어올 때 enabled를 켜고, 네이티브 HTML 요청에 동시 실행 상한을 둔다. 장기적으로 서버에서 게시 시 메타데이터를 수집해 목록 응답에 포함하는 방법을 검토한다. 현재 `gcTime: Infinity`는 URL별 메타데이터가 세션 내 누적되므로 사용량에 맞는 유한 캐시 보존 시간을 검토한다. 작성 화면의 즉시 미리보기는 유지한다.

content-visibility는 레이아웃·페인팅을 줄이는 기능이다. 이 코드의 React 마운트와 쿼리 실행을 막는 장치는 아니다. [web.dev 설명](https://web.dev/articles/content-visibility)

## 4. Explore: 외부 이미지 최적화가 보장되지 않는다 — 우선 조사

근거: [next.config.ts](../next.config.ts) 17행, [ExplorCard.tsx](../src/components/ui/card/ExplorCard.tsx), [ExploreClient.tsx](../src/app/explore/_components/ExploreClient.tsx) 169, 225행.

전역 `images.unoptimized: true`이며 탐색은 API의 thumbnailUrl을 그대로 표시한다. 자체 CDN에서 이미 변환한 이미지에는 타당하지만, 관광공사 등 외부 원본 URL까지 크기·포맷 변환을 보장하지 않는다. 소스 주석에는 약 1MB BMP 사례가 있으나 이번에 해당 파일이나 현재 운영 응답을 재측정하지 않았다.

제안: 실제 응답을 대상으로 이미지 호스트·전송 크기·원본 해상도·포맷을 먼저 조사한다. 큰 외부 이미지는 서버 수집 시 용도별 WebP/AVIF 썸네일을 만들거나 해당 이미지에만 변환 경로를 적용한다. CSS width/height/sizes만 바꿔서는 원본 바이트가 줄지 않는다. Next 공식 문서도 unoptimized가 원본 크기·품질·포맷 그대로 제공됨을 명시한다. [Next Image 문서](https://nextjs.org/docs/app/api-reference/components/image#unoptimized)

피드는 이미 `medium` variant를 사용하고 있어 전부 원본을 받는다고 볼 수 없다. 다만 [recordPhotoUrl.ts](../src/lib/utils/recordPhotoUrl.ts)는 variant가 없으면 원본 URL로 폴백하므로 누락 비율을 확인할 가치가 있다.

## 5. Feed · Explore: 누적 페이지 재조회와 추가 로딩 충돌 — 중간

근거: [feed.ts](../src/api/facades/feed.ts) 63행, [explore.ts](../src/api/facades/explore.ts) 48행, [Providers.tsx](../src/app/_components/Providers.tsx), [myRecords.ts](../src/lib/utils/myRecords.ts)의 shouldLoadMore.

- 두 무한 쿼리는 maxPages 제한이 없다. 오래 스크롤할수록 데이터가 쌓인다.
- stale 상태의 무한 쿼리를 재조회하면 쌓인 페이지를 첫 페이지부터 순차 조회한다. 20페이지가 남은 쿼리는 재조회 시 최대 20페이지를 다시 받을 수 있다. 포커스 복귀·재마운트·무효화 등 실제 재조회 조건이 성립할 때의 이야기다. [TanStack Infinite Queries](https://tanstack.com/query/latest/docs/framework/react/guides/infinite-queries)
- 자동 추가 로딩은 isFetchingNextPage만 확인한다. 일반 background refetch 중에도 sentinel이 나타나면 fetchNextPage가 실행돼 기존 갱신과 경합할 수 있다. 같은 공식 문서는 자동 로딩 시 isFetching 확인을 권장한다.

제안: 먼저 전체 isFetching을 포함한 추가 로딩 조건과 재조회 정책을 정한다. 깊은 목록에서 삭제·수정 후 필요한 캐시만 갱신할 수 있는지도 검토한다. maxPages는 이전 방향 재조회와 스크롤 복원까지 설계한 뒤 적용한다. 지금 코드에 숫자만 추가하면 앞 페이지가 제거돼 뒤로 스크롤하는 경험이 깨질 수 있다. 가상화만 도입해도 쿼리 캐시의 페이지 수는 줄지 않는다.

## 6. Feed · Explore: 오래 스크롤한 목록의 마운트·DOM 누적 — 규모에 따라

근거: [FeedClient.tsx](../src/app/feed/_components/FeedClient.tsx) 141행, [FeedListItem.tsx](../src/components/ui/card/FeedListItem.tsx), [ExploreSpotsClient.tsx](../src/app/explore/spots/_components/ExploreSpotsClient.tsx), [SpotCard.tsx](../src/components/ui/card/SpotCard.tsx).

피드는 memo와 content-visibility로 재렌더·페인트를 줄이지만 모든 로드된 카드가 마운트된다. 여러 사진의 캐러셀, mutation 훅, 상태·구독도 카드 수에 따라 누적될 수 있다. 탐색 전체 목록은 memo/가상화 없이 SpotCard를 모두 그리며 렌더마다 props 객체와 onOpen 함수를 새로 만든다.

제안: 100/300/500개 카드에서 React commit 시간, DOM 수, 힙, Embla 인스턴스 수를 비교한다. 부담이 크면 화면 근처에서만 캐러셀을 활성화하거나 동적 높이 가상화를 적용한다. 탐색은 원본 item을 받는 memo 래퍼와 안정적인 콜백부터 고려할 수 있다. memo만 추가하고 새 객체 props를 계속 전달하면 기대 효과가 작다.

가상화 시 피드 리액션 상태는 현재 컴포넌트 로컬 override에 있으므로 언마운트·재마운트 후 상태가 되돌아가지 않게 쿼리 캐시에도 반영해야 한다. 접근성·포커스·뒤로가기 위치 복원도 검증한다.

## 7. 공통: 작은 범위로 개선할 수 있는 후보

- **요청 취소 전달:** feed.ts 65행과 explore.ts 30/50/67행의 queryFn은 signal을 사용하지 않는다. facade는 RequestInit을 받을 수 있어 `({ signal }) => api(params, { signal })` 형태로 연결 가능하다. 빠른 탭·필터 전환 시 불필요해진 요청을 줄일 수 있다. 지도 generated 훅에는 이미 signal 전달이 있다. 취소 없이 완료시켜 탭 재방문 캐시를 채우는 이점과 비교한다.
- **지도 Drawer 로드 시점:** MapContainer.tsx 478행은 타일이 로드되면 Drawer를 마운트한다. 실제로 열기 전에도 JS 다운로드·평가가 발생할 수 있다. 기존 LazyDrawer와 동일한 첫 열기 기준을 적용하는 후보다. 처음 핀/필터를 눌렀을 때의 대기와 저속망 UX를 함께 비교한다. 현재 번들 크기는 측정하지 않았다.
- **반복 배열 변환:** FeedClient의 flattenPages, Explore의 filter/map은 재렌더마다 실행된다. 대량 목록 프로파일에서 비용이 보이면 useMemo를 적용하되 위 항목들보다 낮은 우선순위다.

## 권장 실행 순서와 확인 기준

1. 실제 Android와 production 웹에서 기준값 확보: 첫 진입/재방문, 로그인/비로그인, 같은 네트워크 조건을 분리한다.
2. 링크 미리보기 viewport 조건, 요청 취소 전달, 추가 로딩 isFetching 조건을 작은 변경으로 검증한다.
3. 탐색 이미지 응답 크기를 조사하고 큰 외부 원본의 변환 경로를 마련한다.
4. 지도 render 전체 시간을 측정해 작업 분할과 bbox 조회를 적용한다. Worker는 동기 계산 비용이 확인될 때 도입한다.
5. 깊은 목록에서 메모리·재조회 비용이 확인되면 가상화와 페이지 보존 정책을 설계한다.

| 화면 | 재현 시나리오 | 비교할 값 |
|---|---|---|
| Map | 첫 진입, 필터 변경, 연속 줌·팬, 지도 재방문 | API 전송량, 첫 핀 표시 시간, render 전체 p50/p95, Long Task, 프레임, 오버레이 수 |
| Explore | 첫 화면, 가로 넘김, 빠른 필터 전환, 전체 목록 10페이지 | LCP, 이미지 전송량·포맷, 요청 취소, React commit 시간 |
| Feed | 링크 포함 첫 페이지, 20페이지 스크롤, stale 후 복귀, 리액션·삭제 | 외부 요청 수, 재조회 페이지 수, DOM·힙, 스크롤 프레임, 상태·위치 복원 |

운영 지표 접근과 브라우저/기기 실측을 하지 않았으므로 “몇 % 개선”이나 현재 Lighthouse 점수는 제시하지 않는다. 합성 벤치마크 외의 성능 효과는 검증할 가설이다.

## 후속 구현 — 사용자 승인 범위

대화 요약표의 1·2·4·5·6번을 구현했다. 요약표 3번인 이미지 변환은 제외했다. 이 문서 본문의 상세 항목 번호와 대화 요약표의 번호는 다르다.

- 지도: generator로 준비·순회·제거·생성의 진행 위치를 보존한다. 초기 표시, 데이터 변경, 줌, idle 모두 rAF의 4ms 협력적 예산을 사용한다. 필터/줌 변경과 언마운트는 이전 큐를 폐기한다. 팬 중에는 진행 중인 큐를 마친 뒤 최신 화면을 처리한다.
- 링크 미리보기: 공유 IntersectionObserver로 화면 앞뒤 600px에서 요청한다. 작성 화면은 즉시 조회한다. 메타데이터 요청은 동시에 3개까지만 실행하고 대기 중 취소된 요청은 건너뛴다. 웹 fetch에 AbortSignal을 전달하며, 비활성 쿼리는 30분 뒤 정리한다. 실행 중인 네이티브 HTTP는 실제 완료까지 슬롯을 유지한다.
- 무한 목록: feed/explore 전체 목록에서 포커스 복귀 자동 재조회를 끈다. 재마운트, 명시적 갱신, mutation 무효화, 네트워크 재연결은 기존 정책을 유지한다. 자동 추가 로딩은 전체 isFetching을 검사해 background refetch와의 경합을 막는다.
- 긴 목록: 피드 캐러셀은 화면 근처에 와야 처음 생성하며, 화면 밖에서는 Embla를 비활성화한다. 재활성화할 때 선택한 사진을 유지한다. 탐색 전체 목록은 원본 항목을 받는 memo 래퍼와 content-visibility를 사용한다. 두 목록의 flatten 변환을 메모이제이션한다.
- 공통: feed/explore facade 쿼리에 AbortSignal을 전달한다. 인증 갱신 후 취소된 재시도 요청이 로그인 상태를 지우지 않게 보완한다. 지도 Drawer도 처음 열 때 코드를 로드한다.

검증: 관련 11개 테스트 파일의 60개 테스트 통과, 전체 `tsc --noEmit` 통과, 변경 소스·테스트 ESLint 통과. 테스트에는 줌/필터 큐 취소, 오버레이 재사용·정리, 요청 큐의 동시성·실패·취소, 화면 노출 요청 조건, 포커스/명시적 무효화, 캐러셀 재활성화와 선택 사진 유지, 인증 갱신 후 취소를 포함한다.

검증 환경은 잠금 파일 그대로 누락 의존성을 복구했다. ESLint는 기존 pnpm 중첩 의존성의 플러그인 경로를 NODE_PATH로 지정해 실행했다. package.json과 pnpm-lock.yaml 변경은 없다.

구현의 한계: 지도 인덱스 생성 및 SDK 호출 하나는 여전히 동기 작업이라 4ms를 넘길 수 있다. Worker는 도입하지 않았다. 카드 DOM/쿼리 페이지를 제거하는 가상화·maxPages는 적용하지 않아 기존 스크롤 복원과 카드 상태를 유지한다. 따라서 페이지 누적 및 명시적 전체 재조회 비용의 상한을 보장하는 변경은 아니다. production 브라우저·Android 실측과 빌드는 이번 구현 검증에 포함하지 않았다.
