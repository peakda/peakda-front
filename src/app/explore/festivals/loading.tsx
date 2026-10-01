// 상위 explore/loading.tsx 가 이 하위 화면에도 적용되므로, 축제 목록 모양으로 덮어쓴다.
export default function Loading() {
  return (
    <div
      aria-busy="true"
      aria-label="축제 목록 불러오는 중"
      className="bg-bg-primary relative flex min-h-screen flex-col pb-12"
    >
      <div className="flex h-14 items-center justify-center">
        <div className="h-5 w-28 animate-pulse rounded bg-gray-200" />
      </div>
      <ul className="flex flex-col items-center gap-4 px-4 pb-4">
        {[0, 1, 2].map((i) => (
          <li key={i} className="w-full">
            <div className="h-[180px] w-full animate-pulse rounded-2xl bg-gray-200" />
            <div className="mt-2 flex flex-col gap-1.5 px-0.5">
              <div className="h-3.5 w-2/3 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
