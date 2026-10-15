import { describe, expect, it, vi } from 'vitest'
import { createRequestQueue } from './requestQueue'

const flush = async () => {
  for (let i = 0; i < 8; i++) await Promise.resolve()
}

describe('requestQueue', () => {
  it('실행 중 요청 수를 제한하고 완료된 슬롯을 다음 요청에 넘긴다', async () => {
    const enqueue = createRequestQueue(2)
    const releases: (() => void)[] = []
    const run = vi.fn(() => new Promise<void>((resolve) => releases.push(resolve)))
    const jobs = [enqueue(run), enqueue(run), enqueue(run), enqueue(run)]
    await flush()
    expect(run).toHaveBeenCalledTimes(2)
    releases[0]()
    await flush()
    expect(run).toHaveBeenCalledTimes(3)
    releases[1]()
    await flush()
    expect(run).toHaveBeenCalledTimes(4)
    releases[2]()
    releases[3]()
    await Promise.all(jobs)
  })

  it('대기 중 취소된 요청은 실행하지 않고 뒤의 요청은 진행한다', async () => {
    const enqueue = createRequestQueue(1)
    let release!: () => void
    const first = enqueue(
      () =>
        new Promise<void>((resolve) => {
          release = resolve
        })
    )
    const controller = new AbortController()
    const skipped = vi.fn(async () => 2)
    const cancelled = enqueue(skipped, controller.signal).catch((error) => error)
    const last = enqueue(async () => 3)
    controller.abort()
    await flush()
    release()
    await first
    expect((await cancelled).name).toBe('AbortError')
    expect(await last).toBe(3)
    expect(skipped).not.toHaveBeenCalled()
  })

  it('실패한 요청도 슬롯을 반납한다', async () => {
    const enqueue = createRequestQueue(1)
    const failed = enqueue(async () => {
      throw new Error('offline')
    }).catch(() => null)
    const next = enqueue(async () => 'ok')
    await failed
    expect(await next).toBe('ok')
  })
})
