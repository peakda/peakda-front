import Link from 'next/link'
import { FollowButton } from '@/components/ui/button/FollowButton'
import { Avatar } from '@/components/ui/display/Avatar'
import { UserProps } from './UserPanel'

interface Props {
  user: UserProps
}

export function UserList({ user }: Props) {
  return (
    <li key={user.id} className="flex items-center gap-3 px-4 py-3">
      <Link href={`/users/${user.id}`} className="flex min-w-0 flex-1 items-center gap-3">
        <Avatar imageUrl={user.imageUrl} size="md" />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-sm font-semibold text-gray-800">{user.name}</span>
          <span className="text-xs text-gray-400">{user.stats}</span>
        </div>
      </Link>
      {/* 검색 응답에 following 이 아직 없어 항상 '팔로우'로 시작한다(새로고침 시 초기화) */}
      <FollowButton userId={user.id} initialFollowing={user.following} />
    </li>
  )
}
