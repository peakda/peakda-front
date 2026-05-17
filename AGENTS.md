# AGENTS.md

## 코드 작성 원칙

- TypeScript strict 모드 준수, any 사용 금지
- 함수형 컴포넌트 + hooks 패턴만 사용
- 컴포넌트 props는 interface로 명시적 타입 정의
- 불필요한 useEffect 지양, 서버 컴포넌트 우선 고려

## 컴포넌트 규칙

- named export 사용 (default export 금지)
- props interface는 컴포넌트명 + Props로 명명
  예) ButtonProps, SpotCardProps
- 'use client' 는 꼭 필요한 경우만 최하위 컴포넌트에 선언

## 스타일 규칙

- Tailwind CSS v4 유틸리티 클래스 사용
- 인라인 style 속성 금지
- cn() 유틸로 조건부 클래스 처리
  예) cn('base-class', isActive && 'active-class')
- 디자인 토큰 변수 활용 (globals.css @theme 정의 참고)

## 상태 관리 규칙

- 서버 상태: TanStack Query (useQuery, useMutation)
- 클라이언트 전역 상태: Zustand
- 로컬 UI 상태: useState
- 폼 상태: React Hook Form + Zod

## API 호출 규칙

- 외부 API는 반드시 /app/api/ Route Handler 경유
- TanStack Query로 캐싱, staleTime 명시
- 에러 처리는 try/catch + 타입 가드로 처리

## 금지 사항

- any 타입 사용
- console.log (console.error, console.warn만 허용)
- 상대경로 import (../) — @/ 절대경로 사용
- 인라인 스타일
- default export (컴포넌트)
- 외부 API 직접 클라이언트 호출

## PR 작성 규칙

- 제목: [타입] 내용 — 예) [feat] 계절 타이밍 지도 마커 구현
- 타입: feat / fix / chore / refactor / style / docs
- 변경 사항, 테스트 방법 간략히 작성
