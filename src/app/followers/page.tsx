import Header from '@/components/ui/layout/Header'
import LeftArrow from '@/components/ui/button/LeftArrow'
import { UserRow } from '@/components/ui/list/UserRow'

const FOLLOWERS = [
  { name: '닉네임', initialFollowing: false },
  { name: '닉네임', initialFollowing: true },
  { name: '닉네임', initialFollowing: false },
  { name: '닉네임', initialFollowing: false },
  { name: '닉네임', initialFollowing: true },
  { name: '닉네임', initialFollowing: false },
]

export default function FollowersPage() {
  return (
    <div className="bg-bg-primary relative flex min-h-screen flex-col pb-12">
      <div className="h-14">
        <Header
          left={<LeftArrow />}
          center={<div className="text-[15px] font-medium text-[#000000]">팔로워</div>}
        />
      </div>

      <ul>
        {FOLLOWERS.map((user, idx) => (
          <UserRow key={idx} {...user} />
        ))}
      </ul>
    </div>
  )
}
