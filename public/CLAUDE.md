# public/

정적 에셋 + 법적 고지 페이지 생성 프롬프트 문서.

## 디렉터리

| 경로 | 용도 |
| --- | --- |
| `flowers/` | 계절 명소(벚꽃·단풍 등) 관련 이미지 에셋 |
| `icons/` | 아이콘 SVG/이미지 |
| `images/` | 그 외 일반 이미지 에셋 |
| `map-tile-sw.js` | 카카오맵 타일 캐싱용 Service Worker |

## 루트 파일

- `*-prompt.md` (`terms-prompt.md`, `privacy-policy-prompt.md`, `marketing-consent-prompt.md`, `location-policy-prompt.md`)
  법적 고지 페이지(`src/app/Terms/`)를 생성할 때 사용한 AI 프롬프트 원본. 실제 앱 콘텐츠가 아니라 생성 스펙 문서이므로 런타임에서 참조되지 않는다.
  - Note: 페이지 콘텐츠를 수정할 때는 `src/app/Terms/_data/legal-content.ts`를 직접 고칠 것 — 이 프롬프트 파일은 갱신하지 않아도 됨(단, 페이지 구조 자체를 바꾼다면 함께 갱신 검토).

## 규칙

- `map-tile-sw.js`는 브라우저가 직접 서빙하는 서비스워커라 번들링 대상이 아님 — 수정 시 등록 스코프(`self.addEventListener`)를 건드리지 않도록 주의.
