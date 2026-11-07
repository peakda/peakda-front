import { act, createElement as h } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { PromotionalMapPinResponse } from '@/api/facades/generated/peakdaApi.schemas'
import { usePromotionalPins } from './usePromotionalPins'

const mocks = vi.hoisted(() => ({
  browserOpen: vi.fn(() => Promise.resolve()),
  isNativeApp: vi.fn(() => false),
  track: vi.fn(),
}))

vi.mock('@capacitor/browser', () => ({ Browser: { open: mocks.browserOpen } }))
vi.mock('@/lib/auth/nativeAuth', () => ({ isNativeApp: mocks.isNativeApp }))
vi.mock('@/lib/analytics', () => ({ track: mocks.track }))

const LINK = 'https://play-peakda.peakda.workers.dev/'
const SHARK: PromotionalMapPinResponse = {
  id: 'BUSAN_NORTH_PORT',
  name: '부산 북항',
  latitude: 35.11,
  longitude: 129.04,
  iconKey: 'SHARK',
  linkUrl: LINK,
}
let level: number
const map = { getLevel: () => level } as kakao.maps.Map

interface OverlayOptions {
  content: HTMLElement
  position: { lat: number; lng: number }
}

let root: Root
let visible: Set<Overlay>
let zoomListeners: Set<() => void>
const zoomTo = (next: number) => {
  level = next
  zoomListeners.forEach((listener) => listener())
}

class Overlay {
  constructor(public options: OverlayOptions) {}
  setMap(value: unknown) {
    if (value) visible.add(this)
    else visible.delete(this)
  }
}

function Component({ pins }: { pins: PromotionalMapPinResponse[] | undefined }) {
  usePromotionalPins(map, pins)
  return null
}
const render = (pins: PromotionalMapPinResponse[] | undefined) =>
  act(async () => root.render(h(Component, { pins })))
const onlyContent = () => {
  expect(visible.size).toBe(1)
  return [...visible][0].options.content
}

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  visible = new Set()
  zoomListeners = new Set()
  level = 3
  mocks.isNativeApp.mockReturnValue(false)
  mocks.browserOpen.mockClear()
  mocks.track.mockClear()
  vi.stubGlobal('open', vi.fn())
  vi.stubGlobal('kakao', {
    maps: {
      CustomOverlay: Overlay,
      event: {
        addListener: (_target: object, _type: string, handler: () => void) =>
          zoomListeners.add(handler),
        removeListener: (_target: object, _type: string, handler: () => void) =>
          zoomListeners.delete(handler),
      },
      LatLng: class {
        constructor(
          public lat: number,
          public lng: number
        ) {}
      },
    },
  })
  root = createRoot(document.createElement('div'))
})
afterEach(async () => {
  await act(async () => root.unmount())
  vi.unstubAllGlobals()
})

describe('usePromotionalPins', () => {
  it('SHARK 핀을 응답 좌표에 상어 아이콘과 이름표로 그린다', async () => {
    await render([SHARK])

    expect([...visible][0].options.position).toEqual({ lat: 35.11, lng: 129.04 })
    const content = onlyContent()
    expect(content.getAttribute('aria-label')).toBe('부산 북항')
    expect(content.querySelector('img')?.getAttribute('src')).toBe('/images/shark-pin.svg')
  })

  it('레벨 3 이하는 개별 핀 크기와 기본 이미지로 그린다', async () => {
    await render([SHARK])

    const content = onlyContent()
    expect(content.classList.contains('scale-140')).toBe(false)
    expect(content.querySelector('img')?.getAttribute('src')).toBe('/images/shark-pin.svg')
  })

  it('레벨 4 이상은 처음부터 크게, 고화질 이미지로 그린다', async () => {
    level = 8
    await render([SHARK])

    const content = onlyContent()
    expect(content.classList.contains('scale-140')).toBe(true)
    expect(content.querySelector('img')?.getAttribute('src')).toBe('/images/shark-pin-large.svg')
  })

  it('줌으로 레벨 3과 4 사이를 넘으면 크기와 이미지를 바꾼다', async () => {
    await render([SHARK])
    const content = onlyContent()

    zoomTo(4)
    expect(content.classList.contains('scale-140')).toBe(true)
    expect(content.querySelector('img')?.getAttribute('src')).toBe('/images/shark-pin-large.svg')

    zoomTo(3)
    expect(content.classList.contains('scale-140')).toBe(false)
    expect(content.querySelector('img')?.getAttribute('src')).toBe('/images/shark-pin.svg')
  })

  it('핀을 내리면 줌 리스너도 해제한다', async () => {
    await render([SHARK])
    expect(zoomListeners.size).toBe(1)

    await act(async () => root.render(h(Component, { pins: undefined })))
    expect(zoomListeners.size).toBe(0)
  })

  it('투명 여백은 탭을 흘려보내고 보이는 원과 꼬리만 눌린다', async () => {
    await render([SHARK])
    const content = onlyContent()

    expect(content.classList.contains('pointer-events-none')).toBe(true)
    const hitAreas = content.querySelectorAll('span.pointer-events-auto')
    expect(hitAreas).toHaveLength(2)

    hitAreas[0].dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(window.open).toHaveBeenCalledTimes(1)
    hitAreas[1].dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(window.open).toHaveBeenCalledTimes(2)
  })

  it('웹에서 탭하면 linkUrl 을 새 창으로 열고 집계한다', async () => {
    await render([SHARK])
    onlyContent().click()

    expect(window.open).toHaveBeenCalledWith(LINK, '_blank', 'noopener,noreferrer')
    expect(mocks.browserOpen).not.toHaveBeenCalled()
    expect(mocks.track).toHaveBeenCalledWith('map_promo_pin_click', { pin_id: 'BUSAN_NORTH_PORT' })
  })

  it('앱에서 탭하면 Custom Tab 으로 연다', async () => {
    mocks.isNativeApp.mockReturnValue(true)
    await render([SHARK])
    onlyContent().click()

    expect(mocks.browserOpen).toHaveBeenCalledWith({ url: LINK })
    expect(window.open).not.toHaveBeenCalled()
  })

  it('키보드 Enter 로도 연다', async () => {
    await render([SHARK])
    onlyContent().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))

    expect(window.open).toHaveBeenCalledTimes(1)
  })

  it('모르는 iconKey 는 그리지 않는다', async () => {
    await render([{ ...SHARK, iconKey: 'WHALE' }])

    expect(visible.size).toBe(0)
  })

  it('응답에서 핀이 빠지면(다른 권역) 지도에서 내린다', async () => {
    await render([SHARK])
    expect(visible.size).toBe(1)

    await render([])
    expect(visible.size).toBe(0)
  })
})
