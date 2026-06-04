import Image from 'next/image'
import { FollowButton } from '@/components/ui/button/FollowButton'

interface Props {
  name: string
  initialFollowing?: boolean
}

export function UserRow({ name, initialFollowing = false }: Props) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200">
        <Image src="/icons/person.svg" alt="프로필" width={18} height={18} />
      </div>
      <span className="text-text-primary flex-1 text-base font-medium">{name}</span>
      <FollowButton initialFollowing={initialFollowing} />
    </div>
  )
}
