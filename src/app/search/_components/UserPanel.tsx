import { IconBtn } from '@/components/ui/button/IconBtn'
import { UserList } from '@/app/search/_components/UserList'
import { InfiniteScrollFooter } from '@/components/ui/display/InfiniteScrollFooter'
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
  // 목록 하단에 닿았을 때 다음 페이지를 부른다. hasMore 가 false 면 관찰하지 않는다.
  onLoadMore?: () => void
  hasMore?: boolean
  // hasMore 는 로딩 중에 false 가 되므로 스피너 표시 여부는 따로 받는다.
  isLoadingMore?: boolean
}

export function UserPanel({ users, onLoadMore, hasMore = false, isLoadingMore = false }: Props) {
  const sentinelRef = useInfiniteScroll(() => onLoadMore?.(), hasMore)

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
        {users.map((user) => (
          <UserList user={user} key={user.id} />
        ))}
      </ul>
      <InfiniteScrollFooter sentinelRef={sentinelRef} isLoading={isLoadingMore} />
    </>
  )
}
