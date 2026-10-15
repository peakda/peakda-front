import { act, createElement as h } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, expect, it, vi } from 'vitest'
import { useCarousel } from './useEmblaCarousel'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

it('화면 밖 비활성화 후 다시 켜도 선택한 사진을 유지한다', async () => {
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  }))
  const disconnect = vi.fn()
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect = disconnect
    }
  )
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe() {}
      disconnect = disconnect
    }
  )
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(300)
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(240)
  vi.spyOn(HTMLElement.prototype, 'offsetTop', 'get').mockReturnValue(0)
  vi.spyOn(HTMLElement.prototype, 'offsetLeft', 'get').mockImplementation(function (
    this: HTMLElement
  ) {
    return Number(this.dataset.index ?? 0) * 300
  })
  let carousel!: ReturnType<typeof useCarousel>
  function Component({ active }: { active: boolean }) {
    carousel = useCarousel({ active, loop: true })
    return h(
      'div',
      { ref: carousel.emblaRef },
      h(
        'div',
        null,
        ...[0, 1, 2, 3].map((index) =>
          h('div', { key: index, 'data-index': index }, `photo ${index}`)
        )
      )
    )
  }
  const container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container)
  try {
    await act(async () => root.render(h(Component, { active: true })))
    await act(async () => carousel.emblaApi!.scrollTo(2, true))
    expect(carousel.selectedIndex).toBe(2)
    await act(async () => root.render(h(Component, { active: false })))
    expect(disconnect).toHaveBeenCalled()
    await act(async () => root.render(h(Component, { active: true })))
    expect(carousel.selectedIndex).toBe(2)
    expect(carousel.emblaApi!.selectedScrollSnap()).toBe(2)
  } finally {
    await act(async () => root.unmount())
    container.remove()
  }
})
