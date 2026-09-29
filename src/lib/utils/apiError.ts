// customInstance(src/api/mutator)는 실패 응답을 { response: { status, data } } 로 던진다.
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

// 4xx 는 다시 불러도 결과가 같다(401 은 mutator 가 refresh 까지 이미 시도했다).
// 응답이 없는 네트워크 오류와 5xx 만 한 번 더 시도한다.
export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  const status = getApiErrorStatus(error)
  return failureCount < 1 && (status === undefined || status >= 500)
}
