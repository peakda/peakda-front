// FeedDetailView 레이아웃(풀블리드 사진 → 작성자 → 스팟 요약 → 꽃 태그 → 본문 → 리액션)을 따른다.
export default function Loading() {
  return (
    <div
      aria-busy="true"
      aria-label="기록 불러오는 중"
      className="bg-bg-primary relative flex min-h-screen flex-col pb-12"
    >
      <div className="flex flex-col gap-3">
        <div className="aspect-[4/3] w-full animate-pulse bg-gray-200" />

        <div className="flex items-center gap-2 px-4">
          <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
          <div className="flex flex-col gap-1.5">
            <div className="h-3.5 w-28 animate-pulse rounded bg-gray-200" />
            <div className="h-3 w-36 animate-pulse rounded bg-gray-100" />
          </div>
        </div>

        <div className="border-border-primary flex items-center justify-between gap-2 border-y px-4 py-3.5">
          <div className="flex flex-col gap-1.5">
            <div className="h-3.5 w-32 animate-pulse rounded bg-gray-200" />
            <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
          </div>
          <div className="h-5 w-5 animate-pulse rounded bg-gray-100" />
        </div>

        <div className="flex gap-2 px-4">
          <div className="h-7 w-20 animate-pulse rounded-full bg-gray-100" />
          <div className="h-7 w-16 animate-pulse rounded-full bg-gray-100" />
        </div>

        <div className="flex flex-col gap-2 px-4">
          <div className="h-3.5 w-full animate-pulse rounded bg-gray-100" />
          <div className="h-3.5 w-full animate-pulse rounded bg-gray-100" />
          <div className="h-3.5 w-1/2 animate-pulse rounded bg-gray-100" />
        </div>

        <div className="px-4">
          <div className="h-8 w-8 animate-pulse rounded-full bg-gray-100" />
        </div>
      </div>
    </div>
  )
}
