'use client'

import { useCurrentUser } from '@/api/facades/auth'
import MainMessage from '@/components/ui/MainMessage'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AuthCallbackPage() {
  const router = useRouter()

  const { data, isLoading } = useCurrentUser()

  useEffect(() => {
    if (isLoading) return
    if (data) router.replace('/map')
    else router.replace('/Terms')
  }, [data, isLoading, router])
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-11 transition-opacity duration-500">
      <MainMessage />
    </div>
  )
}
