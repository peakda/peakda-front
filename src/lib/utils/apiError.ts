// customInstance(src/api/mutator)가 실패 응답에 던지는 에러. Error 를 상속해 스택이 남는다.
// `response.status`/`response.data` 모양은 예전 plain object 시절과 같게 유지한다.
export class ApiError extends Error {
  readonly response: { status: number; data: unknown }

  constructor(status: number, data: unknown) {
    super(`API ${status}`)
    this.name = 'ApiError'
    this.response = { status, data }
  }
}

// 네트워크 오류처럼 응답 자체가 없으면 undefined.
export function getApiErrorStatus(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null || !('response' in error)) return undefined
  const { response } = error
  if (typeof response !== 'object' || response === null || !('status' in response)) return undefined
  return typeof response.status === 'number' ? response.status : undefined
}

export function isApiErrorStatus(error: unknown, status: number): boolean {
  return getApiErrorStatus(error) === status
}

// 백엔드 에러 본문 { code, message } 의 message. 없으면 undefined.
export function getApiErrorMessage(error: unknown): string | undefined {
  if (!(error instanceof ApiError)) return undefined
  const { data } = error.response
  if (typeof data !== 'object' || data === null || !('message' in data)) return undefined
  return typeof data.message === 'string' ? data.message : undefined
}

// 4xx 는 다시 불러도 결과가 같다(401 은 mutator 가 refresh 까지 이미 시도했다).
// 응답이 없는 네트워크 오류와 5xx 만 한 번 더 시도한다.
export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  const status = getApiErrorStatus(error)
  return failureCount < 1 && (status === undefined || status >= 500)
}
