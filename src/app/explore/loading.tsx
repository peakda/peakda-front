import { Nav } from '@/components/ui/layout/Nav'

// ExploreClient 레이아웃(헤더 → 검색창 → 가로 카드 섹션 / 세로 리스트 섹션)을 따른다.
function CardRowSkeleton() {
  return (
    <section className="mt-2">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="h-6 w-40 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-8 animate-pulse rounded bg-gray-100" />
      </div>
      <div className="flex gap-3 overflow-hidden px-4 pb-4">
        {[0, 1].map((i) => (
          <div key={i} className="w-[72%] shrink-0">
            <div className="h-[180px] w-full animate-pulse rounded-2xl bg-gray-200" />
            <div className="mt-2 flex flex-col gap-1.5 px-0.5">
              <div className="h-3.5 w-2/3 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function Loading() {
  return (
    <div
      aria-busy="true"
      aria-label="탐색 불러오는 중"
      className="relative flex min-h-screen w-full flex-col bg-white pb-24"
    >
      <div className="flex h-14 items-center justify-between px-4">
        <div className="h-6 w-12 animate-pulse rounded bg-gray-200" />
        <div className="h-5 w-14 animate-pulse rounded bg-gray-100" />
      </div>

      <div className="px-4">
        <div className="h-11 w-full animate-pulse rounded-3xl bg-gray-100" />
      </div>

      <CardRowSkeleton />

      <section className="mt-2">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="h-6 w-44 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-8 animate-pulse rounded bg-gray-100" />
        </div>
        <ul className="divide-y divide-gray-100">
          {[0, 1].map((i) => (
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
      </section>

      <CardRowSkeleton />

      <Nav activeTab="explore" />
    </div>
  )
}
