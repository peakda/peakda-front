import { describe, it, expect, vi } from 'vitest'
import { act, createElement as h } from 'react'
import { createRoot } from 'react-dom/client'
import { track } from '@/lib/analytics'
import { useTrackPhotoSwipe } from './useTrackPhotoSwipe'

vi.mock('@/lib/analytics', () => ({ track: vi.fn() }))

function Comp({ selectedIndex }: { selectedIndex: number }) {
  useTrackPhotoSwipe(selectedIndex, 10, 3, 'feed_detail')
  return null
}

describe('useTrackPhotoSwipe', () => {
  it('첫 사진에서는 보내지 않고, 처음 넘길 때 한 번만 보낸다', async () => {
    const root = createRoot(document.createElement('div'))

    await act(async () => root.render(h(Comp, { selectedIndex: 0 })))
    expect(track).not.toHaveBeenCalled()

    await act(async () => root.render(h(Comp, { selectedIndex: 1 })))
    await act(async () => root.render(h(Comp, { selectedIndex: 2 })))
    await act(async () => root.render(h(Comp, { selectedIndex: 0 })))

    expect(track).toHaveBeenCalledOnce()
    expect(track).toHaveBeenCalledWith('feed_photo_swipe', {
      record_id: 10,
      photo_count: 3,
      surface: 'feed_detail',
    })
  })
})
