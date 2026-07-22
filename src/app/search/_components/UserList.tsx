import Link from 'next/link'
import { Button } from '@/components/ui/button/Button'
import { Avatar } from '@/components/ui/display/Avatar'
import { UserProps } from './UserPanel'

interface Props {
  user: UserProps
}

export function UserList({ user }: Props) {
  return (
    <li key={user.id} className="flex items-center gap-3 px-4 py-3">
      <Link href={`/users/${user.id}`} className="flex min-w-0 flex-1 items-center gap-3">
        <Avatar size="md" />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-sm font-semibold text-gray-800">{user.name}</span>
          <span className="text-xs text-gray-400">{user.stats}</span>
        </div>
      </Link>
      <Button
        variant={'outlined'}
        color={user.following ? 'selected' : 'default'}
        size="sm"
        className="rounded-lg"
      >
        {user.following ? '팔로잉' : '팔로우'}
      </Button>
    </li>
  )
}
