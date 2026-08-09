'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Header } from '@/components/ui/layout/Header'
import { Nav } from '@/components/ui/layout/Nav'
import { CategoryChip } from '@/components/ui/category/CategoryChip'
import { FeedListItem } from '@/components/ui/card/FeedListItem'
import { Drawer } from '@/components/ui/layout/Drawer'
import { InfiniteScrollFooter } from '@/components/ui/display/InfiniteScrollFooter'
import { useFeedListInfinite } from '@/api/facades/feed'
import { useCurrentUser } from '@/api/facades/auth'
import { useDeleteSpotRecord } from '@/api/facades/spot-record'
import { useDrawerStore } from '@/stores/useDrawerStore'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { filterFromTab } from '@/lib/utils/feed'
import { flattenPages } from '@/lib/utils/infinitePages'
import { shouldLoadMore } from '@/lib/utils/myRecords'

const FEED_CATEGORIES = ['전체', '관심 식물', '팔로잉']

export default function FeedPage() {
  const router = useRouter()
  const [tab, setTab] = useState(FEED_CATEGORIES[0])

  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useFeedListInfinite(
    filterFromTab(tab)
  )
  const records = flattenPages(data)
  const sentinelRef = useInfiniteScroll(
    () => fetchNextPage(),
    shouldLoadMore(hasNextPage, isFetchingNextPage)
  )

  // 탭마다 무한 쿼리 키가 달라 목록이 처음부터 다시 쌓인다.
  // 깊이 스크롤한 상태로 탭을 바꾸면 짧아진 목록의 sentinel 이 곧바로 보여 다음 페이지가 연쇄 로드되므로 맨 위로 올린다.
  const handleTabClick = (cate: string) => {
    setTab(cate)
    window.scrollTo({ top: 0 })
  }

  const { data: currentUser } = useCurrentUser()
  const { mutate: deleteRecord } = useDeleteSpotRecord()
  const openDeleteConfirmDrawer = useDrawerStore((s) => s.openDeleteConfirmDrawer)

  // 아이템에 넘기는 콜백은 참조가 고정돼야 FeedListItem 의 memo 가 동작한다.
  const handleOpen = useCallback((id: number) => router.push(`/feed/${id}`), [router])
  const handleEdit = useCallback((id: number) => router.push(`/record/${id}/edit`), [router])
  const handleDelete = useCallback(
    (id: number) => openDeleteConfirmDrawer(() => deleteRecord({ id })),
    [openDeleteConfirmDrawer, deleteRecord]
  )

  return (
    <div className="bg-bg-primary relative flex min-h-screen flex-col pb-24">
      <div className="h-14">
        <Header
          left={<div className="text-text-primary text-xl font-semibold">피드</div>}
          right={
            <div className="flex items-center gap-3">
              <button type="button" aria-label="검색" className="cursor-pointer" onClick={() => router.push('/search')}>
                <Image src="/icons/search.svg" alt="검색" width={22} height={22} />
              </button>
            </div>
          }
        />
      </div>

      {/* 카테고리 탭 */}
      <div className="border-border-primary bg-bg-primary sticky top-0 z-10 flex gap-1 border-b px-4 py-2">
        {FEED_CATEGORIES.map((cate) => (
          <CategoryChip
            key={cate}
            label={cate}
            selected={tab}
            onClick={() => handleTabClick(cate)}
            className="w-auto px-3"
          />
        ))}
      </div>

      {/* 피드 목록 */}
      {isLoading ? (
        <p className="text-text-tertiary py-10 text-center text-sm">불러오는 중...</p>
      ) : records.length === 0 ? (
        <p className="text-text-tertiary py-10 text-center text-sm">아직 피드가 없어요</p>
      ) : (
        <>
          <div className="divide-border-primary divide-y">
            {records.map((record) => (
              <FeedListItem
                key={record.id}
                record={record}
                isOwner={record.user.id === currentUser?.id}
                onOpen={handleOpen}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
          <InfiniteScrollFooter sentinelRef={sentinelRef} isLoading={isFetchingNextPage} />
        </>
      )}

      <Drawer />
      <Nav activeTab="feed" />
    </div>
  )
}
