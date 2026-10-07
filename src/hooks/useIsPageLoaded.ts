import { useSyncExternalStore } from 'react'

function subscribe(onChange: () => void) {
  window.addEventListener('load', onChange)
  return () => window.removeEventListener('load', onChange)
}

function isPageLoaded() {
  return document.readyState === 'complete'
}

// window load(첫 화면의 이미지·폰트·스크립트를 다 받음)가 지났는지. 첫 화면과 대역폭을 다투지 않게
// 미뤄도 되는 일(분석 SDK, 다른 화면 prefetch)을 이 뒤로 보낸다. /map 에서는 load 가 지도 타일까지 기다린다.
// 서버 렌더링과 하이드레이션 첫 렌더는 false 이고, 클라이언트 이동으로 들어오면 이미 지나 있어 바로 true 다.
export function useIsPageLoaded(): boolean {
  return useSyncExternalStore(subscribe, isPageLoaded, () => false)
}
