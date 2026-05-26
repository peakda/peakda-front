import Button from '@/components/ui/button/Button'
import { Avatar } from '@/components/ui/display/Avatar'
import { UserProps } from '../page'

interface Props {
  user: UserProps
}

export default function UserList({ user }: Props) {
  return (
    <li key={user.id} className="flex items-center gap-3 px-4 py-3">
      <Avatar size="md" />
      <div className="flex flex-1 flex-col gap-0.5">
        <span className="text-sm font-semibold text-gray-800">{user.name}</span>
        <span className="text-xs text-gray-400">{user.stats}</span>
      </div>
      <Button
        variant={user.following ? 'filled' : 'outlined'}
        color={user.following ? 'primary' : 'default'}
        size="sm"
        className="rounded-lg"
      >
        {user.following ? '팔로우' : '팔로잉'}
      </Button>
    </li>
  )
}
