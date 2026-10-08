import { createContext, useContext } from 'react'

// 캐러셀 슬라이드 안의 이미지를 지금 그려도 되는지. Carousel(eagerImageCount 를 준 경우)이 슬라이드마다 넣어 주고,
// 캐러셀 밖에서는 항상 true 다.
export const SlideImageContext = createContext(true)

export const useShouldRenderSlideImage = () => useContext(SlideImageContext)
