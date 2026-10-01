// 상위 spot/[id]/loading.tsx 가 이 하위 화면에도 적용되므로, 방문자 기록 목록 모양으로 덮어쓴다.
export default function Loading() {
  return (
    <div
      aria-busy="true"
      aria-label="방문자 기록 불러오는 중"
      className="bg-bg-primary relative flex min-h-screen flex-col pb-12"
    >
      <div className="flex h-14 items-center justify-center">
        <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="divide-border-primary divide-y">
        {[0, 1].map((i) => (
          <div key={i} className="flex flex-col gap-3 px-4 py-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
              <div className="flex flex-col gap-1.5">
                <div className="h-3.5 w-24 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-32 animate-pulse rounded bg-gray-100" />
              </div>
            </div>
            <div className="h-[240px] w-full animate-pulse rounded-2xl bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  )
}
