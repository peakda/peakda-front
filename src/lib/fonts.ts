import { Advent_Pro } from 'next/font/google'

// 로고 글자(지도 헤더·스플래시/로그인)에만 쓰는 폰트. 루트 레이아웃에서 선언하면 쓰지 않는
// 피드·탐색까지 모든 페이지에 woff2 preload 가 붙어 첫 화면 이미지와 대역폭을 다툰다.
// 쓰는 컴포넌트에서만 import 해 그 라우트에만 preload 되게 한다.
// 쓰는 곳이 모두 font-semibold(600)라 그 굵기만 받는다 — 굵기를 안 정하면 가변 폰트 전체(32KB)가 붙는다(600 하나는 13KB).
export const adventPro = Advent_Pro({
  subsets: ['latin'],
  weight: '600',
  display: 'swap',
})
