// SpotDetailClient 레이아웃(대표 이미지 → 제목·위치 → 만개 시기 → 방문자 기록 → 하단 CTA)을 따른다.
export default function Loading() {
  return (
    <div
      aria-busy="true"
      aria-label="명소 불러오는 중"
      className="bg-bg-primary relative flex min-h-screen flex-col pb-28"
    >
      <div className="h-64 w-full animate-pulse bg-gray-200" />

      <div className="flex flex-col gap-6 px-4 pt-4 pb-6">
        <div className="flex flex-col gap-2">
          <div className="h-6 w-2/3 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
          <div className="h-3 w-40 animate-pulse rounded bg-gray-100" />
          <div className="h-7 w-20 animate-pulse rounded-full bg-gray-100" />
        </div>

        <div className="flex flex-col gap-2">
          <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
          <div className="h-11 w-full animate-pulse rounded-xl bg-gray-100" />
          <div className="h-3 w-36 animate-pulse rounded bg-gray-100" />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between px-4 pt-4">
          <div className="h-5 w-28 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-10 animate-pulse rounded bg-gray-100" />
        </div>
        <div className="flex flex-col gap-3 px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
            <div className="h-3.5 w-24 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="h-[240px] w-full animate-pulse rounded-2xl bg-gray-200" />
        </div>
      </div>

      <div className="fixed right-0 bottom-0 left-0 z-10 mx-auto flex max-w-107.5 items-center gap-3 border-t border-gray-100 bg-white px-4 py-3">
        <div className="h-12 w-12 shrink-0 animate-pulse rounded-xl bg-gray-100" />
        <div className="h-12 flex-1 animate-pulse rounded-xl bg-gray-200" />
      </div>
    </div>
  )
}
