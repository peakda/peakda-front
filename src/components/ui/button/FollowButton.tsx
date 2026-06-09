'use client'

import { useState } from 'react'
import Button from '@/components/ui/button/Button'
import { useFollow, useUnfollow } from '@/api/facades/user-follow'

interface Props {
  userId?: number
  initialFollowing?: boolean
}

export function FollowButton({ userId, initialFollowing = false }: Props) {
  const [following, setFollowing] = useState(initialFollowing)
  const followMutation = useFollow()
  const unfollowMutation = useUnfollow()

  // 낙관적 토글 + userId 가 있으면 실제 mutation 호출(실패 시 원복). userId 없으면 로컬 토글만.
  const handleToggle = () => {
    const next = !following
    setFollowing(next)
    if (userId === undefined) return

    const mutation = next ? followMutation : unfollowMutation
    mutation.mutate({ userId }, { onError: () => setFollowing(!next) })
  }

  return following ? (
    <Button variant="outlined" color="primary" size="sm" onClick={handleToggle}>
      팔로잉
    </Button>
  ) : (
    <Button variant="filled" color="primary" size="sm" onClick={handleToggle}>
      팔로우
    </Button>
  )
}
