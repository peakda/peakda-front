import { Nav } from '@/components/ui/layout/Nav'

// FeedClient 레이아웃(헤더 → 탭 → 카드 목록)을 그대로 따른다.
function FeedCardSkeleton() {
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

export default function Loading() {
  return (
    <div
      aria-busy="true"
      aria-label="피드 불러오는 중"
      className="bg-bg-primary relative flex min-h-screen flex-col pb-24"
    >
      <div className="flex h-14 items-center px-4">
        <div className="h-6 w-12 animate-pulse rounded bg-gray-200" />
      </div>

      <div className="border-border-primary flex gap-1 border-b px-4 py-2">
        <div className="h-7 w-16 animate-pulse rounded-full bg-gray-200" />
        <div className="h-7 w-20 animate-pulse rounded-full bg-gray-100" />
        <div className="h-7 w-16 animate-pulse rounded-full bg-gray-100" />
      </div>

      <div className="divide-border-primary divide-y">
        <FeedCardSkeleton />
        <FeedCardSkeleton />
      </div>

      <Nav activeTab="feed" />
    </div>
  )
}
