// 네이티브 HTTP 는 실행 후 취소할 수 없어 슬롯을 완료까지 유지한다.
// 대기 중 취소된 요청은 실행하지 않는다.
export function createRequestQueue(limit: number) {
  let active = 0
  const waiting: (() => void)[] = []
  return function enqueue<T>(run: () => Promise<T>, signal?: AbortSignal): Promise<T> {
    return new Promise((resolve, reject) => {
      const abort = () => {
        const index = waiting.indexOf(start)
        if (index !== -1) waiting.splice(index, 1)
        reject(signal?.reason ?? new DOMException('Aborted', 'AbortError'))
      }
      const start = () => {
        signal?.removeEventListener('abort', abort)
        if (signal?.aborted) return abort()
        active++
        Promise.resolve()
          .then(run)
          .then(resolve, reject)
          .finally(() => {
            active--
            waiting.shift()?.()
          })
      }
      if (signal?.aborted) return abort()
      if (active < limit) start()
      else {
        waiting.push(start)
        signal?.addEventListener('abort', abort, { once: true })
      }
    })
  }
}
