export function RecordSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="기록 작성 화면 불러오는 중"
      className="flex min-h-screen flex-col bg-white"
    >
      <div className="h-14 border-b border-gray-100 px-4 py-3">
        <div className="h-6 w-24 animate-pulse rounded bg-gray-200" />
      </div>

      <div className="flex flex-1 flex-col gap-6 px-4 pt-6">
        <div className="flex flex-col gap-2">
          <div className="h-6 w-2/3 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
        </div>

        <div className="flex flex-col gap-2">
          <div className="h-4 w-16 animate-pulse rounded bg-gray-100" />
          <div className="h-12 w-full animate-pulse rounded-3xl bg-gray-100" />
        </div>

        <div className="flex flex-col gap-2">
          <div className="h-4 w-16 animate-pulse rounded bg-gray-100" />
          <div className="h-24 w-24 animate-pulse rounded-xl bg-gray-100" />
        </div>

        <div className="flex flex-col gap-2">
          <div className="h-4 w-20 animate-pulse rounded bg-gray-100" />
          <div className="h-12 w-full animate-pulse rounded-3xl bg-gray-100" />
        </div>
      </div>

      <div className="p-4 pb-8">
        <div className="h-12 w-full animate-pulse rounded-2xl bg-gray-200" />
      </div>
    </div>
  )
}
