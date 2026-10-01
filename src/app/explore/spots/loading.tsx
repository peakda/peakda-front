// 상위 explore/loading.tsx 가 이 하위 화면에도 적용되므로, 스팟 전체 목록 모양으로 덮어쓴다.
export default function Loading() {
  return (
    <div
      aria-busy="true"
      aria-label="명소 목록 불러오는 중"
      className="bg-bg-primary relative flex min-h-screen flex-col pb-12"
    >
      <div className="flex h-14 items-center justify-center">
        <div className="h-5 w-28 animate-pulse rounded bg-gray-200" />
      </div>
      <ul className="divide-y divide-gray-100">
        {[0, 1, 2, 3, 4].map((i) => (
          <li key={i} className="flex items-center gap-3 px-4 py-3">
            <div className="h-20 w-20 shrink-0 animate-pulse rounded-lg bg-gray-200" />
            <div className="flex flex-1 flex-col gap-1.5">
              <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
              <div className="h-3.5 w-1/3 animate-pulse rounded bg-gray-100" />
              <div className="h-5 w-16 animate-pulse rounded-full bg-gray-100" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
