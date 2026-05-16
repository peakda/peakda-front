'use client'

import { getCurrentUserApi } from '@/api/facades/auth'
import MainMessage from '@/components/ui/MainMessage'
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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-11 transition-opacity duration-500">
      <MainMessage />
    </div>
  )
}
