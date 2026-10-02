import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act, createElement as h } from 'react'
import { createRoot } from 'react-dom/client'
import { usePreviewUrls } from './usePreviewUrls'

;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

// jsdom 에는 Object URL API 가 없어 직접 채운다.
let seq = 0
const createObjectURL = vi.fn(() => `blob:${++seq}`)
const revokeObjectURL = vi.fn()

beforeEach(() => {
  seq = 0
  createObjectURL.mockClear()
  revokeObjectURL.mockClear()
  Object.assign(URL, { createObjectURL, revokeObjectURL })
})

async function mount() {
  const result: { current: ReturnType<typeof usePreviewUrls> | null } = { current: null }
  function Comp() {
    result.current = usePreviewUrls()
    return null
  }
  const root = createRoot(document.createElement('div'))
  await act(async () => {
    root.render(h(Comp))
  })
  return { hook: result as { current: ReturnType<typeof usePreviewUrls> }, root }
}

const file = () => new File(['x'], 'a.jpg', { type: 'image/jpeg' })

describe('usePreviewUrls', () => {
  it('화면을 떠나면 아직 해제되지 않은 URL 만 한꺼번에 해제한다', async () => {
    const { hook, root } = await mount()
    const a = hook.current.createPreviewUrl(file())
    const b = hook.current.createPreviewUrl(file())
    const c = hook.current.createPreviewUrl(file())
    hook.current.revokePreviewUrl(b)
    expect(revokeObjectURL.mock.calls.map(([url]) => url)).toEqual([b])

    act(() => root.unmount())

    expect(revokeObjectURL.mock.calls.map(([url]) => url).sort()).toEqual([a, b, c].sort())
  })

  it('언마운트 뒤에는 isUnmounted 가 true 라 압축이 끝나도 새 URL 을 만들지 않을 수 있다', async () => {
    const { hook, root } = await mount()
    expect(hook.current.isUnmounted()).toBe(false)

    act(() => root.unmount())

    expect(hook.current.isUnmounted()).toBe(true)
  })
})
