import Image from 'next/image'
import Link from 'next/link'
import { FollowButton } from '@/components/ui/button/FollowButton'

interface Props {
  userId?: number
  name: string
  profileImageUrl?: string | null
  initialFollowing?: boolean
}

export function UserRow({ userId, name, profileImageUrl, initialFollowing = false }: Props) {
  const profile = (
    <>
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200">
        {profileImageUrl ? (
          <Image src={profileImageUrl} alt={name} fill className="object-cover" sizes="40px" />
        ) : (
          <Image src="/icons/person.svg" alt="프로필" width={18} height={18} />
        )}
      </div>
      <span className="text-text-primary min-w-0 flex-1 truncate text-base font-medium">{name}</span>
    </>
  )

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      {userId != null ? (
        <Link href={`/users/${userId}`} className="flex min-w-0 flex-1 items-center gap-3">
          {profile}
        </Link>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-3">{profile}</div>
      )}
      <FollowButton userId={userId} initialFollowing={initialFollowing} />
    </div>
  )
}
