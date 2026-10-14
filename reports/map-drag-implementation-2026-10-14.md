# 지도 드래그 최적화 구현 결과

2026-10-14. [조사·선택안](map-drag-options-research-2026-10-14.md)에 대한 사용자 구현 요청을 반영했다.

## 적용 내용

- [useMapPins.ts](../src/hooks/useMapPins.ts): 기존 매 프레임 중심 확인/전체 그룹 순회 대신 지도 이동 이벤트에서 최대 160ms 간격으로 준비 영역의 유효성만 확인한다. 완료된 100px 여백 안에 화면과 핀 몸통 범위가 포함되면 갱신 작업을 예약하지 않는다.
- 긴 이동에서 영역을 벗어나거나 표시가 아직 완성되지 않은 경우 주변 핀을 보충한다. 이동 중 프레임 예산은 2ms, 정착·초기 표시에는 기존 4ms를 사용한다. 진행 중 보충은 이동 이벤트마다 재시작하지 않아 지속적인 이동에서도 완료할 수 있다.
- `idle`에서 최종 영역을 갱신한다. 직전 보충으로 같은 영역을 이미 완성했다면 중복 작업을 생략한다. 드래그 종료 후 관성 이동, 프로그램에 의한 이동도 `bounds_changed`로 처리한다.
- 줌 시작/변경, 데이터 교체, 언마운트 때 낡은 작업과 타이머를 정리한다. 연속 줌 시작 시 이전 debounce도 취소한다.
- [mapCluster.ts](../src/lib/utils/mapCluster.ts): 전국 인덱스를 유지한 채 화면 주변 결과만 질의한다. 마지막 좌표 결과는 200px 여백까지 보관하지만, 구성원 조회·HTML·실제 오버레이는 기존 100px 여백 범위에 한정한다.
- 그룹을 데이터별 조회기 내부의 `cluster_id` / 원본 포인트 인덱스로 재사용해 기존 HTML WeakMap 캐시를 유지한다. 재사용 그룹 캐시는 256그룹·구성원 참조 합계 10,000개까지 보관한다. 이 상한은 화면 밖 재사용 캐시에 대한 것이며 화면에 보이는 핀을 상한 때문에 누락시키지 않는다.
- level 1~3은 원본 포인트 트리에서 조회해 군집 중심이 밖에 있는 개별 핀이 누락되지 않게 했다. level 4 이상은 기존 군집·개별 핀 표시 규칙을 유지한다.
- 원래 `clusterSpots`는 클릭 시 확대 가능 여부 판단 등에 그대로 사용한다. 클러스터 상태 링·대표 꽃 HTML과 API 조회 조건은 변경하지 않았다.

## 검증된 작업량 변화

이전 감사와 동일한 합성 입력 200핀/100군집, 가상 투영에서 화면 주변 1군집 조건이다. 시계와 SDK는 대체하고 실제 훅·Supercluster·HTML 코드를 실행했다. 아래는 FPS나 실행 시간 측정이 아니다.

| 항목 | 변경 전 | 변경 후 |
|---|---:|---:|
| 첫 표시의 군집 구성원 조회 | 100회 | 1회 |
| 첫 표시의 그룹 방문 | 100회 | 1회 |
| 같은 표시 영역 내 미세 이동 60회의 그룹 방문 | 6,000회 | 0회 |
| 위 이동 중 HTML 생성 / 오버레이 추가·제거 | 0회 | 0회 유지 |
| 위 이동 후 idle의 그룹 방문 | 100회 | 1회 |

60회 미세 이동은 각 경도 0.000001 증가, 가상 투영 10,000px/도 조건이다. 이동 종료 때까지 준비 영역을 벗어나지 않는 경우의 검증이며, 모든 드래그에서 그룹 방문 0회를 보장하는 수치는 아니다.

추가 확인:

- 긴 이동 이벤트 30회를 합쳐 160ms 뒤 주변 군집 하나를 추가하고 이전 하나를 제거한다.
- 완료된 보충 영역과 같은 위치의 idle은 다시 순회하지 않는다.
- 움직임이 없는 드래그는 지속적인 rAF/타이머 루프를 남기지 않는다.
- 전체 level 1~13과 여러 bbox에서 이전 표시 규칙과 최종 그룹·구성원·좌표가 일치한다.
- 군집 중심 밖의 구성원, 확대 단계 개별 핀, 데이터 교체, HTML 재사용, 캐시 상한, 키보드/클릭 활성화, bounds 확대와 fallback 확대를 검증했다.
- 초기 작업 중 드래그, 연속 줌, 진행 중 보충의 지속 이동, 빈 필터 결과, 언마운트 정리를 검증했다.

## 검사 결과

- 관련 5개 테스트 파일: **72개 통과**.
- 전체 TypeScript `--noEmit --incremental false`: 통과.
- 변경된 소스·테스트 4개 파일 ESLint: 통과.
- Impeccable 정적 검사: 발견 사항 없음.
- `git diff --check`: 통과.

로컬 pnpm 플러그인 링크 해석 문제는 설치된 `.pnpm/*eslint*/node_modules`를 해당 린트 명령의 `NODE_PATH`에 지정해 우회했다. 의존성이나 영구 환경 설정은 변경하지 않았다.

```powershell
node node_modules/vitest/vitest.mjs run reports/map-drag-code-audit.test.ts src/hooks/useMapPins.test.ts src/lib/utils/mapCluster.test.ts src/lib/utils/bloomToMapSpots.test.ts src/lib/utils/mapFilter.test.ts
node node_modules/typescript/bin/tsc --noEmit --incremental false
$env:NODE_PATH = (Get-ChildItem -Directory node_modules/.pnpm -Filter '*eslint*' | ForEach-Object { Join-Path $_.FullName 'node_modules' }) -join [IO.Path]::PathSeparator
node node_modules/eslint/bin/eslint.js src/hooks/useMapPins.ts src/lib/utils/mapCluster.ts src/hooks/useMapPins.test.ts reports/map-drag-code-audit.test.ts
```

## 남는 제약

- 실제 저사양 Android WebView의 FPS·페인트·SDK 비용은 이번 환경에서 측정하지 않았다. 동일 데이터로 작은 이동/긴 플릭/줌 직후 이동을 기기에서 비교할 필요가 있다.
- 빠른 장거리 이동에서는 160ms 확인 간격과 분할 처리 때문에 새 핀이 잠시 늦게 나타날 수 있다. 이동이 정착하면 최종 영역으로 갱신한다.
- 2ms/4ms는 협력적 예산이다. 전국 인덱스 생성, 단일 대형 군집의 구성원 조회, 한 번의 SDK 호출은 중간에 중단할 수 없다.
- 화면에 이미 붙은 많은 오버레이의 SDK 이동·그리기 비용은 남는다. 화면 자체가 매우 밀집한 경우의 별도 표시 밀도/렌더링 변경은 포함하지 않았다.
