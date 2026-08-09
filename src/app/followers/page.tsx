'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/ui/layout/Header'
import { LeftArrow } from '@/components/ui/button/LeftArrow'
import { UserRow } from '@/components/ui/list/UserRow'
import { InfiniteScrollFooter } from '@/components/ui/display/InfiniteScrollFooter'
import { useCurrentUser } from '@/api/facades/auth'
import { useFollowerListInfinite } from '@/api/facades/user-follow'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { flattenPages } from '@/lib/utils/infinitePages'
import { shouldLoadMore } from '@/lib/utils/myRecords'

function FollowerList({ userId }: { userId: number }) {
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useFollowerListInfinite(userId)
  const users = flattenPages(data)
  const sentinelRef = useInfiniteScroll(
    () => fetchNextPage(),
    shouldLoadMore(hasNextPage, isFetchingNextPage)
  )

  if (!isLoading && users.length === 0) {
    return <p className="text-text-secondary py-12 text-center text-sm">팔로워가 없습니다.</p>
  }

  return (
    <>
      <ul>
        {users.map((user) => (
          <UserRow
            key={user.userId}
            userId={user.userId}
            name={user.nickname}
            profileImageUrl={user.profileImageUrl}
            initialFollowing={user.following}
          />
        ))}
      </ul>
      <InfiniteScrollFooter sentinelRef={sentinelRef} isLoading={isFetchingNextPage} />
    </>
  )
}

function FollowersContent() {
  // ?userId 가 있으면 그 유저의 팔로워, 없으면 내 팔로워를 본다.
  const param = Number(useSearchParams().get('userId'))
  const { data: me } = useCurrentUser()
  const userId = param > 0 ? param : me?.id

  return (
    <div className="bg-bg-primary relative flex min-h-screen flex-col pb-12">
      <div className="h-14">
        <Header
          left={<LeftArrow />}
          center={<div className="text-[15px] font-medium text-[#000000]">팔로워</div>}
        />
      </div>

      {userId != null && <FollowerList userId={userId} />}
    </div>
  )
}

// useSearchParams 는 App Router 에서 Suspense 경계가 필요하다.
export default function FollowersPage() {
  return (
    <Suspense fallback={null}>
      <FollowersContent />
    </Suspense>
  )
}
