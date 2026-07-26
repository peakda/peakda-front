'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button/Button'
import { useBlockedList, useUnblockUser } from '@/api/facades/user-block'
import { toBlockedRow } from '@/lib/utils/userProfile'

export function BlockedUsersSection() {
  const { data } = useBlockedList({ pageRequest: { page: 0, size: 20 } })
  const unblockMutation = useUnblockUser()
  const rows = (data?.content ?? []).map(toBlockedRow)

  return (
    <>
      <p className="text-text-tertiary px-4 pt-5 pb-1 text-sm">차단한 사용자</p>
      {rows.length === 0 ? (
        <p className="text-text-tertiary px-4 py-3.5 text-sm">차단한 사용자가 없어요</p>
      ) : (
        rows.map((row) => (
          <div key={row.userId} className="flex items-center gap-3 px-4 py-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200">
              {row.profileImageUrl ? (
                <Image
                  src={row.profileImageUrl}
                  alt="프로필"
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Image src="/icons/person.svg" alt="프로필" width={20} height={20} />
              )}
            </div>
            <div className="flex flex-1 flex-col">
              <span className="text-text-primary text-base">{row.nickname}</span>
              <span className="text-text-tertiary text-sm">{row.blockedAtLabel} 차단</span>
            </div>
            <Button
              variant="outlined"
              size="sm"
              onClick={() => unblockMutation.mutate({ userId: row.userId })}
            >
              차단 해제
            </Button>
          </div>
        ))
      )}
    </>
  )
}
