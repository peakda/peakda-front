'use client'

import Header from '@/components/ui/layout/Header'
import LeftArrow from '@/components/ui/button/LeftArrow'
import { UserRow } from '@/components/ui/list/UserRow'
import { useCurrentUser } from '@/api/facades/auth'
import { useFollowerList } from '@/api/facades/user-follow'

function FollowerList({ userId }: { userId: number }) {
  const { data } = useFollowerList(userId, { pageRequest: { page: 0, size: 50 } })
  const users = data?.content ?? []

  if (users.length === 0) {
    return <p className="text-text-secondary py-12 text-center text-sm">팔로워가 없습니다.</p>
  }

  return (
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
  )
}

export default function FollowersPage() {
  const { data: me } = useCurrentUser()

  return (
    <div className="bg-bg-primary relative flex min-h-screen flex-col pb-12">
      <div className="h-14">
        <Header
          left={<LeftArrow />}
          center={<div className="text-[15px] font-medium text-[#000000]">팔로워</div>}
        />
      </div>

      {me?.id != null && <FollowerList userId={me.id} />}
    </div>
  )
}
