import { useState } from 'react'

/**
 * loop 사진 캐러셀에서 <img> 를 그릴 장을 고른다.
 * 처음엔 현재 장만 그리고, 사진 하나를 다 받은 뒤(실패 포함)부터 지나간 장의 양옆까지 그린다. 한 번 그린 장은 지우지 않는다.
 *
 * Chrome 은 overflow:hidden 캐러셀 안의 loading="lazy" 이미지도 가로로 2장 거리까지 바로 받는다.
 * 옆 장을 그려 두기만 해도 첫 사진(LCP)과 대역폭을 나눠 써서, 피드 상세 LCP 가 Slow 4G 에서 10.9초 → 6.1초로 줄었다(요청 차단 실측).
 */
export function usePhotoCarouselImages(count: number, selectedIndex: number) {
  // 지나간 장(현재 장 포함). 선택이 바뀐 렌더에서 바로 더해야 넘긴 장이 빈 칸으로 한 박자 보이지 않는다.
  const [visited, setVisited] = useState([selectedIndex])
  if (!visited.includes(selectedIndex)) setVisited([...visited, selectedIndex])

  const [isSettled, setSettled] = useState(false)

  const isNear = (index: number, visitedIndex: number) =>
    index === visitedIndex ||
    (isSettled &&
      (index === (visitedIndex + 1) % count || index === (visitedIndex - 1 + count) % count))

  return {
    shouldRenderImage: (index: number) => visited.some((visitedIndex) => isNear(index, visitedIndex)),
    // 그린 <img> 의 onLoad·onError 에 건다.
    onImageSettled: () => setSettled(true),
  }
}
