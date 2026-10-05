'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Header } from '@/components/ui/layout/Header'
import { Nav } from '@/components/ui/layout/Nav'
import { CategoryChip } from '@/components/ui/category/CategoryChip'
import { FeedListItem } from '@/components/ui/card/FeedListItem'
import { LazyDrawer } from '@/components/ui/layout/LazyDrawer'
import { InfiniteScrollFooter } from '@/components/ui/display/InfiniteScrollFooter'
import { QueryFeedback } from '@/components/ui/display/QueryFeedback'
import { FeedCardSkeleton } from '@/app/feed/_components/FeedCardSkeleton'
import { useFeedListInfinite } from '@/api/facades/feed'
import { useCurrentUser } from '@/api/facades/auth'
import { useDeleteSpotRecord } from '@/api/facades/spot-record'
import { useDrawerStore } from '@/stores/useDrawerStore'
import { useFeedTabStore } from '@/stores/useFeedTabStore'
import { useIsLoggedIn } from '@/hooks/useIsLoggedIn'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { useRequireLogin } from '@/hooks/useRequireLogin'
import { filterFromTab } from '@/lib/utils/feed'
import { GetFeedFilter } from '@/api/facades/generated/peakdaApi.schemas'
import type { PageResponseSpotRecordSummaryResponse } from '@/api/facades/generated/peakdaApi.schemas'
import { flattenPages } from '@/lib/utils/infinitePages'
import { shouldLoadMore } from '@/lib/utils/myRecords'
import { track } from '@/lib/analytics'

const FEED_CATEGORIES = ['전체', '관심 식물', '팔로잉']

interface FeedClientProps {
  // 서버에서 받은 '전체' 탭 첫 페이지. 조회 실패(API 장애 등)면 null 이고 클라이언트가 다시 조회한다.
  initialPage: PageResponseSpotRecordSummaryResponse | null
}

export function FeedClient({ initialPage }: FeedClientProps) {
  const router = useRouter()
  // 탭은 스토어에 둬서 기록 상세에 갔다 뒤로 와도 유지된다.
  // 로그인 상태로 '팔로잉'을 고른 채 로그아웃하면 스토어 값이 남으므로, 비로그인이면 '전체'로 본다.
  const isLoggedIn = useIsLoggedIn()
  const storedTab = useFeedTabStore((s) => s.tab)
  const setTab = useFeedTabStore((s) => s.setTab)
  const tab = isLoggedIn ? storedTab : FEED_CATEGORIES[0]
  const filter = filterFromTab(tab)

  const {
    data,
    isLoading,
    isError,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    fetchNextPage,
  } = useFeedListInfinite(
    filter,
    filter === GetFeedFilter.ALL ? (initialPage ?? undefined) : undefined
  )
  const records = flattenPages(data)
  const sentinelRef = useInfiniteScroll(
    () => fetchNextPage(),
    shouldLoadMore(hasNextPage, isFetchingNextPage, isFetchNextPageError)
  )

  // 탭마다 무한 쿼리 키가 달라 목록이 처음부터 다시 쌓인다.
  // 깊이 스크롤한 상태로 탭을 바꾸면 짧아진 목록의 sentinel 이 곧바로 보여 다음 페이지가 연쇄 로드되므로 맨 위로 올린다.
  // 비로그인은 전체 탭만 볼 수 있다(관심 식물·팔로잉은 서버가 401).
  const requireLogin = useRequireLogin()
  const handleTabClick = (cate: string) => {
    track('feed_tab_change', { tab: cate })
    const select = () => {
      setTab(cate)
      window.scrollTo({ top: 0 })
    }
    if (cate === FEED_CATEGORIES[0]) select()
    else requireLogin(select)
  }

  const { data: currentUser } = useCurrentUser()
  const { mutate: deleteRecord } = useDeleteSpotRecord()
  const openDeleteConfirmDrawer = useDrawerStore((s) => s.openDeleteConfirmDrawer)

  // 아이템에 넘기는 콜백은 참조가 고정돼야 FeedListItem 의 memo 가 동작한다.
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
              <button
                type="button"
                aria-label="검색"
                className="cursor-pointer"
                onClick={() => router.push('/search')}
              >
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
        // 탭을 바꾸면 목록이 처음부터 다시 쌓인다. 글자 한 줄 대신 카드 모양으로 자리를 잡아 화면이 들썩이지 않게 한다.
        <div
          aria-busy="true"
          aria-label="피드 불러오는 중"
          className="divide-border-primary divide-y"
        >
          <FeedCardSkeleton />
          <FeedCardSkeleton />
        </div>
      ) : isError && records.length === 0 ? (
        <QueryFeedback state="error" onRetry={() => void refetch()} />
      ) : records.length === 0 ? (
        <p className="text-text-tertiary py-10 text-center text-sm">아직 피드가 없어요</p>
      ) : (
        <>
          <div className="divide-border-primary divide-y">
            {records.map((record, idx) => (
              <FeedListItem
                key={record.id}
                record={record}
                priority={idx === 0}
                isOwner={record.user.id === currentUser?.id}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
          <InfiniteScrollFooter
            sentinelRef={sentinelRef}
            isLoading={isFetchingNextPage}
            onRetry={isFetchNextPageError ? () => void fetchNextPage() : undefined}
          />
        </>
      )}

      <LazyDrawer />
      <Nav activeTab="feed" />
    </div>
  )
}
