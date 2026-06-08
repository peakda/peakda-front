'use client'

import { useState } from 'react'
import Button from '@/components/ui/button/Button'

interface Props {
  initialFollowing?: boolean
}

export function FollowButton({ initialFollowing = false }: Props) {
  const [following, setFollowing] = useState(initialFollowing)

  return following ? (
    <Button variant="outlined" color="primary" size="sm" onClick={() => setFollowing(false)}>
      팔로잉
    </Button>
  ) : (
    <Button variant="filled" color="primary" size="sm" onClick={() => setFollowing(true)}>
      팔로우
    </Button>
  )
}
