// customInstance(src/api/mutator)는 실패 응답을 { response: { status, data } } 로 던진다.
export function isApiErrorStatus(error: unknown, status: number): boolean {
  if (typeof error !== 'object' || error === null || !('response' in error)) return false
  const { response } = error
  return (
    typeof response === 'object' &&
    response !== null &&
    'status' in response &&
    response.status === status
  )
}
