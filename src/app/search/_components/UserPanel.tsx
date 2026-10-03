import { IconBtn } from '@/components/ui/button/IconBtn'
import { UserList } from '@/app/search/_components/UserList'
import { InfiniteScrollFooter } from '@/components/ui/display/InfiniteScrollFooter'
import { QueryFeedback } from '@/components/ui/display/QueryFeedback'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import Image from 'next/image'

export interface UserProps {
  id: number
  name: string
  stats: string
  following: boolean
  // 프로필 이미지. 없으면 기본 아이콘
  imageUrl?: string | null
}

interface Props {
  users: UserProps[]
  // 결과를 눌러 프로필로 갈 때. position 은 0부터
  onOpenUser?: (userId: number, position: number) => void
  isLoginRequired?: boolean
  onLogin?: () => void
  // 목록 하단에 닿았을 때 다음 페이지를 부른다. hasMore 가 false 면 관찰하지 않는다.
  onLoadMore?: () => void
  hasMore?: boolean
  // hasMore 는 로딩 중에 false 가 되므로 스피너 표시 여부는 따로 받는다.
  isLoadingMore?: boolean
  // 다음 페이지 요청이 실패했을 때만 넘긴다. 하단에 다시 시도 버튼을 띄운다.
  onRetryMore?: () => void
  isLoading?: boolean
  isError?: boolean
  onRetry?: () => void
}

export function UserPanel({
  users,
  onOpenUser,
  isLoginRequired = false,
  onLogin,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
  onRetryMore,
  isLoading = false,
  isError = false,
  onRetry,
}: Props) {
  const sentinelRef = useInfiniteScroll(() => onLoadMore?.(), hasMore)

  if (isLoginRequired) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-text-primary text-lg font-semibold">유저 검색은 로그인이 필요해요</p>
        <button
          type="button"
          onClick={onLogin}
          className="bg-brand-secondary rounded-3xl px-5 py-3 text-sm font-medium text-white"
        >
          로그인하기
        </button>
      </div>
    )
  }

  if (isLoading) return <QueryFeedback state="loading" />
  if (isError && users.length === 0) return <QueryFeedback state="error" onRetry={onRetry} />

  if (users.length === 0) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-2 py-6 text-center">
        <IconBtn className="h-18 w-18">
          <Image src="/icons/person.svg" alt="사람 아이콘" width={40} height={40} />
        </IconBtn>
        <p className="text-text-primary text-lg font-semibold">검색되는 유저가 없어요</p>
        <p className="text-text-tertiary text-base">
          닉네임의 일부로 검색하거나 <br /> 탐색 탭에서 추천 유저를 둘러보세요
        </p>
      </div>
    )
  }

  return (
    <>
      <ul className="divide-y divide-gray-100">
        {users.map((user, idx) => (
          <UserList user={user} key={user.id} onOpen={() => onOpenUser?.(user.id, idx)} />
        ))}
      </ul>
      <InfiniteScrollFooter
        sentinelRef={sentinelRef}
        isLoading={isLoadingMore}
        onRetry={onRetryMore}
      />
    </>
  )
}
