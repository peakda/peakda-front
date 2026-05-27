import IconBtn from '@/components/ui/button/IconBtn'
import UserList from '@/app/search/_components/UserList'
import Image from 'next/image'

export interface UserProps {
  id: number
  name: string
  stats: string
  following: boolean
}

interface Props {
  users: UserProps[]
}

export function UserPanel({ users }: Props) {
  if (users.length === 0) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-2 py-6 text-center">
        <IconBtn className="h-18 w-18">
          <Image src="./icons/person.svg" alt="사람 아이콘" width={40} height={40} />
        </IconBtn>
        <p className="text-text-primary text-lg font-semibold">검색되는 유저가 없어요</p>
        <p className="text-text-tertiary text-base">
          닉네임의 일부로 검색하거나 <br /> 탐색 탭에서 추천 유저를 둘러보세요
        </p>
      </div>
    )
  }

  return (
    <ul className="divide-y divide-gray-100">
      {users.map((user) => (
        <UserList user={user} key={user.id} />
      ))}
    </ul>
  )
}
