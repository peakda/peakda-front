// 진행 위치를 보존하는 cooperative 작업. 한 단계 자체(예: SDK 호출)는 중간에 끊을 수 없다.
export function advanceFrame(task: Iterator<unknown, void>, budgetMs: number): boolean {
  const start = performance.now()
  do {
    if (task.next().done) return true
  } while (performance.now() - start < budgetMs)
  return false
}
