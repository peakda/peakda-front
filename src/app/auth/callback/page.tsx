'use client'

import { getCurrentUserApi } from '@/api/facades/auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    getCurrentUserApi()
      .then(() => {
        router.replace('/map')
      })
      .catch(() => {
        router.replace('/Terms')
      })
  }, [router])

  return null
}
