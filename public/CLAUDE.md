# public/

## Overview

정적 에셋과 법적 고지 페이지 생성 프롬프트 문서를 owns한다.

## 디렉터리

| 경로 | 용도 |
| --- | --- |
| `flowers/` | 계절 명소(벚꽃·단풍 등) 관련 이미지 에셋 |
| `icons/` | 아이콘 SVG/이미지 |
| `images/` | 그 외 일반 이미지 에셋 |
| `map-tile-sw.js` | 예전 카카오맵 타일 캐시와 Service Worker 등록을 정리하는 마이그레이션 스크립트 |

## 루트 파일

- `*-prompt.md` (`terms-prompt.md`, `privacy-policy-prompt.md`, `marketing-consent-prompt.md`, `location-policy-prompt.md`)
  법적 고지 페이지(`src/app/Terms/`)를 생성할 때 사용한 AI 프롬프트 원본. 실제 앱 콘텐츠가 아니라 생성 스펙 문서이므로 런타임에서 참조되지 않는다.
  - Note: 페이지 콘텐츠를 수정할 때는 `src/app/Terms/_data/legal-content.ts`를 직접 고칠 것 — 이 프롬프트 파일은 갱신하지 않아도 됨(단, 페이지 구조 자체를 바꾼다면 함께 갱신 검토).

## Common patterns

- 새 계절 명소 이미지 추가: `flowers/` 아래에 넣고 [src/CLAUDE.md](../src/CLAUDE.md)의 데이터 흐름을 참고해 연결.
- 새 법적 고지 페이지 추가: `*-prompt.md` 컨벤션대로 프롬프트 문서를 먼저 작성한 뒤 `src/app/Terms/_data/`에 실제 콘텐츠를 구현.

## 규칙

- `map-tile-sw.js`는 더 이상 앱에서 신규 등록하지 않는다. 기존 설치본을 정리하기 위한 파일이므로 타일 fetch 핸들러를 다시 추가하지 않는다.
