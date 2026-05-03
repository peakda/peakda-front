# 꽃피는 지금 — CLAUDE.md

## 프로젝트 개요

계절 여행 타이밍 안내 서비스. 벚꽃·단풍 등 20여 개 계절 명소의
실시간 개화 상태를 지도로 보여주고, 찜 & 알림 기능을 제공한다.

## 기술 스택

- Framework: Next.js 15 (App Router)
- Language: TypeScript (strict)
- Styling: Tailwind CSS v4
- 서버 상태: TanStack Query v5
- 클라이언트 상태: Zustand v5
- 폼: React Hook Form + Zod
- 지도: Kakao Maps SDK
- 패키지 매니저: pnpm

## 디렉토리 구조

src/
├── app/ # Next.js App Router 페이지
│ ├── (map)/ # 메인 지도 페이지
│ ├── spot/[id]/ # 명소 상세
│ ├── record/ # 방문 기록
│ ├── wishlist/ # 찜 목록
│ └── api/ # Route Handler (API 프록시)
├── components/
│ ├── ui/ # 공용 컴포넌트 (Button, Badge 등)
│ ├── map/ # 지도 관련 컴포넌트
│ ├── spot/ # 명소 관련 컴포넌트
│ ├── record/ # 기록 관련 컴포넌트
│ └── layout/ # Header, Navigation
├── lib/
│ ├── api/ # TourAPI, 기상청 클라이언트
│ └── utils/ # cn.ts 등 유틸
├── hooks/ # 커스텀 훅
├── stores/ # Zustand 스토어
├── types/ # TypeScript 타입 정의
└── constants/ # 상수 (꽃 유형, 상태 등)

## 코드 컨벤션

- 컴포넌트: PascalCase, named export
- 훅: camelCase, use prefix
- 타입: PascalCase, interface 우선
- 상수: UPPER_SNAKE_CASE
- 파일명: kebab-case
- 절대경로 import (@/) 사용, 상대경로 금지

## 외부 API

- 한국관광공사 TourAPI: /api/tour Route Handler로 프록시
- 기상청 예보 API: /api/weather Route Handler로 프록시
- Kakao Maps SDK: NEXT_PUBLIC_KAKAO_MAP_KEY (클라이언트)

## 환경변수

TOUR_API_KEY # 서버 전용
WEATHER_API_KEY # 서버 전용
NEXT_PUBLIC_KAKAO_MAP_KEY # 클라이언트 노출 (도메인 제한)

## 주요 규칙

- TourAPI 직접 클라이언트 호출 금지 (키 노출) → Route Handler 경유
- any 타입 금지 (ESLint warn)
- 미사용 변수 금지 (ESLint error), \_ prefix 예외
- console.log 금지, console.error/warn만 허용
- 서버 컴포넌트 기본, 클라이언트 컴포넌트는 'use client' 명시
- 카카오맵은 dynamic import + ssr: false 필수
