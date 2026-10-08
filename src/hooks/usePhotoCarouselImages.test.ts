import { describe, it, expect } from 'vitest'
import { act, createElement as h } from 'react'
import { createRoot } from 'react-dom/client'
import { usePhotoCarouselImages } from './usePhotoCarouselImages'

let result: ReturnType<typeof usePhotoCarouselImages>

function Comp({ count, selectedIndex }: { count: number; selectedIndex: number }) {
  result = usePhotoCarouselImages(count, selectedIndex)
  return null
}

const rendered = (count: number) =>
  Array.from({ length: count }, (_, index) => index).filter((index) => result.shouldRenderImage(index))

describe('usePhotoCarouselImages', () => {
  it('사진을 받기 전에는 현재 장만, 받은 뒤에는 양옆(loop 라 맨 끝 장 포함)까지 그린다', async () => {
    const root = createRoot(document.createElement('div'))

    await act(async () => root.render(h(Comp, { count: 5, selectedIndex: 0 })))
    expect(rendered(5)).toEqual([0])

    await act(async () => result.onImageSettled())
    expect(rendered(5)).toEqual([0, 1, 4])
  })

  it('넘긴 장은 바로 그리고, 한 번 그린 장은 다시 지우지 않는다', async () => {
    const root = createRoot(document.createElement('div'))

    await act(async () => root.render(h(Comp, { count: 5, selectedIndex: 0 })))
    // 첫 사진을 받기 전에 넘겨도 넘긴 장은 그린다
    await act(async () => root.render(h(Comp, { count: 5, selectedIndex: 1 })))
    expect(rendered(5)).toEqual([0, 1])

    await act(async () => result.onImageSettled())
    await act(async () => root.render(h(Comp, { count: 5, selectedIndex: 2 })))
    expect(rendered(5)).toEqual([0, 1, 2, 3, 4])
  })

  it('2장이면 받은 뒤 두 장 모두 그린다', async () => {
    const root = createRoot(document.createElement('div'))

    await act(async () => root.render(h(Comp, { count: 2, selectedIndex: 0 })))
    await act(async () => result.onImageSettled())
    expect(rendered(2)).toEqual([0, 1])
  })
})
