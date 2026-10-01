// FeedListItem 한 장 모양의 자리표시. 첫 진입(loading.tsx)과 탭 전환 로딩(FeedClient)이 같이 쓴다.
export function FeedCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 px-4 py-4">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
        <div className="flex flex-1 flex-col gap-1.5">
          <div className="h-3.5 w-24 animate-pulse rounded bg-gray-200" />
          <div className="h-3 w-32 animate-pulse rounded bg-gray-100" />
        </div>
      </div>
      <div className="h-[240px] w-full animate-pulse rounded-2xl bg-gray-200" />
      <div className="flex flex-col gap-2">
        <div className="h-3.5 w-full animate-pulse rounded bg-gray-100" />
        <div className="h-3.5 w-2/3 animate-pulse rounded bg-gray-100" />
      </div>
    </div>
  )
}
